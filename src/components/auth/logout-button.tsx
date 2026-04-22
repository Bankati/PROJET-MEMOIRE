"use client";
/**
 * Bouton de déconnexion global avec Auth.js.
 */
import { signOut } from "next-auth/react";
import { useState } from "react";

import { Button } from "@/components/ui/button";

export const LogoutButton = (): React.JSX.Element => {
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const handleLogout = async (): Promise<void> => {
    setIsSubmitting(true);
    await signOut({ callbackUrl: "/login" });
  };
  return (
    <Button variant="outline" onClick={handleLogout} disabled={isSubmitting}>
      {isSubmitting ? "Déconnexion..." : "Se déconnecter"}
    </Button>
  );
};
