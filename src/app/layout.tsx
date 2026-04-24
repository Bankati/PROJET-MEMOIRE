import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

import { SessionProvider } from "@/components/providers/session-provider";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "LBS Call Center — Prospection intelligente pour l’enseignement supérieur",
    template: "%s • LBS Call Center",
  },
  description:
    "Plateforme SaaS de gestion de centre d’appels pour universités et écoles: campagnes, attribution de contacts, interface agent avec IA (RAG), KPI par rôle, exports, et messagerie WhatsApp.",
  applicationName: "LBS Call Center",
  metadataBase: new URL("http://localhost:3000"),
  /** Évite la route implicite `/favicon.ico` manquante (erreurs ENOENT au build). */
  icons: {
    icon: [{ url: "/LBS%20LOGO.jpeg", type: "image/jpeg" }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={`${inter.variable} h-full antialiased`} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem("theme");if(t==="dark"||(!t&&window.matchMedia("(prefers-color-scheme:dark)").matches)){document.documentElement.classList.add("dark")}}catch(e){}})()`,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-white text-zinc-950 dark:bg-black dark:text-zinc-50" suppressHydrationWarning>
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
