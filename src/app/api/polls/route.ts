import { NextResponse } from "next/server";
import { prisma } from "@/server/db";
import { getAuthSession } from "@/server/auth";
import { parseJsonBody } from "@/lib/api-utils";
import { normalizePollOptions, validateId, validatePollData } from "@/lib/validation";

export async function POST(req: Request) {
  try {
    const session = await getAuthSession();
    const currentUserId = session?.user?.id;
    
    if (!currentUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const parsedBody = await parseJsonBody<Record<string, unknown>>(req);
    if (!parsedBody.ok) {
      return parsedBody.response;
    }

    const { postId, question, options, expiresAt, isMultiple } = parsedBody.data;

    if (!postId) {
      return NextResponse.json({ error: "postId is required" }, { status: 400 });
    }
    if (typeof postId !== "string") {
      return NextResponse.json({ error: "postId must be a string" }, { status: 400 });
    }

    const idValidation = validateId(postId);
    if (!idValidation.isValid) {
      return NextResponse.json({ error: `Invalid postId: ${idValidation.errors[0]}` }, { status: 400 });
    }

    const pollValidation = validatePollData({ question, options });
    if (!pollValidation.isValid) {
      return NextResponse.json({ error: pollValidation.errors[0] }, { status: 400 });
    }

    if (typeof question !== "string") {
      return NextResponse.json({ error: "Poll question must be a string" }, { status: 400 });
    }

    const normalizedOptions = normalizePollOptions(options);
    if (!normalizedOptions) {
      return NextResponse.json({ error: "Poll options are invalid" }, { status: 400 });
    }

    let pollExpiresAt: Date | null = null;
    if (expiresAt) {
      if (typeof expiresAt !== "string") {
        return NextResponse.json({ error: "expiresAt must be a string" }, { status: 400 });
      }
      const expireDate = new Date(expiresAt);
      if (isNaN(expireDate.getTime())) {
        return NextResponse.json({ error: "Invalid expiresAt date format" }, { status: 400 });
      }
      if (expireDate < new Date()) {
        return NextResponse.json({ error: "expiresAt must be in the future" }, { status: 400 });
      }
      pollExpiresAt = expireDate;
    }

    if (typeof isMultiple !== 'undefined' && typeof isMultiple !== 'boolean') {
      return NextResponse.json({ error: "isMultiple must be a boolean" }, { status: 400 });
    }

    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { userId: true }
    });

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    if (post.userId !== currentUserId) {
      return NextResponse.json({ error: "Unauthorized - post does not belong to you" }, { status: 403 });
    }

    const poll = await prisma.poll.create({
      data: {
        postId,
        question,
        expiresAt: pollExpiresAt,
        isMultiple,
        options: {
          create: normalizedOptions.map((text) => ({ text }))
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

    const totalVotes = poll.options.reduce((sum, option) => sum + option.votes.length, 0);

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
