"use client";
/**
 * Formulaire de demande OTP.
 * Après génération réussie, redirige vers la page de saisie OTP avec l'email pré-rempli.
 */
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";

type ForgotResponse = Readonly<{
  ok: boolean;
  message: string;
  otpCode?: string;
}>;

export const ForgotPasswordForm = (): React.JSX.Element => {
  const router = useRouter();
  const [email, setEmail] = useState<string>("");
  const [feedback, setFeedback] = useState<string>("");
  const [otpCode, setOtpCode] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    setIsSubmitting(true);
    setFeedback("");
    setOtpCode("");
    const response: Response = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const payload: ForgotResponse = await response.json();
    setFeedback(payload.message);
    setOtpCode(payload.otpCode ?? "");
    setIsSubmitting(false);
    if (payload.ok) {
      setTimeout(() => {
        router.push(`/reset-password?email=${encodeURIComponent(email)}`);
      }, 2000);
    }
  };
  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div className="space-y-2 text-left">
        <label htmlFor="email" className="text-sm font-medium text-zinc-700 dark:text-zinc-200">
          E-mail du compte
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="vous@etablissement.fr"
          value={email}
          onChange={(event: React.ChangeEvent<HTMLInputElement>): void => setEmail(event.target.value)}
          className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-900 outline-none ring-lbs-blue/0 transition placeholder:text-zinc-400 focus:border-lbs-blue/50 focus:ring-2 focus:ring-lbs-blue/20 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50 dark:placeholder:text-zinc-500"
          required
        />
      </div>
      {feedback ? (
        <p className="rounded-lg border border-emerald-300/40 bg-emerald-50/80 px-3 py-2 text-sm text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-950/25 dark:text-emerald-300">
          {feedback}
        </p>
      ) : null}
      {otpCode ? (
        <p className="rounded-lg border border-lbs-blue/35 bg-lbs-blue/8 px-3 py-2 text-sm text-lbs-blue dark:border-lbs-blue/35 dark:bg-lbs-blue/18 dark:text-blue-200">
          OTP de démonstration: <span className="font-semibold">{otpCode}</span>
          <span className="mt-1 block text-xs text-zinc-500 dark:text-zinc-400">Redirection vers la saisie du code...</span>
        </p>
      ) : null}
      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Envoi..." : "Générer un OTP (3 min)"}
      </Button>
    </form>
  );
};
