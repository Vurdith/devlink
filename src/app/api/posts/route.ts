import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/server/auth-options";
import { prisma } from "@/server/db";
import { parseContent } from "@/lib/content-parser";
import { CreatePostRequest, PostsResponse, ApiResponse } from "@/types/api";
import { RATE_LIMITS, CONTENT_LIMITS, COLLECTION_LIMITS, HTTP_STATUS } from "@/lib/constants";
import { checkRateLimit } from "@/lib/rate-limit";
import { getUniqueViewCounts } from "@/lib/view-utils";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.username) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Rate limiting: 10 posts per minute per user
    // Uses Redis if configured, falls back to memory
    const userId = (session.user as any).id;
    const rateLimit = await checkRateLimit(`post_create:${userId}`, 10, 60);
    
    if (!rateLimit.success) {
      const resetTime = new Date(rateLimit.reset).toLocaleTimeString();
      return NextResponse.json({ 
        error: `Rate limit exceeded. Please wait until ${resetTime} before posting again.` 
      }, { status: 429 });
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
      isScheduled: isScheduledInput,
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

    // Sanitize content - simple removal of script tags and dangerous handlers
    const sanitizedContent = (content || "")
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/ on\w+=/gi, ''); // spaced to avoid matching 'money', 'one', etc. if just 'on'

    // Location validation
    let location: string | null = null;
    if (typeof locationInput === 'string' && locationInput.trim().length > 0) {
      if (locationInput.length > CONTENT_LIMITS.LOCATION_MAX_LENGTH) {
        return NextResponse.json({ error: `Location must be ${CONTENT_LIMITS.LOCATION_MAX_LENGTH} characters or less` }, { status: 400 });
      }
      location = locationInput.replace(/<[^>]+>/g, '').trim();
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

    // Hashtags
    if (parsedContent.hashtags.length > 0) {
      const hashtagPromise = (async () => {
        try {
          await Promise.all(parsedContent.hashtags.map(async (hashtagName) => {
            const hashtag = await prisma.hashtag.upsert({
              where: { name: hashtagName },
              update: {},
              create: { name: hashtagName }
            });
            await prisma.postHashtag.create({
              data: { postId: post.id, hashtagId: hashtag.id }
            });
          }));
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
    let responsePost: any = postWithMedia || post;
    if (responsePost.embedUrls && typeof responsePost.embedUrls === 'string') {
      try { responsePost.embedUrls = JSON.parse(responsePost.embedUrls); } catch {}
    }

    const response: any = { post: responsePost };
    if (isScheduled && scheduledFor) {
      response.message = `Post scheduled for ${scheduledFor.toLocaleString()}`;
    } else {
      response.message = "Post created successfully!";
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error("Post creation error:", error);
    return NextResponse.json({ error: "Failed to create post" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const currentUserId = (session?.user as any)?.id as string | undefined;
    
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 50);
    const skip = (page - 1) * limit;
    const filterUserId = searchParams.get("userId");

    if (filterUserId && typeof filterUserId !== 'string') {
      return NextResponse.json({ error: "Invalid user ID format" }, { status: 400 });
    }

    const where: any = { replyToId: null };
    where.OR = [
      { isScheduled: false },
      { isScheduled: true, scheduledFor: { lte: new Date() } }
    ];
    if (filterUserId) {
      where.userId = filterUserId;
    }

    // OPTIMIZED: Minimal includes, separate queries for user-specific data
    const posts = await prisma.post.findMany({
      where,
      select: {
        id: true,
        content: true,
        createdAt: true,
        updatedAt: true,
        isPinned: true,
        isSlideshow: true,
        location: true,
        embedUrls: true,
        userId: true,
        user: {
          select: {
            id: true,
            username: true,
            name: true,
            createdAt: true,
            profile: {
              select: {
                avatarUrl: true,
                bannerUrl: true,
                profileType: true,
                verified: true,
                bio: true,
                website: true,
                location: true,
              }
            },
            _count: {
              select: { followers: true, following: true }
            }
          }
        },
        _count: {
          select: {
            likes: true,
            reposts: true,
            replies: true,
          }
        },
        media: {
          select: { id: true, mediaUrl: true, mediaType: true, order: true },
          orderBy: { order: 'asc' }
        },
        poll: {
          select: {
            id: true,
            question: true,
            expiresAt: true,
            isMultiple: true,
            options: {
              select: {
                id: true,
                text: true,
                _count: { select: { votes: true } }
              }
            }
          }
        },
      },
      orderBy: filterUserId ? [
        { isPinned: "desc" },
        { createdAt: "desc" }
      ] : { createdAt: "desc" },
      skip,
      take: limit
    });

    const postIds = posts.map(post => post.id);

    // PARALLEL: Fetch all user-specific data in one go
    const [viewCountMap, userLikes, userReposts, userSaves, userPollVotes] = await Promise.all([
      // Unique view counts (counts unique users, not total view records)
      getUniqueViewCounts(postIds),
      // User likes
      currentUserId ? prisma.postLike.findMany({
        where: { postId: { in: postIds }, userId: currentUserId },
        select: { postId: true }
      }) : Promise.resolve([]),
      // User reposts
      currentUserId ? prisma.postRepost.findMany({
        where: { postId: { in: postIds }, userId: currentUserId },
        select: { postId: true }
      }) : Promise.resolve([]),
      // User saves
      currentUserId ? prisma.savedPost.findMany({
        where: { postId: { in: postIds }, userId: currentUserId },
        select: { postId: true }
      }) : Promise.resolve([]),
      // User poll votes
      currentUserId && posts.some(post => post.poll) ? prisma.pollVote.findMany({
        where: {
          pollId: { in: posts.filter(p => p.poll).map(p => p.poll!.id) },
          userId: currentUserId
        },
        select: { optionId: true }
      }) : Promise.resolve([])
    ]);
    const likedPostIds = new Set(userLikes.map(l => l.postId));
    const repostedPostIds = new Set(userReposts.map(r => r.postId));
    const savedPostIds = new Set(userSaves.map(s => s.postId));
    const votedOptionIds = new Set(userPollVotes.map(v => v.optionId));

    const transformedPosts = posts.map((post: any) => {
      const viewCount = viewCountMap.get(post.id) || 0;
      
      let transformedPost: any = {
        ...post,
        views: viewCount,
        isLiked: likedPostIds.has(post.id),
        isReposted: repostedPostIds.has(post.id),
        isSaved: savedPostIds.has(post.id),
        likes: [], // Clear to reduce payload
        reposts: [],
        savedBy: [],
        replies: Array(post._count?.replies || 0).fill(null), // For reply count display
      };
      
      if (post.poll) {
        const totalVotes = post.poll.options.reduce((sum: number, opt: any) => sum + opt._count.votes, 0);
        transformedPost.poll = {
          ...post.poll,
          totalVotes,
          options: post.poll.options.map((opt: any) => ({
            id: opt.id,
            text: opt.text,
            votes: opt._count.votes,
            isSelected: votedOptionIds.has(opt.id)
          }))
        };
      }
      
      return transformedPost;
    });

    // Add cache headers for better performance
    const response = NextResponse.json({ posts: transformedPosts });
    response.headers.set('Cache-Control', 'private, max-age=10, stale-while-revalidate=30');
    return response;
  } catch (error) {
    console.error("Posts fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch posts" }, { status: 500 });
  }
}
