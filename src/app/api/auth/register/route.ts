import { NextResponse } from "next/server";
import { prisma } from "@/server/db";
import { hash } from "bcryptjs";
import { sanitizeAndValidate, RateLimiter } from "@/lib/validation";

// Rate limiter for registration attempts (5 attempts per 15 minutes is more reasonable)
const rateLimiter = new RateLimiter(5, 15 * 60 * 1000);

// Reserved usernames that cannot be registered
const RESERVED_USERNAMES = new Set([
  'admin', 'administrator', 'moderator', 'mod', 'support', 'help',
  'devlink', 'official', 'roblox', 'staff', 'team', 'system',
  'api', 'www', 'mail', 'email', 'null', 'undefined', 'root',
  'settings', 'profile', 'login', 'register', 'logout', 'home'
]);

export async function POST(req: Request) {
  try {
    // Parse request body
    let body;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    const { username, email, password } = body;
    
    // Basic input validation
    if (!username || !email || !password) {
      return NextResponse.json({ 
        error: "Please fill in all fields" 
      }, { status: 400 });
    }

    // Rate limiting by IP
    const clientIP = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 
                     req.headers.get('x-real-ip') || 
                     'unknown';
    
    if (!rateLimiter.isAllowed(clientIP)) {
      const remainingTime = Math.ceil(rateLimiter.getRemainingTime(clientIP) / 60000);
      return NextResponse.json({ 
        error: `Too many registration attempts. Please try again in ${remainingTime} minute${remainingTime !== 1 ? 's' : ''}.` 
      }, { status: 429 });
    }

    // Sanitize and validate username
    const { sanitized: sanitizedUsername, validation: usernameValidation } = sanitizeAndValidate(username, 'username');
    if (!usernameValidation.isValid) {
      return NextResponse.json({ error: usernameValidation.errors[0] }, { status: 400 });
    }

    // Check reserved usernames
    if (RESERVED_USERNAMES.has(sanitizedUsername)) {
      return NextResponse.json({ error: "This username is reserved" }, { status: 400 });
    }

    // Sanitize and validate email
    const { sanitized: sanitizedEmail, validation: emailValidation } = sanitizeAndValidate(email, 'email');
    if (!emailValidation.isValid) {
      return NextResponse.json({ error: emailValidation.errors[0] }, { status: 400 });
    }

    // Sanitize and validate password
    const { sanitized: sanitizedPassword, validation: passwordValidation } = sanitizeAndValidate(password, 'password');
    if (!passwordValidation.isValid) {
      return NextResponse.json({ error: passwordValidation.errors[0] }, { status: 400 });
    }

    // Use a transaction to ensure atomicity
    const result = await prisma.$transaction(async (tx) => {
      // Check for existing user with same email or username
      const existingByEmail = await tx.user.findUnique({ 
        where: { email: sanitizedEmail },
        select: { id: true }
      });
      
      if (existingByEmail) {
        throw new Error("EMAIL_EXISTS");
      }

      const existingByUsername = await tx.user.findUnique({ 
        where: { username: sanitizedUsername },
        select: { id: true }
      });
      
      if (existingByUsername) {
        throw new Error("USERNAME_EXISTS");
      }

      // Hash password
      const hashedPassword = await hash(sanitizedPassword, 12);

      // Create user
      const user = await tx.user.create({
        data: { 
          username: sanitizedUsername, 
          email: sanitizedEmail, 
          password: hashedPassword 
        },
        select: {
          id: true,
          username: true,
          email: true
        }
      });

      // Create profile for the user
      await tx.profile.create({ 
        data: { 
          userId: user.id, 
          bio: null,
          profileType: "DEVELOPER"
        } 
      });

      return user;
    });

    return NextResponse.json({ 
      success: true,
      user: { 
        id: result.id, 
        username: result.username, 
        email: result.email 
      } 
    });

  } catch (err) {
    // Handle specific errors
    if (err instanceof Error) {
      if (err.message === "EMAIL_EXISTS") {
        return NextResponse.json({ 
          error: "An account with this email already exists" 
        }, { status: 409 });
      }
      
      if (err.message === "USERNAME_EXISTS") {
        return NextResponse.json({ 
          error: "This username is already taken" 
        }, { status: 409 });
      }

      // Log unexpected errors for debugging
      console.error("[Register Error]", err.message);
    }

    // Handle Prisma unique constraint violations (fallback)
    if (err && typeof err === 'object' && 'code' in err) {
      const prismaError = err as { code: string; meta?: { target?: string[] } };
      if (prismaError.code === 'P2002') {
        const target = prismaError.meta?.target?.[0];
        if (target === 'email') {
          return NextResponse.json({ 
            error: "An account with this email already exists" 
          }, { status: 409 });
        }
        if (target === 'username') {
          return NextResponse.json({ 
            error: "This username is already taken" 
          }, { status: 409 });
        }
        return NextResponse.json({ 
          error: "Account already exists" 
        }, { status: 409 });
      }
    }

    return NextResponse.json({ 
      error: "Something went wrong. Please try again." 
    }, { status: 500 });
  }
}
