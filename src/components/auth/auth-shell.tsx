/**
 * Conteneur premium réutilisable pour les écrans d'authentification.
 */
import Image from "next/image";
import Link from "next/link";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type AuthShellProps = Readonly<{
  title: string;
  description: string;
  footerLabel: string;
  footerHref: string;
  footerText: string;
  children: React.ReactNode;
}>;

export const AuthShell = ({
  title,
  description,
  footerLabel,
  footerHref,
  footerText,
  children,
}: AuthShellProps): React.JSX.Element => {
  return (
    <div className="relative flex min-h-screen flex-col bg-[#f5f6f8] dark:bg-zinc-950">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-20 top-0 h-72 w-72 rounded-full bg-lbs-blue/15 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-lbs-red/10 blur-3xl" />
      </div>
      <header className="relative z-10 border-b border-zinc-200/80 bg-white/80 backdrop-blur dark:border-zinc-800 dark:bg-black/60">
        <div className="mx-auto flex max-w-lg items-center justify-between px-4 py-4 sm:px-6">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/LBS%20LOGO.jpeg"
              alt="Lomé Business School"
              width={44}
              height={44}
              className="rounded-lg border border-zinc-200/70 object-cover dark:border-zinc-700"
              priority
            />
          </Link>
        </div>
      </header>
      <main className="relative z-10 flex flex-1 items-center justify-center px-4 py-12 sm:px-6">
        <Card className="w-full max-w-md border-zinc-200/80 shadow-xl shadow-zinc-900/10 dark:border-zinc-800 dark:bg-zinc-900/80">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-semibold tracking-tight">{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </CardHeader>
          <CardContent>
            {children}
            <p className="mt-5 text-center text-xs text-zinc-500 dark:text-zinc-400">
              <Link href={footerHref} className="font-medium text-lbs-blue hover:underline dark:text-blue-300">
                {footerLabel}
              </Link>{" "}
              {footerText}
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};
