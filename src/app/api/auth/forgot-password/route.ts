/**
 * Endpoint de génération OTP pour reset mot de passe.
 */
import { NextResponse } from "next/server";

import { createPasswordResetOtp } from "@/lib/auth/auth-service";

type ForgotPayload = Readonly<{ email: string }>;

export const POST = async (request: Request): Promise<Response> => {
  const payloadRaw: unknown = await request.json().catch(() => null);
  if (
    typeof payloadRaw !== "object" ||
    payloadRaw === null ||
    !("email" in payloadRaw) ||
    typeof payloadRaw.email !== "string"
  ) {
    return NextResponse.json(
      { ok: false, message: "Adresse e-mail invalide." },
      { status: 400 },
    );
  }
  const payload: ForgotPayload = { email: payloadRaw.email };
  const otpCode: string | null = await createPasswordResetOtp({ email: payload.email });
  if (otpCode === null) {
    return NextResponse.json({
      ok: true,
      message: "Si ce compte existe, un OTP a été généré.",
    });
  }
  return NextResponse.json({
    ok: true,
    message: "OTP généré pour la démo.",
    otpCode,
  });
};
