import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/server/db";

// Simple function to process scheduled posts
async function processScheduledPosts() {
  const now = new Date();
  if (process.env.NODE_ENV === 'development') {
    console.log(`🕐 processScheduledPosts called at: ${now}`);
  }
  
  // Find posts that are scheduled and their time has come
  const scheduledPosts = await prisma.post.findMany({
    where: {
      isScheduled: true,
      scheduledFor: {
        lte: now // scheduledFor is less than or equal to now
      }
    }
  });
  
  if (process.env.NODE_ENV === 'development') {
    console.log(`📅 Found ${scheduledPosts.length} scheduled posts ready to publish`);
    scheduledPosts.forEach(post => {
      if (post.scheduledFor) {
        console.log(`  - Post ID: ${post.id}, scheduled for: ${post.scheduledFor}, time diff: ${(now.getTime() - post.scheduledFor.getTime()) / 1000}s`);
      }
    });
  }
  
  if (scheduledPosts.length === 0) {
    return 0;
  }
  
  // Update each scheduled post to be published
  const updatePromises = scheduledPosts.map(post => 
    prisma.post.update({
      where: { id: post.id },
      data: {
        isScheduled: false,
        scheduledFor: null
      }
    })
  );
  
  await Promise.all(updatePromises);
  
  if (process.env.NODE_ENV === 'development') {
    console.log(`✅ Auto-published ${scheduledPosts.length} scheduled posts`);
  }
  return scheduledPosts.length;
}

export async function POST(request: NextRequest) {
  try {
    const processed = await processScheduledPosts();
    return NextResponse.json({ 
      message: `Processed ${processed} scheduled posts`,
      processed
    });
  } catch (error) {
    console.error('❌ Error processing scheduled posts:', error);
    return NextResponse.json(
      { error: 'Failed to process scheduled posts' },
      { status: 500 }
    );
  }
}

// Export the function so it can be used by other APIs
export { processScheduledPosts };

// GET endpoint to check scheduled posts without processing them
export async function GET(request: NextRequest) {
  try {
    const now = new Date();
    
    // Find posts that are scheduled and their time has come
    const readyPosts = await prisma.post.findMany({
      where: {
        isScheduled: true,
        scheduledFor: {
          lte: now
        }
      },
      select: {
        id: true,
        content: true,
        scheduledFor: true,
        user: {
          select: {
            username: true
          }
        }
      }
    });
    
    // Find all scheduled posts (including future ones)
    const allScheduledPosts = await prisma.post.findMany({
      where: {
        isScheduled: true
      },
      select: {
        id: true,
        content: true,
        scheduledFor: true,
        user: {
          select: {
            username: true
          }
        }
      },
      orderBy: {
        scheduledFor: 'asc'
      }
    });
    
    return NextResponse.json({
      readyToPublish: readyPosts.length,
      totalScheduled: allScheduledPosts.length,
      readyPosts: readyPosts.map(post => ({
        id: post.id,
        content: post.content.substring(0, 50) + '...',
        username: post.user.username,
        scheduledFor: post.scheduledFor
      })),
      allScheduled: allScheduledPosts.map(post => ({
        id: post.id,
        content: post.content.substring(0, 50) + '...',
        username: post.user.username,
        scheduledFor: post.scheduledFor,
        isReady: post.scheduledFor ? post.scheduledFor <= now : false
      }))
    });
    
  } catch (error) {
    console.error('❌ Error checking scheduled posts:', error);
    return NextResponse.json(
      { error: 'Failed to check scheduled posts' },
      { status: 500 }
    );
  }
}
