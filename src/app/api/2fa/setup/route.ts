import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/server/auth-options";
import * as OTPAuth from "otpauth";
import QRCode from "qrcode";

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || !session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const secret = new OTPAuth.Secret();
    const totp = new OTPAuth.TOTP({
      secret: secret.base32,
      issuer: "DevLink",
      label: session.user.email,
      digits: 6,
      period: 30,
    });

    const qrCode = await QRCode.toDataURL(totp.toString());

    return NextResponse.json({ qrCode, secret: secret.base32 });
  } catch (error) {
    console.error("Error setting up 2FA:", error);
    return NextResponse.json(
      { error: "Failed to setup 2FA" },
      { status: 500 }
    );
  }
}
