import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/server/db";
import { randomBytes } from "crypto";
import { sendPasswordResetEmail } from "@/lib/email";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body || {};

    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    // Always respond with success semantics to avoid user enumeration
    // But if a user exists, create a token and send the email.
    if (user) {
      const token = randomBytes(32).toString("hex");
      const expires = new Date(Date.now() + 1000 * 60 * 30); // 30 minutes

      await prisma.passwordResetToken.create({
        data: {
          userId: user.id,
          token,
          expires,
        },
      });

      try {
        await sendPasswordResetEmail(email, token);
      } catch (e) {
        // Email failures should not leak existence; log and continue
        console.error("Failed to send reset email:", e);
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Error requesting password reset:", error);
    return NextResponse.json({ error: "Failed to request password reset" }, { status: 500 });
  }
}


