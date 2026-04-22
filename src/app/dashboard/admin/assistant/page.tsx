/**
 * Interface de l'assistant IA (RAG) pour l'administrateur.
 * Chat style avec historique, suggestions rapides et zone de saisie.
 * Conçue pour être utilisée pendant les appels (panneau latéral intégrable).
 */
import { Bot, GraduationCap, BookOpen, CreditCard, FileText, Send, Sparkles } from "lucide-react";

import { requireRole } from "@/lib/auth/server-auth";

type QuickSuggestion = Readonly<{
  id: string;
  label: string;
  icon: React.ReactNode;
  query: string;
}>;

const quickSuggestions: readonly QuickSuggestion[] = [
  { id: "scolarite", label: "Scolarité", icon: <GraduationCap className="size-3.5" />, query: "Quels sont les programmes de scolarité disponibles ?" },
  { id: "frais", label: "Frais", icon: <CreditCard className="size-3.5" />, query: "Quels sont les frais de scolarité et les modalités de paiement ?" },
  { id: "admission", label: "Admission", icon: <FileText className="size-3.5" />, query: "Quelles sont les conditions d'admission et les documents requis ?" },
  { id: "programme", label: "Programme", icon: <BookOpen className="size-3.5" />, query: "Détaillez les programmes et filières proposés." },
];

export default async function AdminAssistantPage(): Promise<React.JSX.Element> {
  await requireRole({ allowedRoles: ["admin"] });
  return (
    <div className="flex h-[calc(100vh-7rem)] flex-col">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Assistant IA</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">Posez vos questions pour obtenir des réponses rapides pendant les appels</p>
      </div>
      <div className="flex flex-1 flex-col rounded-2xl border border-zinc-200/70 bg-white shadow-sm dark:border-white/10 dark:bg-[#1a2332]">
        <div className="flex-1 overflow-y-auto p-5">
          <div className="mx-auto max-w-2xl space-y-4">
            <div className="flex gap-3">
              <div className="grid size-8 shrink-0 place-items-center rounded-full bg-gradient-to-br from-[#244976] to-[#21416C]">
                <Bot className="size-4 text-white" />
              </div>
              <div className="max-w-[80%] rounded-2xl rounded-tl-sm bg-zinc-100 px-4 py-3 dark:bg-white/10">
                <p className="text-sm leading-relaxed text-zinc-700 dark:text-zinc-200">
                  Bonjour ! Je suis votre assistant IA. Je peux vous aider à répondre rapidement aux questions des prospects pendant vos appels. Posez-moi une question sur la scolarité, les frais, l&apos;admission ou les programmes.
                </p>
              </div>
            </div>
            <div className="flex flex-row-reverse gap-3">
              <div className="grid size-8 shrink-0 place-items-center rounded-full bg-gradient-to-br from-blue-400 to-blue-600">
                <span className="text-xs font-semibold text-white">V</span>
              </div>
              <div className="max-w-[80%] rounded-2xl rounded-tr-sm bg-lbs-blue px-4 py-3 text-white">
                <p className="text-sm leading-relaxed">
                  Quels sont les frais de scolarité pour la licence ?
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="grid size-8 shrink-0 place-items-center rounded-full bg-gradient-to-br from-[#244976] to-[#21416C]">
                <Bot className="size-4 text-white" />
              </div>
              <div className="max-w-[80%] rounded-2xl rounded-tl-sm bg-zinc-100 px-4 py-3 dark:bg-white/10">
                <p className="text-sm leading-relaxed text-zinc-700 dark:text-zinc-200">
                  Les frais de scolarité pour la licence varient selon la filière choisie. En règle générale, ils comprennent les droits d&apos;inscription, les frais de formation et les frais annexes. Je vous recommande de consulter la grille tarifaire officielle pour obtenir les montants exacts par filière.
                </p>
                <div className="mt-2 rounded-lg bg-blue-50 p-2.5 text-xs text-blue-700 dark:bg-blue-500/10 dark:text-blue-300">
                  <Sparkles className="mb-0.5 inline size-3" /> Source : Base de connaissances LBS
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="border-t border-zinc-200/70 p-4 dark:border-white/10">
          <div className="mx-auto max-w-2xl">
            <div className="mb-3 flex flex-wrap gap-2">
              {quickSuggestions.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-600 transition hover:border-lbs-blue hover:bg-lbs-blue/5 hover:text-lbs-blue dark:border-white/15 dark:bg-white/5 dark:text-zinc-300 dark:hover:border-blue-400 dark:hover:text-blue-300"
                >
                  {s.icon}
                  {s.label}
                </button>
              ))}
            </div>
            <div className="flex items-end gap-3">
              <div className="relative flex-1">
                <textarea
                  rows={1}
                  placeholder="Posez votre question..."
                  className="w-full resize-none rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 pr-12 text-sm text-zinc-800 outline-none transition focus:border-lbs-blue focus:bg-white focus:ring-2 focus:ring-lbs-blue/20 dark:border-white/15 dark:bg-[#0f1729] dark:text-white dark:focus:bg-[#0f1729]"
                />
                <button
                  type="button"
                  className="absolute bottom-2 right-2 grid size-8 place-items-center rounded-lg bg-gradient-to-r from-[#244976] to-[#21416C] text-white transition hover:brightness-110"
                >
                  <Send className="size-4" />
                </button>
              </div>
            </div>
            <p className="mt-2 text-center text-[10px] text-zinc-400">L&apos;assistant utilise la base de connaissances LBS pour générer ses réponses.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
