import type { Metadata } from "next";

import { AuthShell } from "@/components/auth/auth-shell";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";

export const metadata: Metadata = {
  title: "Mot de passe oublié",
  description: "Générez un OTP de réinitialisation valide 3 minutes.",
};

export default function ForgotPasswordPage(): React.JSX.Element {
  return (
    <AuthShell
      title="Mot de passe oublié"
      description="Saisissez votre e-mail. Un OTP temporaire de 3 minutes sera généré."
      footerLabel="Déjà un OTP ?"
      footerHref="/reset-password"
      footerText="Aller à la réinitialisation."
    >
      <ForgotPasswordForm />
    </AuthShell>
  );
}
