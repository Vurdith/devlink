import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import AppleProvider from "next-auth/providers/apple";
import TwitterProvider from "next-auth/providers/twitter";
import RobloxProvider from "./providers/roblox";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/server/db";
import { compare } from "bcryptjs";

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
    error: "/login",
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
        });
        if (!user || !user.password) return null;
        const ok = await compare(credentials.password, user.password);
        if (!ok) return null;
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
    async signIn({ user, account, profile }) {
      if (account?.provider === "credentials") {
        return true;
      }
      
      if (account?.provider && profile && user.email) {
        try {
          const email = normalizeEmail(user.email);
          // Use a transaction for atomicity
          await prisma.$transaction(async (tx) => {
            // Check if user exists by email
            const existingUser = await tx.user.findFirst({
              where: { email: { equals: email, mode: "insensitive" } },
              include: { accounts: true }
            });

            if (existingUser) {
              // Check if this social account is already linked
              const existingAccount = existingUser.accounts.find(
                acc => acc.provider === account.provider && acc.providerAccountId === account.providerAccountId
              );
              
              if (!existingAccount) {
                // Link new social account to existing user
                await tx.account.create({
                  data: {
                    userId: existingUser.id,
                    type: account.type,
                    provider: account.provider,
                    providerAccountId: account.providerAccountId,
                    refresh_token: account.refresh_token,
                    access_token: account.access_token,
                    expires_at: account.expires_at,
                    token_type: account.token_type,
                    scope: account.scope,
                    id_token: account.id_token,
                    session_state: account.session_state as string | undefined,
                  }
                });
              }
            } else {
              // Create new user from social login
              const sanitizeUsername = (name: string | null | undefined, email: string): string => {
                // Start with name or email prefix
                const baseName = name || email.split('@')[0];
                // Only allow alphanumeric and underscores, minimum 3 chars
                let sanitized = baseName
                  .toLowerCase()
                  .replace(/[^a-z0-9_]/g, '')
                  .replace(/^_+|_+$/g, '') // Remove leading/trailing underscores
                  .substring(0, 20);
                
                // Ensure minimum length
                if (sanitized.length < 3) {
                  sanitized = 'user' + Math.random().toString(36).substring(2, 8);
                }
                
                return sanitized;
              };

              const baseUsername = sanitizeUsername(user.name, email);
              let username = baseUsername;
              let counter = 1;
              const maxAttempts = 100; // Prevent infinite loop

              // Ensure username is unique
              while (counter < maxAttempts) {
                const existingUsername = await tx.user.findUnique({ 
                  where: { username },
                  select: { id: true }
                });
                
                if (!existingUsername) break;
                
                username = `${baseUsername}${counter}`;
                counter++;
              }

              // If we couldn't find a unique username, generate a random one
              if (counter >= maxAttempts) {
                username = `user${Date.now().toString(36)}${Math.random().toString(36).substring(2, 6)}`;
              }

              const newUser = await tx.user.create({
                data: {
                  email,
                  username,
                  name: user.name,
                  image: user.image,
                  emailVerified: new Date(),
                }
              });

              // Create profile for new user
              await tx.profile.create({
                data: {
                  userId: newUser.id,
                  bio: null,
                  profileType: "DEVELOPER",
                  avatarUrl: user.image ?? null,
                }
              });

              // Create the OAuth account link
              await tx.account.create({
                data: {
                  userId: newUser.id,
                  type: account.type,
                  provider: account.provider,
                  providerAccountId: account.providerAccountId,
                  refresh_token: account.refresh_token,
                  access_token: account.access_token,
                  expires_at: account.expires_at,
                  token_type: account.token_type,
                  scope: account.scope,
                  id_token: account.id_token,
                  session_state: account.session_state as string | undefined,
                }
              });

            }
          });
          
          return true;
        } catch (error) {
          console.error("[OAuth SignIn Error]", error);
          return false;
        }
      }
      
      return true;
    },
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
        } catch (e) {
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
        } catch (e) {
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
