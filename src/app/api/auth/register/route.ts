import { NextResponse } from "next/server";
import { prisma } from "@/server/db";
import { hash } from "bcryptjs";
import { sanitizeAndValidate, RateLimiter } from "@/lib/validation";

// Rate limiter for registration attempts
const rateLimiter = new RateLimiter(3, 15 * 60 * 1000); // 3 attempts per 15 minutes

export async function POST(req: Request) {
  try {
    const { username, email, password } = await req.json();
    
    // Basic input validation
    if (!username || !email || !password) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    // Rate limiting
    const clientIP = req.headers.get('x-forwarded-for') || 'unknown';
    if (!rateLimiter.isAllowed(clientIP)) {
      const remainingTime = Math.ceil(rateLimiter.getRemainingTime(clientIP) / 60000);
      return NextResponse.json({ 
        error: `Too many registration attempts. Please try again in ${remainingTime} minutes.` 
      }, { status: 429 });
    }

    // Sanitize and validate inputs
    const { sanitized: sanitizedUsername, validation: usernameValidation } = sanitizeAndValidate(username, 'username');
    if (!usernameValidation.isValid) {
      return NextResponse.json({ error: usernameValidation.errors[0] }, { status: 400 });
    }

    const { sanitized: sanitizedEmail, validation: emailValidation } = sanitizeAndValidate(email, 'email');
    if (!emailValidation.isValid) {
      return NextResponse.json({ error: emailValidation.errors[0] }, { status: 400 });
    }

    const { sanitized: sanitizedPassword, validation: passwordValidation } = sanitizeAndValidate(password, 'password');
    if (!passwordValidation.isValid) {
      return NextResponse.json({ error: passwordValidation.errors[0] }, { status: 400 });
    }

    const existing = await prisma.user.findFirst({ where: { OR: [{ email: sanitizedEmail }, { username: sanitizedUsername }] } });
    if (existing) {
      return NextResponse.json({ error: "User already exists" }, { status: 409 });
    }

    const hashed = await hash(sanitizedPassword, 12);

    const user = await prisma.user.create({
      data: { username: sanitizedUsername, email: sanitizedEmail, password: hashed },
    });

    // Create a minimal Profile; do not pass skills directly (many-to-many)
    await prisma.profile.create({ data: { userId: user.id, bio: "" } });

    return NextResponse.json({ user: { id: user.id, username: user.username, email: user.email } });
  } catch (err) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
