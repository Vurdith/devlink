import { NextResponse } from "next/server";
import { getAuthSession } from "@/server/auth";
import { responseCache } from "@/lib/cache";

function challengeKey(userId: string) {
  return `passkeys:challenge:registration:${userId}`;
}

function credentialKey(userId: string) {
  return `passkeys:credentials:${userId}`;
}

type StoredPasskeyCredential = {
  id: string;
  publicKey: string;
  transports?: string[];
  addedAt: string;
};

export async function POST(request: Request) {
  const session = await getAuthSession();
  const userId = session?.user?.id;
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as {
    challenge?: string;
    credentialId?: string;
    publicKey?: string;
    transports?: string[];
  };

  const expectedChallenge = await responseCache.get<string>(challengeKey(userId));
  if (!expectedChallenge || !body.challenge || body.challenge !== expectedChallenge) {
    return NextResponse.json({ error: "Invalid challenge" }, { status: 400 });
  }

  if (!body.credentialId || !body.publicKey) {
    return NextResponse.json(
      { error: "credentialId and publicKey are required" },
      { status: 400 }
    );
  }

  const existing = (await responseCache.get<StoredPasskeyCredential[]>(credentialKey(userId))) ?? [];
  if (!existing.some((cred) => cred.id === body.credentialId)) {
    existing.push({
      id: body.credentialId,
      publicKey: body.publicKey,
      transports: body.transports,
      addedAt: new Date().toISOString(),
    });
  }

  await responseCache.set(credentialKey(userId), existing, 60 * 60 * 24 * 365);
  await responseCache.delete(challengeKey(userId));

  return NextResponse.json({ ok: true, credentialsCount: existing.length });
}

export async function GET() {
  const session = await getAuthSession();
  const userId = session?.user?.id;
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const credentials =
    (await responseCache.get<StoredPasskeyCredential[]>(credentialKey(userId))) ?? [];
  return NextResponse.json({ credentials });
}
