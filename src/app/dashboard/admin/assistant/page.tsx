"use client";
import { useState } from "react";
import { Bot, Database, MessageSquare } from "lucide-react";

import { AssistantChat } from "@/components/admin/assistant-chat";
import { RagManager } from "@/components/admin/rag-manager";

type Tab = "chat" | "knowledge";

export default function AdminAssistantPage(): React.JSX.Element {
  const [activeTab, setActiveTab] = useState<Tab>("chat");

  return (
    <div className="flex h-[calc(100vh-7rem)] flex-col">
      <div className="mb-4 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Assistant IA</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Chat RAG en temps réel · Base de connaissances LBS</p>
        </div>
        <div className="flex items-center gap-1 rounded-xl border border-zinc-200 bg-zinc-100 p-1 dark:border-white/10 dark:bg-white/5">
          <button
            type="button"
            onClick={() => setActiveTab("chat")}
            className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
              activeTab === "chat"
                ? "bg-white text-zinc-800 shadow-sm dark:bg-[#244976] dark:text-white"
                : "text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-300"
            }`}
          >
            <MessageSquare className="size-4" />
            Chat
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("knowledge")}
            className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
              activeTab === "knowledge"
                ? "bg-white text-zinc-800 shadow-sm dark:bg-[#244976] dark:text-white"
                : "text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-300"
            }`}
          >
            <Database className="size-4" />
            Base de connaissances
          </button>
        </div>
      </div>

      <div className="flex flex-1 flex-col overflow-hidden rounded-2xl border border-zinc-200/70 bg-white shadow-sm dark:border-white/10 dark:bg-[#1a2332]">
        {activeTab === "chat" ? (
          <AssistantChat />
        ) : (
          <div className="flex-1 overflow-y-auto p-6">
            <div className="mx-auto max-w-2xl">
              <div className="mb-5 flex items-center gap-3">
                <div className="grid size-10 place-items-center rounded-xl bg-gradient-to-br from-[#244976] to-[#21416C]">
                  <Bot className="size-5 text-white" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-zinc-800 dark:text-white">Gestion de la base de connaissances</h2>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">Importez des PDF pour alimenter l&apos;assistant IA utilisé par les agents en appel</p>
                </div>
              </div>
              <RagManager />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
