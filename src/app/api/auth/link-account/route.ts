import { NextRequest, NextResponse } from "next/server";
import { createHash, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { getAuthSession } from "@/server/auth";
import { prisma } from "@/server/db";

const LINKABLE_PROVIDERS = new Set(["google", "apple", "twitter", "roblox"]);

function isLinkableProvider(provider: unknown): provider is string {
  return typeof provider === "string" && LINKABLE_PROVIDERS.has(provider);
}

async function verifyNextAuthCsrfToken(csrfToken: unknown) {
  if (typeof csrfToken !== "string" || !process.env.NEXTAUTH_SECRET) {
    return false;
  }

  const cookieStore = await cookies();
  const cookieValue =
    cookieStore.get("__Host-next-auth.csrf-token")?.value ??
    cookieStore.get("next-auth.csrf-token")?.value;

  if (!cookieValue) {
    return false;
  }

  const [cookieToken, cookieHash] = cookieValue.split("|");
  if (!cookieToken || !cookieHash || cookieToken !== csrfToken) {
    return false;
  }

  const expectedHash = createHash("sha256")
    .update(`${cookieToken}${process.env.NEXTAUTH_SECRET}`)
    .digest("hex");

  const cookieHashBuffer = Buffer.from(cookieHash);
  const expectedHashBuffer = Buffer.from(expectedHash);

  return (
    cookieHashBuffer.length === expectedHashBuffer.length &&
    timingSafeEqual(cookieHashBuffer, expectedHashBuffer)
  );
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getAuthSession();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let payload: unknown;
    try {
      payload = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    if (typeof payload !== "object" || payload === null || Array.isArray(payload)) {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    const { provider, csrfToken } = payload as { provider?: unknown; csrfToken?: unknown };

    if (!isLinkableProvider(provider)) {
      return NextResponse.json({ error: "Invalid provider" }, { status: 400 });
    }

    const requestCsrfToken = request.headers.get("x-csrf-token") ?? csrfToken;
    if (!(await verifyNextAuthCsrfToken(requestCsrfToken))) {
      return NextResponse.json({ error: "Invalid CSRF token" }, { status: 403 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        password: true,
        accounts: {
          select: {
            id: true,
            provider: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const matchingAccounts = user.accounts.filter((account) => account.provider === provider);
    if (matchingAccounts.length === 0) {
      return NextResponse.json({ error: "Account is not linked" }, { status: 404 });
    }

    const remainingOAuthAccounts = user.accounts.length - matchingAccounts.length;
    if (!user.password && remainingOAuthAccounts < 1) {
      return NextResponse.json({ 
        error: "Cannot unlink your only login method. Please set a password first." 
      }, { status: 400 });
    }

    await prisma.account.deleteMany({
      where: {
        userId: session.user.id,
        provider,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error unlinking account:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
