import type { Metadata } from "next";
import Link from "next/link";

import { AuthShell } from "@/components/auth/auth-shell";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = {
  title: "Connexion",
  description: "Accédez à la plateforme LBS Call Center.",
};

export default function LoginPage() {
  return (
    <AuthShell
      title="Connexion"
      description="Identifiez-vous pour accéder à LBS Call Center."
      footerLabel="Mot de passe oublié ?"
      footerHref="/forgot-password"
      footerText="Cliquez ici."
    >
      <LoginForm />
      <div className="mt-4 flex items-center justify-center">
        <Link
          href="/setup-super-admin"
          className="text-xs font-medium text-zinc-500 hover:text-lbs-blue dark:text-zinc-400 dark:hover:text-blue-300"
        >
          Première utilisation: initialiser le super-admin
        </Link>
      </div>
    </AuthShell>
  );
}
