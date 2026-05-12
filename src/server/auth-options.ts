import type { NextAuthOptions } from "next-auth";
import type { AdapterUser } from "next-auth/adapters";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import AppleProvider from "next-auth/providers/apple";
import TwitterProvider from "next-auth/providers/twitter";
import RobloxProvider from "./providers/roblox";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/server/db";
import { compare } from "bcryptjs";

const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000;

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function sanitizeUsername(name: string | null | undefined, email: string) {
  const baseName = name || email.split("@")[0];
  let sanitized = baseName
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, "")
    .replace(/^_+|_+$/g, "")
    .substring(0, 20);

  if (sanitized.length < 3) {
    sanitized = `user${Math.random().toString(36).substring(2, 8)}`;
  }

  return sanitized;
}

async function createUniqueUsername(name: string | null | undefined, email: string) {
  const baseUsername = sanitizeUsername(name, email);
  let username = baseUsername;
  let counter = 1;
  const maxAttempts = 100;

  while (counter < maxAttempts) {
    const existingUsername = await prisma.user.findUnique({
      where: { username },
      select: { id: true },
    });

    if (!existingUsername) {
      return username;
    }

    username = `${baseUsername}${counter}`;
    counter++;
  }

  return `user${Date.now().toString(36)}${Math.random().toString(36).substring(2, 6)}`;
}

const prismaAdapter = PrismaAdapter(prisma);

export const authOptions: NextAuthOptions = {
  adapter: {
    ...prismaAdapter,
    async createUser(user: Omit<AdapterUser, "id">) {
      const email = normalizeEmail(user.email);
      if (!email) {
        throw new Error("OAuth provider did not return an email address.");
      }

      const username = await createUniqueUsername(user.name, email);

      return prisma.$transaction(async (tx) => {
        const createdUser = await tx.user.create({
          data: {
            email,
            username,
            name: user.name,
            image: user.image,
            emailVerified: user.emailVerified ?? new Date(),
          },
        });

        await tx.profile.create({
          data: {
            userId: createdUser.id,
            bio: null,
            profileType: "DEVELOPER",
            avatarUrl: user.image ?? null,
          },
        });

        return createdUser;
      });
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  cookies: {
    sessionToken: {
      name: process.env.NODE_ENV === "production" ? "__Secure-next-auth.session-token" : "next-auth.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax" as const,
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        if (!credentials?.email || !credentials?.password) return null;
        const email = normalizeEmail(credentials.email);
        const user = await prisma.user.findFirst({
          where: { email: { equals: email, mode: "insensitive" } },
          select: {
            id: true,
            email: true,
            username: true,
            password: true,
            loginAttempts: true,
            lockedUntil: true,
          },
        });
        
        if (!user || !user.password) return null;
        
        if (user.lockedUntil && new Date() < user.lockedUntil) {
          const remainingMs = user.lockedUntil.getTime() - Date.now();
          const remainingMins = Math.ceil(remainingMs / 60000);
          throw new Error(`Account locked. Try again in ${remainingMins} minute${remainingMins !== 1 ? 's' : ''}.`);
        }
        
        const ok = await compare(credentials.password, user.password);
        
        if (!ok) {
          const newAttempts = user.loginAttempts + 1;
          
          if (newAttempts >= MAX_LOGIN_ATTEMPTS) {
            await prisma.user.update({
              where: { id: user.id },
              data: {
                loginAttempts: 0,
                lockedUntil: new Date(Date.now() + LOCKOUT_DURATION_MS)
              }
            });
            throw new Error(`Too many failed attempts. Account locked for 15 minutes.`);
          }
          
          await prisma.user.update({
            where: { id: user.id },
            data: { loginAttempts: newAttempts }
          });
          
          return null;
        }
        
        if (user.loginAttempts > 0 || user.lockedUntil) {
          await prisma.user.update({
            where: { id: user.id },
            data: { loginAttempts: 0, lockedUntil: null }
          });
        }
        
        return { id: user.id, email: user.email, name: user.username };
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    AppleProvider({
      clientId: process.env.APPLE_ID!,
      clientSecret: process.env.APPLE_SECRET!,
    }),
    // Connection-only providers (not for login)
    TwitterProvider({
      clientId: process.env.TWITTER_CLIENT_ID!,
      clientSecret: process.env.TWITTER_CLIENT_SECRET!,
      version: "2.0",
    }),
    RobloxProvider({
      clientId: process.env.ROBLOX_CLIENT_ID!,
      clientSecret: process.env.ROBLOX_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger }) {
      // OPTIMIZATION: Only query DB on first sign-in or explicit update
      // This prevents a DB query on every single API request
      
      // First sign-in: populate token from user object and DB
      if (user) {
        token.id = (user as { id: string }).id;

        // Fetch username/password from DB on first sign-in only
        try {
          const dbUser = await prisma.user.findUnique({ 
            where: { id: token.id as string }, 
            select: { username: true, password: true } 
          });
          if (dbUser?.username) token.username = dbUser.username;
          token.needsPassword = !dbUser?.password;
        } catch {
          // Use fallback from user object
          token.username = (user as { name?: string }).name || "";
          token.needsPassword = false;
        }
      }
      
      // Explicit update trigger: refresh from DB (e.g., after username change)
      if (trigger === "update" && token.id) {
        try {
          const dbUser = await prisma.user.findUnique({ 
            where: { id: token.id as string }, 
            select: { username: true, password: true } 
          });
          if (dbUser?.username) token.username = dbUser.username;
          token.needsPassword = !dbUser?.password;
        } catch {
          // Keep existing token values on error
        }
      }
      
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as { id: string }).id = token.id as string;
        (session.user as { username: string }).username = (token as { username?: string }).username || (session.user as { name?: string }).name || "";
        (session.user as { needsPassword?: boolean }).needsPassword = (token as { needsPassword?: boolean }).needsPassword || false;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      // Check if this is a new OAuth signup that needs to set password
      // The URL will contain the callbackUrl which we can check
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      return baseUrl;
    },
  },
};
