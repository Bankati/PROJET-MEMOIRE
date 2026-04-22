"use client";
/**
 * Assistant RAG intégré pour aider l'agent en temps réel.
 * Interface chatbot avec suggestions rapides cliquables.
 * Le backend RAG sera intégré ultérieurement.
 */
import { useState, useRef, useEffect } from "react";
import {
  Bot,
  ChevronDown,
  ChevronUp,
  Loader2,
  Send,
  Sparkles,
} from "lucide-react";

type Message = Readonly<{
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}>;

type RagAssistantProps = Readonly<{
  contactName: string;
  schoolName: string | null;
  campaignTitle: string;
  baseScript: string;
}>;

const quickSuggestions: readonly string[] = [
  "Tarifs",
  "Inscription",
  "Calendrier",
  "Bourses",
  "Hébergement",
  "Formations",
  "Débouchés",
  "Contact",
];

const generateMockResponse = ({ query, schoolName }: Readonly<{ query: string; schoolName: string | null }>): string => {
  const q: string = query.toLowerCase();
  const school: string = schoolName ?? "l'établissement";
  
  if (q.includes("tarif") || q.includes("prix") || q.includes("coût")) {
    return `Les frais de scolarité pour ${school} varient selon le programme choisi. Je vous recommande de mentionner que des facilités de paiement sont disponibles et qu'un conseiller peut détailler les options de financement.`;
  }
  if (q.includes("inscription") || q.includes("inscrire")) {
    return `Pour l'inscription à ${school}, le processus comprend généralement : 1) Dépôt du dossier de candidature, 2) Entretien d'admission, 3) Confirmation et paiement des frais. Les inscriptions sont ouvertes toute l'année.`;
  }
  if (q.includes("calendrier") || q.includes("rentrée") || q.includes("date")) {
    return `La prochaine rentrée académique est prévue pour septembre. Des sessions de rattrapage sont également disponibles en janvier pour certains programmes.`;
  }
  if (q.includes("bourse") || q.includes("aide")) {
    return `${school} propose plusieurs types de bourses : bourses d'excellence, bourses sociales, et partenariats avec des organismes de financement. Un dossier de demande peut être constitué lors de l'inscription.`;
  }
  if (q.includes("hébergement") || q.includes("logement")) {
    return `Des solutions d'hébergement sont disponibles : résidences universitaires partenaires, aide à la recherche de logement, et possibilité de colocation avec d'autres étudiants.`;
  }
  if (q.includes("formation") || q.includes("programme") || q.includes("filière")) {
    return `${school} propose plusieurs formations : Licence, Master, et programmes professionnalisants. Chaque programme est conçu pour répondre aux besoins du marché de l'emploi.`;
  }
  if (q.includes("débouché") || q.includes("emploi") || q.includes("carrière")) {
    return `Les diplômés de ${school} bénéficient d'un excellent taux d'insertion professionnelle. L'établissement dispose d'un réseau d'entreprises partenaires et organise régulièrement des forums de recrutement.`;
  }
  if (q.includes("contact") || q.includes("adresse") || q.includes("téléphone")) {
    return `Pour plus d'informations, le prospect peut contacter directement l'établissement ou prendre rendez-vous pour une visite du campus. Proposez-lui de fixer un créneau.`;
  }
  
  return `Je peux vous aider avec des informations sur ${school}. Posez-moi une question sur les tarifs, l'inscription, les formations, les bourses, ou tout autre sujet lié à l'établissement.`;
};

export const RagAssistant = ({
  contactName,
  schoolName,
}: RagAssistantProps): React.JSX.Element => {
  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: `Bonjour ! Je suis votre assistant pour l'appel avec ${contactName}. Je peux vous aider avec des informations sur ${schoolName ?? "l'établissement"} pendant votre conversation. Utilisez les suggestions rapides ou posez-moi une question.`,
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = (): void => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (content: string): Promise<void> => {
    if (content.trim().length === 0) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: content.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    // Simulate API delay (RAG backend will be integrated later)
    await new Promise((resolve) => setTimeout(resolve, 800));

    const assistantMessage: Message = {
      id: `assistant-${Date.now()}`,
      role: "assistant",
      content: generateMockResponse({ query: content, schoolName }),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, assistantMessage]);
    setIsLoading(false);
  };

  const handleQuickSuggestion = (suggestion: string): void => {
    handleSendMessage(suggestion);
  };

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    handleSendMessage(inputValue);
  };

  return (
    <div className="flex h-full flex-col rounded-2xl border border-zinc-200/70 bg-white shadow-sm dark:border-white/10 dark:bg-[#1a2332]">
      <div
        className="flex cursor-pointer items-center justify-between border-b border-zinc-200 px-4 py-3 dark:border-white/10"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <div className="grid size-8 place-items-center rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 text-white">
            <Bot className="size-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-zinc-800 dark:text-white">Assistant IA</h3>
            <p className="text-[10px] text-zinc-500 dark:text-zinc-400">Aide en temps réel</p>
          </div>
        </div>
        <button type="button" className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300">
          {isExpanded ? <ChevronDown className="size-5" /> : <ChevronUp className="size-5" />}
        </button>
      </div>

      {isExpanded ? (
        <>
          <div className="flex-1 space-y-3 overflow-y-auto p-4" style={{ maxHeight: "300px" }}>
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${
                    message.role === "user"
                      ? "bg-gradient-to-r from-[#244976] to-[#21416C] text-white"
                      : "bg-zinc-100 text-zinc-800 dark:bg-white/10 dark:text-zinc-200"
                  }`}
                >
                  {message.content}
                </div>
              </div>
            ))}
            {isLoading ? (
              <div className="flex justify-start">
                <div className="flex items-center gap-2 rounded-2xl bg-zinc-100 px-4 py-2.5 text-sm text-zinc-600 dark:bg-white/10 dark:text-zinc-400">
                  <Loader2 className="size-4 animate-spin" />
                  Réflexion...
                </div>
              </div>
            ) : null}
            <div ref={messagesEndRef} />
          </div>

          <div className="border-t border-zinc-200 px-4 py-3 dark:border-white/10">
            <div className="mb-3 flex flex-wrap gap-1.5">
              {quickSuggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => handleQuickSuggestion(suggestion)}
                  disabled={isLoading}
                  className="inline-flex items-center gap-1 rounded-full border border-zinc-200 bg-white px-2.5 py-1 text-xs font-medium text-zinc-600 transition hover:border-violet-300 hover:bg-violet-50 hover:text-violet-700 disabled:opacity-50 dark:border-white/15 dark:bg-white/5 dark:text-zinc-300 dark:hover:border-violet-400 dark:hover:bg-violet-500/10 dark:hover:text-violet-300"
                >
                  <Sparkles className="size-3" />
                  {suggestion}
                </button>
              ))}
            </div>
            <form onSubmit={handleSubmit} className="flex items-center gap-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Posez une question..."
                disabled={isLoading}
                className="flex-1 rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm text-zinc-800 outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-400/20 disabled:opacity-50 dark:border-white/15 dark:bg-[#0f1729] dark:text-white"
              />
              <button
                type="submit"
                disabled={inputValue.trim().length === 0 || isLoading}
                className="grid size-10 place-items-center rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Send className="size-4" />
              </button>
            </form>
          </div>
        </>
      ) : null}
    </div>
  );
};
