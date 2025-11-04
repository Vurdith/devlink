import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import AppleProvider from "next-auth/providers/apple";
import TwitterProvider from "next-auth/providers/twitter";
import RobloxProvider from "./providers/roblox";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/server/db";
import { compare } from "bcryptjs";

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
        const user = await prisma.user.findUnique({ where: { email: credentials.email } });
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
          // Check if user exists by email
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email },
            include: { accounts: true }
          });

          if (existingUser) {
            // Check if this social account is already linked
            const existingAccount = existingUser.accounts.find(
              acc => acc.provider === account.provider && acc.providerAccountId === account.providerAccountId
            );
            
            if (!existingAccount) {
              // Link new social account to existing user
              await prisma.account.create({
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
                  session_state: account.session_state,
                }
              });
            }
            return true;
          } else {
            // Create new user from social login
            const sanitizeUsername = (name: string | null | undefined, email: string): string => {
              if (name) {
                return name
                  .toLowerCase()
                  .replace(/[^a-z0-9_]/g, '') // Only allow alphanumeric and underscores
                  .substring(0, 20) // Limit length
                  || email.split('@')[0].replace(/[^a-z0-9_]/g, '').substring(0, 20);
              }
              return email.split('@')[0].replace(/[^a-z0-9_]/g, '').substring(0, 20);
            };

            const baseUsername = sanitizeUsername(user.name, user.email);
            let username = baseUsername;
            let counter = 1;

            // Ensure username is unique
            while (await prisma.user.findUnique({ where: { username } })) {
              username = `${baseUsername}${counter}`;
              counter++;
            }

            const newUser = await prisma.user.create({
              data: {
                email: user.email,
                username,
                name: user.name,
                image: user.image,
                emailVerified: new Date(),
              }
            });

            // Create profile for new user
            await prisma.profile.create({
              data: {
                userId: newUser.id,
                bio: null,
                profileType: "DEVELOPER",
                // Seed avatar with provider image so UI shows a proper avatar immediately
                avatarUrl: user.image ?? null,
              }
            });

            return true;
          }
        } catch (error) {
          console.error("Error in signIn callback:", error);
          return false;
        }
      }
      
      return true;
    },
    async jwt({ token, user }) {
      // Persist user.id on first sign-in
      if (user) {
        token.id = (user as { id: string }).id;
      }
      // Always resolve canonical DevLink username from DB so OAuth shows username (not provider display name)
      if (token.id) {
        try {
          const dbUser = await prisma.user.findUnique({ where: { id: token.id as string }, select: { username: true } });
          if (dbUser?.username) token.username = dbUser.username;
        } catch (e) {
          // noop
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as { id: string }).id = token.id as string;
        (session.user as { username: string }).username = (token as { username?: string }).username || (session.user as { name?: string }).name || "";
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      return baseUrl;
    },
  },
};
