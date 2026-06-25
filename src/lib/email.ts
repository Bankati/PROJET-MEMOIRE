import { Resend } from 'resend'
import { env } from '@/lib/env'

const buildEmailHtml = (otpCode: string, name: string): string => `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Réinitialisation de mot de passe — LBS Call Center</title>
</head>
<body style="margin:0;padding:0;background-color:#f0f4fa;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="520" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:12px;border:1px solid #e5e7eb;overflow:hidden;">
          <tr>
            <td style="background-color:#001b61;padding:24px 32px;">
              <p style="margin:0;color:#ffffff;font-size:18px;font-weight:700;">LBS Call Center</p>
              <p style="margin:4px 0 0;color:rgba(255,255,255,0.6);font-size:12px;">SERVICES DE SÉCURITÉ</p>
            </td>
          </tr>
          <tr>
            <td style="padding:32px;">
              <p style="margin:0 0 16px;color:#000d32;font-size:16px;font-weight:600;">Réinitialisation de mot de passe</p>
              <p style="margin:0 0 24px;color:#4b5563;font-size:14px;line-height:22px;">
                Bonjour ${name},<br/><br/>
                Vous avez demandé la réinitialisation de votre mot de passe. Voici votre code de vérification :
              </p>
              <div style="text-align:center;margin:24px 0;">
                <span style="display:inline-block;background-color:#f0f4fa;border:2px solid #001b61;border-radius:12px;padding:16px 32px;font-size:32px;font-weight:700;letter-spacing:8px;color:#001b61;">
                  ${otpCode}
                </span>
              </div>
              <p style="margin:0 0 16px;color:#6b7280;font-size:13px;text-align:center;">
                Ce code expire dans <strong>10 minutes</strong> et ne peut être utilisé qu'une seule fois.
              </p>
              <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;" />
              <p style="margin:0;color:#9ca3af;font-size:12px;">
                Si vous n'êtes pas à l'origine de cette demande, ignorez cet email. Votre mot de passe actuel reste inchangé.
              </p>
            </td>
          </tr>
          <tr>
            <td style="background-color:#f9fafb;padding:16px 32px;border-top:1px solid #e5e7eb;">
              <p style="margin:0;color:#9ca3af;font-size:11px;">
                Cet email a été envoyé par LBS Call Center — plateforme interne.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`

export const sendPasswordResetOtp = async ({
  to,
  otpCode,
  name,
}: Readonly<{
  to: string
  otpCode: string
  name: string
}>): Promise<void> => {
  const resend = new Resend(env.RESEND_API_KEY)
  const recipient = env.RESEND_TEST_TO ?? to

  if (env.RESEND_TEST_TO) {
    console.log(`[Resend] Mode sandbox — redirection de ${to} vers ${recipient}`)
  }

  const { data, error } = await resend.emails.send({
    from: 'LBS Call Center <contact@lbscallcenter.com>',
    to: recipient,
    subject: 'Réinitialisation de mot de passe — LBS Call Center',
    html: buildEmailHtml(otpCode, name),
  })

  if (error) {
    console.error('[Resend] Échec envoi email:', error)
    throw new Error(`Impossible d'envoyer l'email : ${error.message}`)
  }

  console.log('[Resend] Email envoyé avec succès, id:', data?.id)
}
