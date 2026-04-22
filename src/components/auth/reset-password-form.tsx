"use client";
/**
 * Formulaire de réinitialisation en deux étapes :
 * Étape 1 — Saisie de l'OTP avec design cohérent avec la page de connexion.
 * Étape 2 — Définition du nouveau mot de passe.
 * Utilise l'API /api/auth/reset-password pour valider l'OTP et changer le mot de passe.
 */
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useCallback, useEffect, useRef } from "react";
import { CheckCircle2, KeyRound, Loader2, Lock, Mail, ShieldCheck } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type ResetResponse = Readonly<{
  ok: boolean;
  message?: string;
}>;
type ForgotResponse = Readonly<{
  ok: boolean;
  message: string;
  otpCode?: string;
}>;
type ResetStep = "otp" | "password" | "success";

const OTP_LENGTH: number = 6;
const OTP_EXPIRY_SECONDS: number = 180;

export const ResetPasswordForm = (): React.JSX.Element => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailFromQuery: string = searchParams.get("email") ?? "";
  const [step, setStep] = useState<ResetStep>("otp");
  const [email, setEmail] = useState<string>(emailFromQuery);
  const [otpValues, setOtpValues] = useState<string[]>(Array.from({ length: OTP_LENGTH }, () => ""));
  const [newPassword, setNewPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [feedback, setFeedback] = useState<string>("");
  const [feedbackType, setFeedbackType] = useState<"error" | "success">("error");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [countdown, setCountdown] = useState<number>(OTP_EXPIRY_SECONDS);
  const [canResend, setCanResend] = useState<boolean>(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (step !== "otp" || countdown <= 0) {
      if (countdown <= 0) {
        setCanResend(true);
      }
      return;
    }
    const timer: ReturnType<typeof setInterval> = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [step, countdown]);

  const formatCountdown = useCallback((): string => {
    const minutes: number = Math.floor(countdown / 60);
    const seconds: number = countdown % 60;
    return `${minutes}:${String(seconds).padStart(2, "0")}`;
  }, [countdown]);

  const handleOtpChange = useCallback((index: number, value: string): void => {
    if (value.length > 1) {
      const chars: string[] = value.replace(/\D/g, "").split("").slice(0, OTP_LENGTH);
      const newOtp: string[] = [...otpValues];
      chars.forEach((char, i) => {
        if (index + i < OTP_LENGTH) {
          newOtp[index + i] = char;
        }
      });
      setOtpValues(newOtp);
      const nextIndex: number = Math.min(index + chars.length, OTP_LENGTH - 1);
      inputRefs.current[nextIndex]?.focus();
      return;
    }
    const newOtp: string[] = [...otpValues];
    newOtp[index] = value.replace(/\D/g, "");
    setOtpValues(newOtp);
    setFeedback("");
    if (value.length > 0 && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  }, [otpValues]);

  const handleOtpKeyDown = useCallback((index: number, e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === "Backspace" && otpValues[index] === "" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === "ArrowLeft" && index > 0) {
      e.preventDefault();
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === "ArrowRight" && index < OTP_LENGTH - 1) {
      e.preventDefault();
      inputRefs.current[index + 1]?.focus();
    }
  }, [otpValues]);

  const handleOtpPaste = useCallback((e: React.ClipboardEvent<HTMLInputElement>): void => {
    e.preventDefault();
    const pastedData: string = e.clipboardData.getData("text").trim().replace(/\D/g, "");
    const chars: string[] = pastedData.split("").slice(0, OTP_LENGTH);
    const newOtp: string[] = Array.from({ length: OTP_LENGTH }, () => "");
    chars.forEach((char, i) => {
      newOtp[i] = char;
    });
    setOtpValues(newOtp);
    const nextIndex: number = Math.min(chars.length, OTP_LENGTH - 1);
    inputRefs.current[nextIndex]?.focus();
  }, []);

  const handleVerifyOtp = useCallback(async (): Promise<void> => {
    const otpCode: string = otpValues.join("");
    if (otpCode.length !== OTP_LENGTH) {
      setFeedback("Veuillez saisir le code complet.");
      setFeedbackType("error");
      return;
    }
    if (email.trim().length === 0) {
      setFeedback("Veuillez saisir votre adresse e-mail.");
      setFeedbackType("error");
      return;
    }
    setStep("password");
    setFeedback("");
  }, [otpValues, email]);

  const handleResetPassword = useCallback(async (): Promise<void> => {
    if (newPassword.length < 6) {
      setFeedback("Le mot de passe doit contenir au moins 6 caractères.");
      setFeedbackType("error");
      return;
    }
    if (newPassword !== confirmPassword) {
      setFeedback("Les mots de passe ne correspondent pas.");
      setFeedbackType("error");
      return;
    }
    setIsSubmitting(true);
    setFeedback("");
    const otpCode: string = otpValues.join("");
    const response: Response = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email, otpCode, newPassword }),
    });
    const payload: ResetResponse = await response.json();
    if (!payload.ok) {
      setFeedback(payload.message ?? "Réinitialisation impossible. Vérifiez votre OTP.");
      setFeedbackType("error");
      setIsSubmitting(false);
      return;
    }
    setStep("success");
    setIsSubmitting(false);
  }, [otpValues, email, newPassword, confirmPassword]);

  const handleResendOtp = useCallback(async (): Promise<void> => {
    if (email.trim().length === 0) {
      setFeedback("Saisissez votre e-mail pour renvoyer le code.");
      setFeedbackType("error");
      return;
    }
    setIsSubmitting(true);
    const response: Response = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const payload: ForgotResponse = await response.json();
    setFeedback(payload.otpCode ? `Nouveau code : ${payload.otpCode}` : payload.message);
    setFeedbackType("success");
    setCountdown(OTP_EXPIRY_SECONDS);
    setCanResend(false);
    setOtpValues(Array.from({ length: OTP_LENGTH }, () => ""));
    setIsSubmitting(false);
  }, [email]);

  const renderShell = (title: string, description: string, children: React.ReactNode): React.JSX.Element => (
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
              <Link href="/login" className="font-medium text-lbs-blue hover:underline dark:text-blue-300">
                Retour à la connexion
              </Link>
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );

  if (step === "success") {
    return renderShell(
      "Mot de passe mis à jour",
      "Votre mot de passe a été réinitialisé avec succès.",
      <div className="space-y-6">
        <div className="flex justify-center">
          <div className="grid size-16 place-items-center rounded-full bg-emerald-100 dark:bg-emerald-500/15">
            <CheckCircle2 className="size-8 text-emerald-600 dark:text-emerald-400" />
          </div>
        </div>
        <p className="text-center text-sm text-zinc-600 dark:text-zinc-400">
          Vous pouvez maintenant vous connecter avec votre nouveau mot de passe.
        </p>
        <button
          type="button"
          onClick={() => { router.push("/login"); router.refresh(); }}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#244976] to-[#21416C] px-6 py-3 text-sm font-medium text-white shadow-lg transition hover:brightness-110"
        >
          Se connecter
        </button>
      </div>
    );
  }

  if (step === "password") {
    return renderShell(
      "Nouveau mot de passe",
      "Définissez votre nouveau mot de passe sécurisé.",
      <div className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="newPassword" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Nouveau mot de passe
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
            <input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => { setNewPassword(e.target.value); setFeedback(""); }}
              placeholder="Minimum 6 caractères"
              className="w-full rounded-xl border border-zinc-200 bg-zinc-50 py-3 pl-10 pr-4 text-sm text-zinc-900 outline-none transition focus:border-lbs-blue focus:bg-white focus:ring-2 focus:ring-lbs-blue/20 dark:border-white/15 dark:bg-white/5 dark:text-white dark:focus:bg-white/10"
              required
              minLength={6}
            />
          </div>
        </div>
        <div className="space-y-2">
          <label htmlFor="confirmPassword" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Confirmer le mot de passe
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => { setConfirmPassword(e.target.value); setFeedback(""); }}
              placeholder="Répétez le mot de passe"
              className="w-full rounded-xl border border-zinc-200 bg-zinc-50 py-3 pl-10 pr-4 text-sm text-zinc-900 outline-none transition focus:border-lbs-blue focus:bg-white focus:ring-2 focus:ring-lbs-blue/20 dark:border-white/15 dark:bg-white/5 dark:text-white dark:focus:bg-white/10"
              required
              minLength={6}
            />
          </div>
        </div>
        {feedback.length > 0 ? (
          <p className={`rounded-xl border px-4 py-2.5 text-sm ${
            feedbackType === "error"
              ? "border-red-200 bg-red-50 text-red-700 dark:border-red-800/30 dark:bg-red-500/10 dark:text-red-300"
              : "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800/30 dark:bg-emerald-500/10 dark:text-emerald-300"
          }`}>
            {feedback}
          </p>
        ) : null}
        <button
          type="button"
          onClick={handleResetPassword}
          disabled={isSubmitting}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#244976] to-[#21416C] px-6 py-3 text-sm font-medium text-white shadow-lg transition hover:brightness-110 disabled:opacity-50"
        >
          {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : <ShieldCheck className="size-4" />}
          {isSubmitting ? "Mise à jour..." : "Mettre à jour le mot de passe"}
        </button>
        <button
          type="button"
          onClick={() => { setStep("otp"); setFeedback(""); }}
          className="w-full text-center text-sm text-zinc-500 transition hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-white"
        >
          ← Modifier le code OTP
        </button>
      </div>
    );
  }

  return renderShell(
    "Vérification OTP",
    emailFromQuery.length > 0
      ? `Entrez le code envoyé à ${emailFromQuery}`
      : "Entrez le code envoyé à votre adresse e-mail.",
    <div className="space-y-4">
      {emailFromQuery.length === 0 ? (
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Adresse e-mail
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setFeedback(""); }}
              placeholder="votre@email.com"
              className="w-full rounded-xl border border-zinc-200 bg-zinc-50 py-3 pl-10 pr-4 text-sm text-zinc-900 outline-none transition focus:border-lbs-blue focus:bg-white focus:ring-2 focus:ring-lbs-blue/20 dark:border-white/15 dark:bg-white/5 dark:text-white dark:focus:bg-white/10"
              required
            />
          </div>
        </div>
      ) : null}
      <div className="space-y-2">
        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Code de vérification
        </label>
        <div className="flex justify-center gap-2">
          {Array.from({ length: OTP_LENGTH }).map((_, index) => (
            <input
              key={index}
              ref={(el) => { inputRefs.current[index] = el; }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={otpValues[index]}
              onChange={(e) => handleOtpChange(index, e.target.value)}
              onKeyDown={(e) => handleOtpKeyDown(index, e)}
              onPaste={handleOtpPaste}
              disabled={isSubmitting}
              autoFocus={index === 0}
              className="size-12 rounded-xl border border-zinc-200 bg-zinc-50 text-center text-lg font-semibold text-zinc-900 outline-none transition focus:border-lbs-blue focus:bg-white focus:ring-2 focus:ring-lbs-blue/20 disabled:opacity-50 dark:border-white/15 dark:bg-white/5 dark:text-white dark:focus:bg-white/10"
            />
          ))}
        </div>
        <p className="text-center text-xs text-zinc-500 dark:text-zinc-400">
          {countdown > 0 ? (
            <>Code valide pendant <span className="font-medium text-lbs-blue dark:text-blue-300">{formatCountdown()}</span></>
          ) : (
            <span className="text-amber-600 dark:text-amber-400">Le code a expiré.</span>
          )}
        </p>
      </div>
      {feedback.length > 0 ? (
        <p className={`rounded-xl border px-4 py-2.5 text-sm ${
          feedbackType === "error"
            ? "border-red-200 bg-red-50 text-red-700 dark:border-red-800/30 dark:bg-red-500/10 dark:text-red-300"
            : "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800/30 dark:bg-emerald-500/10 dark:text-emerald-300"
        }`}>
          {feedback}
        </p>
      ) : null}
      <button
        type="button"
        onClick={handleVerifyOtp}
        disabled={isSubmitting || otpValues.join("").length !== OTP_LENGTH}
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#244976] to-[#21416C] px-6 py-3 text-sm font-medium text-white shadow-lg transition hover:brightness-110 disabled:opacity-50"
      >
        {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : <KeyRound className="size-4" />}
        {isSubmitting ? "Vérification..." : "Vérifier le code"}
      </button>
      <div className="text-center">
        <span className="text-sm text-zinc-500 dark:text-zinc-400">Pas reçu le code ? </span>
        <button
          type="button"
          onClick={handleResendOtp}
          disabled={!canResend || isSubmitting}
          className="text-sm font-medium text-lbs-blue transition hover:underline disabled:text-zinc-400 disabled:no-underline dark:text-blue-300 dark:disabled:text-zinc-500"
        >
          Renvoyer
        </button>
      </div>
    </div>
  );
};
