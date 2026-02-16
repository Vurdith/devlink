import { NextResponse } from "next/server";
import { getAuthSession } from "@/server/auth";
import { responseCache } from "@/lib/cache";
import { randomBytes } from "crypto";

function challengeKey(userId: string, kind: "registration" | "authentication") {
  return `passkeys:challenge:${kind}:${userId}`;
}

function createChallenge() {
  return randomBytes(32).toString("base64url");
}

export async function POST(request: Request) {
  const session = await getAuthSession();
  const userId = session?.user?.id;
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as { kind?: "registration" | "authentication" };
  const kind = body.kind ?? "registration";
  const challenge = createChallenge();
  await responseCache.set(challengeKey(userId, kind), challenge, 60 * 5);

  return NextResponse.json({
    challenge,
    kind,
    timeout: 300000,
  });
}
