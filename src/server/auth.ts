import { decode } from "next-auth/jwt";
import { cookies } from "next/headers";

/**
 * Next.js 16 compatible session helper.
 *
 * Reads the JWT session token cookie directly and decodes it.
 * Handles both secure (__Secure- prefix for HTTPS) and plain
 * (HTTP/development) cookie names, as well as chunked cookies
 * for large JWTs.
 */
export async function getAuthSession() {
  const cookieStore = await cookies();

  // next-auth uses different cookie names based on HTTPS vs HTTP
  const possibleNames = [
    "__Secure-next-auth.session-token",
    "next-auth.session-token",
  ];

  let tokenValue: string | undefined;

  // Try single cookies first
  for (const name of possibleNames) {
    const val = cookieStore.get(name)?.value;
    if (val) {
      tokenValue = val;
      break;
    }
  }

  // Try chunked cookies (next-auth splits large JWTs across multiple cookies)
  if (!tokenValue) {
    for (const baseName of possibleNames) {
      const chunks: string[] = [];
      let i = 0;
      while (i < 10) {
        const chunkName = `${baseName}.${i}`;
        const chunk = cookieStore.get(chunkName)?.value;
        if (!chunk) break;
        chunks.push(chunk);
        i++;
      }
      if (chunks.length > 0) {
        tokenValue = chunks.join("");
        break;
      }
    }
  }

  if (!tokenValue) {
    return null;
  }

  try {
    const token = await decode({
      token: tokenValue,
      secret: process.env.NEXTAUTH_SECRET!,
    });

    if (!token) return null;

    return {
      user: {
        id: token.id as string | undefined,
        email: token.email as string | undefined,
        name: token.name as string | undefined,
        username: token.username as string | undefined,
        image: token.picture as string | undefined,
        needsPassword: token.needsPassword as boolean | undefined,
      },
    };
  } catch {
    return null;
  }
}

/**
 * Convenience – returns just the authenticated user ID or `null`.
 */
export async function getAuthUserId(): Promise<string | null> {
  const session = await getAuthSession();
  return session?.user?.id ?? null;
}
