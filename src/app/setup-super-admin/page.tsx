import type { Metadata } from "next";

import { AuthShell } from "@/components/auth/auth-shell";
import { SetupSuperAdminForm } from "@/components/auth/setup-super-admin-form";

export const metadata: Metadata = {
  title: "Initialisation",
  description: "Initialisez le premier super-admin de la plateforme.",
};

export default function SetupSuperAdminPage(): React.JSX.Element {
  return (
    <AuthShell
      title="Initialisation plateforme"
      description="Créez le premier compte super-admin. Cette opération n'est possible qu'une seule fois."
      footerLabel="Retour connexion"
      footerHref="/login"
      footerText=""
    >
      <SetupSuperAdminForm />
    </AuthShell>
  );
}
