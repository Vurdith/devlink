import { NextRequest, NextResponse } from "next/server";
import { getAuthSession } from "@/server/auth";
import { prisma } from "@/server/db";
import type { Prisma } from "@prisma/client";
import { parseContent } from "@/lib/content-parser";
import { CONTENT_LIMITS, COLLECTION_LIMITS } from "@/constants";
import { checkRateLimit } from "@/server/rate-limit";
import { createNotification } from "@/server/notifications";
import { evaluatePostingAnomaly } from "@/server/security/anomaly-detection";
import { deriveDeviceFingerprint } from "@/server/security/fingerprint";
import { indexSearchDocumentWithRust } from "@/server/services/hotpath-client";
import { attachPostEngagement, fetchPostEngagementSummary, getPostPollIds } from "@/server/posts/post-engagement";
import { postListSelect } from "@/server/posts/post-selects";

export async function POST(request: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session?.user?.username) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Rate limiting: 10 posts per minute per user
    // Uses Redis if configured, falls back to memory
    const userId = session.user.id;
    const rateLimit = await checkRateLimit(`post_create:${userId}`, 10, 60);
    
    if (!rateLimit.success) {
      const resetTime = new Date(rateLimit.reset).toLocaleTimeString();
      return NextResponse.json({ 
        error: `Rate limit exceeded. Please wait until ${resetTime} before posting again.` 
      }, { status: 429 });
    }

    const anomaly = await evaluatePostingAnomaly({ actorId: userId });
    if (anomaly.suspicious) {
      const fingerprint = deriveDeviceFingerprint(request);
      console.warn("[Security] Suspicious posting behavior detected", {
        userId,
        fingerprint,
        reasons: anomaly.reasons,
        score: anomaly.score,
      });
    }

    const body = await request.json();
    
    const { 
      content, 
      mediaUrls, 
      replyToId, 
      pollData, 
      isSlideshow,
      location: locationInput,
      embedUrls: embedUrlsInput,
      scheduledFor: scheduledForInput
    } = body;

    // Input validation and sanitization
    if (content && typeof content !== 'string') {
      return NextResponse.json({ error: "Invalid content" }, { status: 400 });
    }

    if ((content?.length || 0) > CONTENT_LIMITS.POST_MAX_LENGTH) {
      return NextResponse.json({ error: `Content must be less than ${CONTENT_LIMITS.POST_MAX_LENGTH} characters` }, { status: 400 });
    }

    // Require at least one of: content, media, poll, embeds
    const hasAnyContent = (content && content.trim().length > 0) || (Array.isArray(mediaUrls) && mediaUrls.length > 0) || !!pollData || (Array.isArray(embedUrlsInput) && embedUrlsInput.length > 0);
    if (!hasAnyContent) {
      return NextResponse.json({ error: "Post must include text, media, poll, or an embed link." }, { status: 400 });
    }

    // Sanitize content using proper HTML sanitizer
    const { sanitizeContent, sanitizeLocation } = await import("@/lib/sanitize");
    const sanitizedContent = sanitizeContent(content || "");

    // Location validation
    let location: string | null = null;
    if (typeof locationInput === 'string' && locationInput.trim().length > 0) {
      if (locationInput.length > CONTENT_LIMITS.LOCATION_MAX_LENGTH) {
        return NextResponse.json({ error: `Location must be ${CONTENT_LIMITS.LOCATION_MAX_LENGTH} characters or less` }, { status: 400 });
      }
      location = sanitizeLocation(locationInput);
    }

    // Embed URLs validation (limit 5)
    let embedUrls: string[] | null = null;
    if (embedUrlsInput && Array.isArray(embedUrlsInput)) {
      const cleaned: string[] = [];
      for (const u of embedUrlsInput) {
        if (typeof u !== 'string') continue;
        const url = u.trim();
        if (!url) continue;
        try {
          const parsed = new URL(url);
          if (!['http:', 'https:'].includes(parsed.protocol)) {
            return NextResponse.json({ error: `Invalid embed URL protocol: ${url}` }, { status: 400 });
          }
          cleaned.push(url);
        } catch {
          return NextResponse.json({ error: `Invalid embed URL: ${url}` }, { status: 400 });
        }
      }
      if (cleaned.length > 0) embedUrls = cleaned.slice(0, 5);
    }

    // Scheduling
    let isScheduled = false;
    let scheduledFor: Date | null = null;
    if (scheduledForInput) {
      const date = new Date(scheduledForInput);
      
      if (isNaN(date.getTime())) {
        return NextResponse.json({ error: "Invalid scheduledFor date" }, { status: 400 });
      }
      
      const now = new Date();
      const diffMinutes = (date.getTime() - now.getTime()) / (1000 * 60);
      
      if (diffMinutes >= 1) {
        isScheduled = true;
        scheduledFor = date;
      } else {
        return NextResponse.json({ error: "Scheduled time must be at least 1 minute in the future" }, { status: 400 });
      }
    }
    
    // Validate mediaUrls if provided
    if (mediaUrls && Array.isArray(mediaUrls)) {
      if (mediaUrls.length > COLLECTION_LIMITS.MAX_MEDIA_FILES) {
        return NextResponse.json({ error: `Maximum ${COLLECTION_LIMITS.MAX_MEDIA_FILES} media files allowed` }, { status: 400 });
      }
      
      for (const url of mediaUrls) {
        if (typeof url !== 'string' || url.trim().length === 0) {
          return NextResponse.json({ error: "Invalid media URL" }, { status: 400 });
        }
        if (!url.startsWith('/uploads/') && !url.startsWith('http')) {
          return NextResponse.json({ error: "Invalid media URL format" }, { status: 400 });
        }
      }
    }

    // Validate replyToId if provided
    if (replyToId && typeof replyToId !== 'string') {
      return NextResponse.json({ error: "Invalid reply ID" }, { status: 400 });
    }

    // If replying, resolve parent post + owner for notification and validate it exists
    let replyTarget: { id: string; userId: string } | null = null;
    if (replyToId) {
      replyTarget = await prisma.post.findUnique({
        where: { id: replyToId },
        select: { id: true, userId: true },
      });
      if (!replyTarget) {
        return NextResponse.json({ error: "Reply target not found" }, { status: 404 });
      }
    }

    // Get user ID
    const user = await prisma.user.findUnique({
      where: { username: session.user.username }
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Parse content for hashtags and mentions
    const parsedContent = parseContent(sanitizedContent);

    // Create post with basic fields
    const postData = {
      content: sanitizedContent,
      replyToId,
      userId: user.id,
      isSlideshow: isSlideshow || false,
      location: location || undefined,
      embedUrls: embedUrls ? JSON.stringify(embedUrls) : undefined,
      isScheduled,
      scheduledFor: scheduledFor || undefined
    };
    
    const post = await prisma.post.create({
      data: postData,
      include: {
        user: {
          select: {
            id: true,
            username: true,
            name: true,
            profile: {
              select: {
                avatarUrl: true,
                bannerUrl: true,
                profileType: true,
                verified: true,
                bio: true,
                website: true,
                location: true
              }
            }
          }
        }
      }
    });

    // Parallel processing for auxiliary data
    const promises = [];

    // Notifications: reply
    if (!isScheduled && replyTarget) {
      promises.push(
        createNotification({
          recipientId: replyTarget.userId,
          actorId: user.id,
          type: "REPLY",
          postId: replyTarget.id,
          sourcePostId: post.id,
          // Allow multiple replies; no dedupeKey.
        }).catch((e) => console.error("Reply notification error", e))
      );
    }

    // Hashtags - batch operation to avoid N+1
    if (parsedContent.hashtags.length > 0) {
      const hashtagPromise = (async () => {
        try {
          const uniqueHashtags = [...new Set(parsedContent.hashtags)];
          
          const existingHashtags = await prisma.hashtag.findMany({
            where: { name: { in: uniqueHashtags } },
            select: { id: true, name: true }
          });
          
          const existingNames = new Set(existingHashtags.map(h => h.name));
          const newHashtagNames = uniqueHashtags.filter(name => !existingNames.has(name));
          
          let allHashtags = [...existingHashtags];
          
          if (newHashtagNames.length > 0) {
            await prisma.hashtag.createMany({
              data: newHashtagNames.map(name => ({ name })),
              skipDuplicates: true
            });
            
            const newHashtags = await prisma.hashtag.findMany({
              where: { name: { in: newHashtagNames } },
              select: { id: true, name: true }
            });
            allHashtags = [...allHashtags, ...newHashtags];
          }
          
          await prisma.postHashtag.createMany({
            data: allHashtags.map(h => ({
              postId: post.id,
              hashtagId: h.id
            })),
            skipDuplicates: true
          });
        } catch (e) {
          console.error("Hashtag error", e);
        }
      })();
      promises.push(hashtagPromise);
    }

    // Mentions
    if (parsedContent.mentions.length > 0) {
      const mentionPromise = (async () => {
        try {
           // Resolve all usernames to IDs first
           const users = await prisma.user.findMany({
             where: { username: { in: parsedContent.mentions } },
             select: { id: true }
           });
           
           if (users.length > 0) {
             await prisma.postMention.createMany({
               data: users.map(u => ({
                 postId: post.id,
                 userId: u.id
               }))
             });

             if (!isScheduled) {
               await Promise.all(
                 users.map((u) =>
                   createNotification({
                     recipientId: u.id,
                     actorId: user.id,
                     type: "MENTION",
                     postId: post.id,
                     dedupeKey: `n:${u.id}:mention:${post.id}:${user.id}`,
                   }).catch((e) => console.error("Mention notification error", e))
                 )
               );
             }
           }
        } catch (e) {
          console.error("Mention error", e);
        }
      })();
      promises.push(mentionPromise);
    }

    // Media
    if (mediaUrls && mediaUrls.length > 0) {
       promises.push(prisma.postMedia.createMany({
          data: mediaUrls.map((url: string, index: number) => ({
            postId: post.id,
            mediaUrl: url,
            mediaType: url.match(/\.(gif|webp)$/i) ? 'gif' : 
                      url.match(/\.(mp4|mov|avi|webm)$/i) ? 'video' : 'image',
            order: index
          }))
       }).catch(e => console.error("Media error", e)));
    }

    // Poll
    if (pollData) {
      promises.push(prisma.poll.create({
          data: {
            postId: post.id,
            question: pollData.question,
            expiresAt: pollData.expiresAt ? new Date(pollData.expiresAt) : null,
            isMultiple: pollData.isMultiple,
            options: {
              create: pollData.options.map((text: string) => ({ text }))
            }
          }
      }).catch(e => console.error("Poll error", e)));
    }

    // Wait for all auxiliary data to be created
    await Promise.all(promises);

    if (!isScheduled) {
      await indexSearchDocumentWithRust({
        entity: "post",
        entityId: post.id,
      });
    }

    // Fetch the fully hydrated post for response
    const postWithMedia = await prisma.post.findUnique({
      where: { id: post.id },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            name: true,
            profile: {
              select: {
                avatarUrl: true,
                bannerUrl: true,
                profileType: true,
                verified: true,
                bio: true,
                website: true,
                location: true
              }
            }
          }
        },
        media: { orderBy: { order: 'asc' } },
        poll: { include: { options: true } }
      }
    });

    // Attach parsed embedUrls for response if present
    const responsePost = postWithMedia || post;
    let parsedEmbedUrls = responsePost.embedUrls;
    if (parsedEmbedUrls && typeof parsedEmbedUrls === 'string') {
      try { parsedEmbedUrls = JSON.parse(parsedEmbedUrls); } catch { /* keep original */ }
    }

    const response: { post: typeof responsePost & { embedUrls?: unknown }; message: string } = {
      post: { ...responsePost, embedUrls: parsedEmbedUrls },
      message: isScheduled && scheduledFor
        ? `Post scheduled for ${scheduledFor.toLocaleString()}`
        : "Post created successfully!",
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Post creation error:", error);
    return NextResponse.json({ error: "Failed to create post" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getAuthSession();
    const currentUserId = session?.user?.id;
    
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 50);
    const skip = (page - 1) * limit;
    const filterUserId = searchParams.get("userId");

    if (filterUserId && typeof filterUserId !== 'string') {
      return NextResponse.json({ error: "Invalid user ID format" }, { status: 400 });
    }

    const where: Prisma.PostWhereInput = {
      replyToId: null,
      OR: [
        { isScheduled: false },
        { isScheduled: true, scheduledFor: { lte: new Date() } }
      ],
      ...(filterUserId ? { userId: filterUserId } : {}),
    };

    // OPTIMIZED: Minimal includes, separate queries for user-specific data
    const posts = await prisma.post.findMany({
      where,
      select: postListSelect,
      orderBy: filterUserId ? [
        { isPinned: "desc" },
        { createdAt: "desc" }
      ] : { createdAt: "desc" },
      skip,
      take: limit
    });

    const postIds = posts.map(post => post.id);
    const engagementSummary = await fetchPostEngagementSummary(
      postIds,
      currentUserId,
      getPostPollIds(posts)
    );
    const transformedPosts = posts.map((post) =>
      attachPostEngagement(post, engagementSummary)
    );

    // Add cache headers for better performance (stale-while-revalidate for fast subsequent loads)
    const response = NextResponse.json({ posts: transformedPosts });
    response.headers.set('Cache-Control', 'private, max-age=15, stale-while-revalidate=60');
    return response;
  } catch (error) {
    console.error("Posts fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch posts" }, { status: 500 });
  }
}
