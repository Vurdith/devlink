import { NextRequest, NextResponse } from "next/server";
import { getAuthSession } from "@/server/auth";
import { deriveDeviceFingerprint } from "@/lib/security/fingerprint";
import { evaluateAuthAnomaly } from "@/lib/security/anomaly-detection";

export async function POST(request: NextRequest) {
  const session = await getAuthSession();
  const userId = session?.user?.id;
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const fingerprint = deriveDeviceFingerprint(request);
  const result = await evaluateAuthAnomaly({
    actorId: userId,
    fingerprint,
  });

  return NextResponse.json({
    fingerprint,
    ...result,
  });
}
