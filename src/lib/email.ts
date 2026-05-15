import { Resend } from "resend";

import { env } from "@/lib/env";

const resend = new Resend(env.RESEND_API_KEY);

const buildOtpDigits = (otpCode: string): string =>
  otpCode
    .split("")
    .map(
      (digit) =>
        `<td style="padding:0 5px;">
          <table cellpadding="0" cellspacing="0">
            <tr>
              <td style="width:44px;height:56px;text-align:center;vertical-align:middle;font-size:28px;font-weight:bold;background:#f8fafc;border:2px solid #e2e8f0;border-radius:8px;color:#1e293b;font-family:Courier New,monospace;">
                ${digit}
              </td>
            </tr>
          </table>
        </td>`,
    )
    .join("");

const buildEmailHtml = (otpCode: string): string => `
<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:24px;background:#f1f5f9;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center">
        <table width="480" cellpadding="0" cellspacing="0" style="border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.12);">

          <!-- En-tête sombre avec logo texte LBS -->
          <tr>
            <td style="background:#0f1117;padding:18px 24px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <img src="https://nhidybufbvkoreoafdgm.supabase.co/storage/v1/object/public/assets/lbs-logo.jpeg"
                         alt="LBS" style="height:42px;display:block;border-radius:4px;" />
                  </td>
                  <td align="right" style="color:#4ade80;font-size:13px;white-space:nowrap;font-family:Arial,sans-serif;">
                    <table cellpadding="0" cellspacing="0" style="display:inline-table;float:right;">
                      <tr>
                        <td style="width:8px;height:8px;background:#4ade80;border-radius:50%;vertical-align:middle;"></td>
                        <td style="padding-left:6px;color:#4ade80;font-size:13px;vertical-align:middle;">Email sécurisé</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Corps blanc -->
          <tr>
            <td style="background:#ffffff;padding:36px 32px 28px;">
              <table width="100%" cellpadding="0" cellspacing="0">

                <!-- Icône cadenas -->
                <tr>
                  <td align="center" style="padding-bottom:24px;">
                    <table cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="width:76px;height:76px;background:#1e2130;border-radius:50%;text-align:center;vertical-align:middle;font-size:34px;line-height:76px;">
                          🔒
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Titre -->
                <tr>
                  <td align="center" style="padding-bottom:12px;">
                    <span style="font-size:22px;font-weight:700;color:#0f1117;font-family:Arial,sans-serif;">Votre code de vérification</span>
                  </td>
                </tr>

                <!-- Sous-titre -->
                <tr>
                  <td align="center" style="padding-bottom:28px;">
                    <span style="font-size:14px;color:#6b7280;line-height:1.6;font-family:Arial,sans-serif;">
                      Utilisez ce code à usage unique pour confirmer votre identité.<br>
                      Il est valable pendant <strong style="color:#1a56db;">10 minutes</strong>.
                    </span>
                  </td>
                </tr>

                <!-- Label CODE OTP -->
                <tr>
                  <td align="center" style="padding-bottom:14px;">
                    <span style="font-size:11px;color:#9ca3af;letter-spacing:3px;text-transform:uppercase;font-family:Arial,sans-serif;">Code OTP</span>
                  </td>
                </tr>

                <!-- Chiffres OTP -->
                <tr>
                  <td align="center" style="padding-bottom:22px;">
                    <table cellpadding="0" cellspacing="0">
                      <tr>${buildOtpDigits(otpCode)}</tr>
                    </table>
                  </td>
                </tr>

                <!-- Badge expiration -->
                <tr>
                  <td align="center" style="padding-bottom:28px;">
                    <table cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="background:#fef3c7;border:1px solid #fcd34d;border-radius:999px;padding:8px 20px;">
                          <span style="color:#d97706;font-size:13px;font-family:Arial,sans-serif;">&#9201; Expire dans 10 minutes</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Encadré vert -->
                <tr>
                  <td style="background:#f0fdf4;border-left:4px solid #22c55e;border-radius:0 8px 8px 0;padding:14px 16px;">
                    <span style="font-size:13px;color:#166534;line-height:1.6;font-family:Arial,sans-serif;">
                      &#10003; Ce code a été généré suite à votre demande de connexion sur <strong>LBS Call Center</strong>.
                      Saisissez-le sur la page de vérification pour accéder à votre compte.
                    </span>
                  </td>
                </tr>

                <tr><td style="height:12px;"></td></tr>

                <!-- Encadré orange avertissement -->
                <tr>
                  <td style="background:#fff7ed;border-left:4px solid #f97316;border-radius:0 8px 8px 0;padding:14px 16px;">
                    <span style="font-size:13px;color:#9a3412;line-height:1.6;font-family:Arial,sans-serif;">
                      &#9888; <strong>Ne partagez jamais ce code.</strong> Notre équipe ne vous demandera jamais votre OTP
                      par téléphone ou par email. Si vous n'avez pas effectué cette demande, ignorez cet email et
                      sécurisez votre compte.
                    </span>
                  </td>
                </tr>

              </table>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

export const sendPasswordResetOtp = async ({
  to,
  otpCode,
}: Readonly<{
  to: string;
  otpCode: string;
}>): Promise<void> => {
  const recipient = env.RESEND_TEST_TO ?? to;
  if (env.RESEND_TEST_TO) {
    console.log(`[Resend] Mode sandbox — redirection de ${to} vers ${recipient}`);
  }

  const { data, error } = await resend.emails.send({
    from: "onboarding@resend.dev",
    to: recipient,
    subject: "Votre code de réinitialisation — LBS Call Center",
    html: buildEmailHtml(otpCode),
  });

  if (error) {
    console.error("[Resend] Échec envoi email:", error);
    throw new Error(`Impossible d'envoyer l'email : ${error.message}`);
  }

  console.log("[Resend] Email envoyé avec succès, id:", data?.id);
};
