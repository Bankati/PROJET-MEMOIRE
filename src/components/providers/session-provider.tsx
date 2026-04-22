"use client";
/**
 * Provider de session Auth.js pour les composants client.
 */
import { SessionProvider as NextAuthSessionProvider } from "next-auth/react";

export const SessionProvider = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>): React.JSX.Element => {
  return <NextAuthSessionProvider>{children}</NextAuthSessionProvider>;
};
