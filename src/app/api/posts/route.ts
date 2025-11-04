import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/server/auth-options";
import { prisma } from "@/server/db";
import { parseContent } from "@/lib/content-parser";
import { CreatePostRequest, PostsResponse, ApiResponse } from "@/types/api";

// Simple in-memory rate limiting (in production, use Redis)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(userId: string, limit: number = 10, windowMs: number = 60000): boolean {
  const now = Date.now();
  const userLimit = rateLimitMap.get(userId);
  
  if (!userLimit || now > userLimit.resetTime) {
    rateLimitMap.set(userId, { count: 1, resetTime: now + windowMs });
    return true;
  }
  
  if (userLimit.count >= limit) {
    return false;
  }
  
  userLimit.count++;
  return true;
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.username) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Rate limiting: 10 posts per minute per user
    const userId = (session.user as any).id;
    if (!checkRateLimit(userId, 10, 60000)) {
      return NextResponse.json({ error: "Rate limit exceeded. Please wait before posting again." }, { status: 429 });
    }

    const body = await request.json();
    console.log("Received post data:", body);
    
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

    if ((content?.length || 0) > 2000) {
      return NextResponse.json({ error: "Content must be less than 2000 characters" }, { status: 400 });
    }

    // Require at least one of: content, media, poll, embeds
    const hasAnyContent = (content && content.trim().length > 0) || (Array.isArray(mediaUrls) && mediaUrls.length > 0) || !!pollData || (Array.isArray(embedUrlsInput) && embedUrlsInput.length > 0);
    if (!hasAnyContent) {
      return NextResponse.json({ error: "Post must include text, media, poll, or an embed link." }, { status: 400 });
    }

    // Sanitize content - remove potential XSS
    const sanitizedContent = (content || "")
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '');

    // Location validation
    let location: string | null = null;
    console.log("Location debug:", { locationInput, type: typeof locationInput });
    if (typeof locationInput === 'string' && locationInput.trim().length > 0) {
      if (locationInput.length > 120) {
        return NextResponse.json({ error: "Location must be 120 characters or less" }, { status: 400 });
      }
      location = locationInput.replace(/<[^>]+>/g, '').trim();
    }
    console.log("Final location:", location);

    // Embed URLs validation (limit 5)
    let embedUrls: string[] | null = null;
    console.log("Embed URLs debug:", { embedUrlsInput, type: typeof embedUrlsInput, isArray: Array.isArray(embedUrlsInput) });
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
    console.log("Final embed URLs:", embedUrls);

    // Scheduling
    let isScheduled = false;
    let scheduledFor: Date | null = null;
    console.log("Scheduling debug:", { scheduledForInput, isScheduledInput });
    if (scheduledForInput) {
      // Handle datetime-local input format (YYYY-MM-DDTHH:MM)
      let date: Date;
      if (scheduledForInput.includes('T')) {
        // datetime-local format - create date from input string directly
        date = new Date(scheduledForInput);
      } else {
        // fallback for other formats
        date = new Date(scheduledForInput);
      }
      console.log("Parsed date:", date, "isValid:", !isNaN(date.getTime()), "input:", scheduledForInput);
      if (isNaN(date.getTime())) {
        return NextResponse.json({ error: "Invalid scheduledFor date" }, { status: 400 });
      }
      
      const now = new Date();
      // Get current time in same format as input (local time)
      const nowLocal = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), now.getMinutes(), 0);
      const scheduledLocal = new Date(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes(), 0);
      
      // Calculate difference in minutes
      const diffMinutes = (scheduledLocal.getTime() - nowLocal.getTime()) / (1000 * 60);
      console.log("Time comparison - now:", nowLocal, "scheduled:", scheduledLocal, "diff minutes:", diffMinutes);
      
      if (diffMinutes >= 1) {
        isScheduled = true;
        scheduledFor = date;
        console.log("Post will be scheduled for:", scheduledFor);
      } else {
        console.log("Date is not far enough in the future (need at least 1 minute), posting immediately");
        // Return an error to inform the user
        return NextResponse.json({ error: "Scheduled time must be at least 1 minute in the future (e.g., if it's 1:00, schedule for 1:01 or later)" }, { status: 400 });
      }
    }
    console.log("Final scheduling values:", { isScheduled, scheduledFor });

    // Validate mediaUrls if provided
    if (mediaUrls && Array.isArray(mediaUrls)) {
      if (mediaUrls.length > 10) {
        return NextResponse.json({ error: "Maximum 10 media files allowed" }, { status: 400 });
      }
      
      for (const url of mediaUrls) {
        if (typeof url !== 'string' || url.trim().length === 0) {
          return NextResponse.json({ error: "Invalid media URL" }, { status: 400 });
        }
        
        // Allow relative URLs (from upload API) and absolute URLs
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
    console.log("Creating post with data:", postData);
    
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

    // Process hashtags
    if (parsedContent.hashtags.length > 0) {
      try {
        for (const hashtagName of parsedContent.hashtags) {
          // Find or create hashtag
          const hashtag = await prisma.hashtag.upsert({
            where: { name: hashtagName },
            update: {},
            create: { name: hashtagName }
          });

          // Create post-hashtag relationship
          await prisma.postHashtag.create({
            data: {
              postId: post.id,
              hashtagId: hashtag.id
            }
          });
        }
      } catch (error) {
        console.error("Error creating hashtags:", error);
        // Continue with post creation even if hashtags fail
      }
    }

    // Process mentions
    if (parsedContent.mentions.length > 0) {
      try {
        for (const username of parsedContent.mentions) {
          // Find mentioned user
          const mentionedUser = await prisma.user.findUnique({
            where: { username }
          });

          if (mentionedUser) {
            // Create post-mention relationship
            await prisma.postMention.create({
              data: {
                postId: post.id,
                userId: mentionedUser.id
              }
            });
          }
        }
      } catch (error) {
        console.error("Error creating mentions:", error);
        // Continue with post creation even if mentions fail
      }
    }

    // Create media entries if mediaUrls are provided
    if (mediaUrls && mediaUrls.length > 0) {
      try {
        await prisma.postMedia.createMany({
          data: mediaUrls.map((url: string, index: number) => ({
            postId: post.id,
            mediaUrl: url,
            mediaType: url.match(/\.(gif|webp)$/i) ? 'gif' : 
                      url.match(/\.(mp4|mov|avi|webm)$/i) ? 'video' : 'image',
            order: index
          }))
        });
      } catch (error) {
        console.error("Error creating media:", error);
        // Continue with post creation even if media fails
      }
    }

    // If poll data is provided, create the poll
    if (pollData) {
      try {
        const createdPoll = await prisma.poll.create({
          data: {
            postId: post.id,
            question: pollData.question,
            expiresAt: pollData.expiresAt ? new Date(pollData.expiresAt) : null,
            isMultiple: pollData.isMultiple,
            options: {
              create: pollData.options.map((text: string) => ({ text }))
            }
          },
          include: {
            options: true
          }
        });
      } catch (error) {
        console.error("Error creating poll:", error);
        // Continue with post creation even if poll fails
      }
    } else {
    }

    // Fetch the post again with media and poll data if they were created
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
        media: {
          orderBy: { order: 'asc' }
        },
        poll: {
          include: {
            options: true
          }
        }
      }
    });

    // Attach parsed embedUrls for response if present
    let responsePost: any = postWithMedia || post;
    if (responsePost.embedUrls && typeof responsePost.embedUrls === 'string') {
      try { responsePost.embedUrls = JSON.parse(responsePost.embedUrls); } catch {}
    }

    // Add success message for all posts
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
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 50); // Max 50 posts per request
    const skip = (page - 1) * limit;
    const userId = searchParams.get("userId");

    // Validate userId format if provided
    if (userId && typeof userId !== 'string') {
      return NextResponse.json({ error: "Invalid user ID format" }, { status: 400 });
    }

    // Build where clause - filter by userId if provided, otherwise only main posts
    const where: any = { replyToId: null };
    // Exclude scheduled future posts from general feeds
    where.OR = [
      { isScheduled: false },
      { isScheduled: true, scheduledFor: { lte: new Date() } }
    ];
    if (userId) {
      where.userId = userId;
    }

    const posts = await prisma.post.findMany({
      where,
      include: {
        user: {
          include: {
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
            },
            _count: {
              select: {
                followers: true,
                following: true
              }
            }
          }
        },
        _count: {
          select: {
            likes: true,
            reposts: true,
            replies: true,
            views: true
          }
        },
        likes: true,
        reposts: true,
        savedBy: true,
        media: {
          orderBy: { order: 'asc' }
        },
        poll: {
          include: {
            options: {
              include: {
                votes: true
              }
            }
          }
        },
        replies: {
          include: {
            user: {
              include: {
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
                },
                _count: {
                  select: {
                    followers: true,
                    following: true
                  }
                }
              }
            },
            media: {
              orderBy: { order: 'asc' }
            },
            poll: {
              include: {
                options: {
                  include: {
                    votes: true
                  }
                }
              }
            }
          }
        }
      },
      orderBy: userId ? [
        { isPinned: "desc" },
        { createdAt: "desc" }
      ] : { createdAt: "desc" },
      skip,
      take: limit
    });

    // Get all view counts in a single query
    const postIds = posts.map(post => post.id);
    const viewCounts = await prisma.postView.groupBy({
      by: ['postId'],
      where: { postId: { in: postIds } },
      _count: { postId: true }
    });
    
    const viewCountMap = new Map(viewCounts.map(vc => [vc.postId, vc._count.postId]));

    // Get user poll votes in a single query if user is logged in
    let userPollVotes: string[] = [];
    if (userId && posts.some(post => post.poll)) {
      const pollIds = posts.filter(post => post.poll).map(post => post.poll!.id);
      const votes = await prisma.pollVote.findMany({
        where: {
          pollId: { in: pollIds },
          userId: userId
        },
        select: { optionId: true }
      });
      userPollVotes = votes.map(vote => vote.optionId);
    }

    // Transform posts with optimized data
    const postsWithViewCounts = posts.map((post: any) => {
      const viewCount = viewCountMap.get(post.id) || 0;
      let transformedPost = { ...post, views: viewCount };
      
      if (post.poll) {
        const totalVotes = post.poll.options.reduce((sum: number, option: any) => sum + option.votes.length, 0);
        
        transformedPost.poll = {
          ...post.poll,
          totalVotes,
          options: post.poll.options.map((option: any) => ({
            id: option.id,
            text: option.text,
            votes: option.votes.length,
            isSelected: userPollVotes.includes(option.id)
          }))
        };
      }
      
      return transformedPost;
    });

    return NextResponse.json({ posts: postsWithViewCounts });
  } catch (error) {
    console.error("Posts fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch posts" }, { status: 500 });
  }
}
