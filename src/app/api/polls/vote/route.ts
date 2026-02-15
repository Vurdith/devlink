import { NextResponse } from "next/server";
import { prisma } from "@/server/db";
import { getAuthSession } from "@/server/auth";

// Simple in-memory rate limiting for poll votes
const voteRateLimitMap = new Map<string, { count: number; resetTime: number }>();

function checkVoteRateLimit(userId: string, limit: number = 5, windowMs: number = 60000): boolean {
  const now = Date.now();
  const userLimit = voteRateLimitMap.get(userId);
  
  if (!userLimit || now > userLimit.resetTime) {
    voteRateLimitMap.set(userId, { count: 1, resetTime: now + windowMs });
    return true;
  }
  
  if (userLimit.count >= limit) {
    return false;
  }
  
  userLimit.count++;
  return true;
}

export async function POST(req: Request) {
  try {
    
    const session = await getAuthSession();
    const currentUserId = session?.user?.id;
    
    
    if (!currentUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Rate limiting: 5 votes per minute per user
    if (!checkVoteRateLimit(currentUserId, 5, 60000)) {
      return NextResponse.json({ error: "Rate limit exceeded. Please wait before voting again." }, { status: 429 });
    }

    const { pollId, optionIds } = await req.json();

    if (!pollId || !optionIds || !Array.isArray(optionIds)) {
      return NextResponse.json({ error: "Invalid vote data" }, { status: 400 });
    }

    // Allow empty optionIds array for removing votes
    if (optionIds.length === 0) {
      // Remove all votes for this poll
      await prisma.pollVote.deleteMany({
        where: {
          pollId,
          userId: currentUserId
        }
      });

      return NextResponse.json({ 
        message: "Votes removed successfully",
        votesCount: 0
      });
    }

    // Verify the poll exists
    const poll = await prisma.poll.findUnique({
      where: { id: pollId },
      include: {
        options: {
          select: { id: true }
        }
      }
    });

    if (!poll) {
      return NextResponse.json({ error: "Poll not found" }, { status: 404 });
    }

    // Check if poll is expired
    if (poll.expiresAt && new Date() > poll.expiresAt) {
      return NextResponse.json({ error: "Poll has expired" }, { status: 400 });
    }

    // Verify all option IDs are valid for this poll
    const validOptionIds = poll.options.map(opt => opt.id);
    const invalidOptions = optionIds.filter(id => !validOptionIds.includes(id));
    
    if (invalidOptions.length > 0) {
      return NextResponse.json({ error: "Invalid option IDs" }, { status: 400 });
    }

    // Check if user has already voted on this poll
    const existingVotes = await prisma.pollVote.findMany({
      where: {
        pollId,
        userId: currentUserId
      }
    });

    // If user has existing votes, delete them to allow vote changing
    if (existingVotes.length > 0) {
      await prisma.pollVote.deleteMany({
        where: {
          pollId,
          userId: currentUserId
        }
      });
    }

    // Create votes for selected options
    const votes = await prisma.pollVote.createMany({
      data: optionIds.map(optionId => ({
        pollId,
        optionId,
        userId: currentUserId
      }))
    });

    return NextResponse.json({ 
      message: "Vote recorded successfully",
      votesCount: votes.count
    });
  } catch (error) {
    console.error("Error recording vote:", error);
    return NextResponse.json({ error: "Failed to record vote" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const session = await getAuthSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const pollId = searchParams.get("pollId");

    if (!pollId) {
      return NextResponse.json({ error: "Poll ID is required" }, { status: 400 });
    }

    // Always use the authenticated user's ID instead of query param
    const userId = session.user.id;

    // Get user's votes for this poll
    const votes = await prisma.pollVote.findMany({
      where: {
        pollId,
        userId
      },
      include: {
        option: {
          select: {
            id: true,
            text: true
          }
        }
      }
    });

    return NextResponse.json({ 
      votes: votes.map(vote => ({
        optionId: vote.optionId,
        optionText: vote.option.text
      }))
    });
  } catch (error) {
    console.error("Error fetching user votes:", error);
    return NextResponse.json({ error: "Failed to fetch user votes" }, { status: 500 });
  }
}
