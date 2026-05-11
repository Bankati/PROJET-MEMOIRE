"use client";
import { useRef, useEffect, useState, useCallback } from "react";
import { Bot, ChevronDown, ChevronUp, Send, Sparkles } from "lucide-react";
import LoaderOne from "@/components/ui/loader-one";

type Message = Readonly<{
  id: string;
  role: "user" | "assistant";
  content: string;
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

export const RagAssistant = ({ contactName, schoolName }: RagAssistantProps): React.JSX.Element => {
  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const [inputValue, setInputValue] = useState<string>("");
  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: `Bonjour ! Je suis votre assistant pour l'appel avec ${contactName}${schoolName ? ` (${schoolName})` : ""}. Utilisez les suggestions rapides ou posez-moi une question.`,
    },
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = useCallback(async (query: string): Promise<void> => {
    const text = query.trim();
    if (text.length === 0 || isStreaming) return;

    setInputValue("");

    const userMsg: Message = { id: `user-${Date.now()}`, role: "user", content: text };
    const assistantId = `assistant-${Date.now() + 1}`;
    const assistantMsg: Message = { id: assistantId, role: "assistant", content: "" };

    setMessages((prev) => [...prev, userMsg, assistantMsg]);
    setIsStreaming(true);

    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: text }),
      });

      if (!response.ok || !response.body) {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId
              ? { ...m, content: "Erreur de connexion. Vérifiez la configuration." }
              : m,
          ),
        );
        return;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        setMessages((prev) =>
          prev.map((m) => (m.id === assistantId ? { ...m, content: m.content + chunk } : m)),
        );
      }
    } catch {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId
            ? { ...m, content: "Erreur de connexion. Vérifiez la configuration." }
            : m,
        ),
      );
    } finally {
      setIsStreaming(false);
    }
  }, [isStreaming]);

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    sendMessage(inputValue);
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
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${
                    msg.role === "user"
                      ? "bg-gradient-to-r from-[#244976] to-[#21416C] text-white"
                      : "bg-zinc-100 text-zinc-800 dark:bg-white/10 dark:text-zinc-200"
                  }`}
                >
                  {msg.content}
                  {msg.role === "assistant" && isStreaming && msg.content.length === 0 ? (
                    <span className="inline-block h-4 w-0.5 animate-pulse bg-current" />
                  ) : null}
                </div>
              </div>
            ))}

            {isStreaming && messages[messages.length - 1]?.content === "" ? (
              <div className="flex justify-start">
                <div className="rounded-2xl bg-zinc-100 px-4 py-3 dark:bg-white/10">
                  <LoaderOne />
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
                  onClick={() => sendMessage(suggestion)}
                  disabled={isStreaming}
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
                disabled={isStreaming}
                className="flex-1 rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm text-zinc-800 outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-400/20 disabled:opacity-50 dark:border-white/15 dark:bg-[#0f1729] dark:text-white"
              />
              <button
                type="submit"
                disabled={inputValue.trim().length === 0 || isStreaming}
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
