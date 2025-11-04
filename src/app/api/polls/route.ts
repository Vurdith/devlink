import { NextResponse } from "next/server";
import { prisma } from "@/server/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/server/auth-options";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const currentUserId = (session?.user as any)?.id as string | undefined;
    
    if (!currentUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { postId, question, options, expiresAt, isMultiple } = await req.json();

    if (!postId || !question || !options || options.length < 2) {
      return NextResponse.json({ error: "Invalid poll data" }, { status: 400 });
    }

    // Verify the post exists and belongs to the current user
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { userId: true }
    });

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    if (post.userId !== currentUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Create the poll with options
    const poll = await prisma.poll.create({
      data: {
        postId,
        question,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        isMultiple,
        options: {
          create: options.map((text: string) => ({ text }))
        }
      },
      include: {
        options: true
      }
    });

    return NextResponse.json({ poll });
  } catch (error) {
    console.error("Error creating poll:", error);
    return NextResponse.json({ error: "Failed to create poll" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const postId = searchParams.get("postId");

    if (!postId) {
      return NextResponse.json({ error: "Post ID required" }, { status: 400 });
    }

    const poll = await prisma.poll.findUnique({
      where: { postId },
      include: {
        options: {
          include: {
            votes: true
          }
        }
      }
    });

    if (!poll) {
      return NextResponse.json({ error: "Poll not found" }, { status: 404 });
    }

    // Calculate total votes
    const totalVotes = poll.options.reduce((sum, option) => sum + option.votes.length, 0);

    // Format the response
    const formattedPoll = {
      id: poll.id,
      question: poll.question,
      expiresAt: poll.expiresAt,
      isMultiple: poll.isMultiple,
      totalVotes,
      options: poll.options.map(option => ({
        id: option.id,
        text: option.text,
        votes: option.votes.length
      }))
    };

    return NextResponse.json({ poll: formattedPoll });
  } catch (error) {
    console.error("Error fetching poll:", error);
    return NextResponse.json({ error: "Failed to fetch poll" }, { status: 500 });
  }
}
