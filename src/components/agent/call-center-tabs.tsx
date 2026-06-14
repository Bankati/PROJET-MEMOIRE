'use client'
import { useState } from 'react'
import { Bot, FileText, ScrollText } from 'lucide-react'
import { RagAssistant } from '@/components/agent/rag-assistant'

type CallCenterTabsProps = Readonly<{
  script: string
  contactName: string
  schoolName: string | null
  desiredProgram: string | null | undefined
  campaignTitle: string
  baseScript: string
  pdfUrl: string | null
}>

type Tab = 'script' | 'ia' | 'docs'

export const CallCenterTabs = ({
  script,
  contactName,
  schoolName,
  desiredProgram,
  campaignTitle,
  baseScript,
  pdfUrl,
}: CallCenterTabsProps): React.JSX.Element => {
  const [activeTab, setActiveTab] = useState<Tab>('script')

  const tabs: readonly { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'script', label: 'Script', icon: <ScrollText className="size-4" /> },
    { id: 'ia', label: 'IA', icon: <Bot className="size-4" /> },
    { id: 'docs', label: 'Docs', icon: <FileText className="size-4" /> },
  ]

  return (
    <div className="flex h-full flex-col rounded-2xl border border-zinc-200/70 bg-white shadow-sm dark:border-white/10 dark:bg-[#1a2332]">
      {/* Tab bar */}
      <div className="flex border-b border-zinc-200 dark:border-white/10">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`flex flex-1 items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-all ${
              activeTab === tab.id
                ? 'border-lbs-blue text-lbs-blue border-b-2 dark:border-blue-400 dark:text-blue-300'
                : 'text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto p-5">
        {activeTab === 'script' ? (
          <div>
            <p className="mb-3 text-xs font-semibold tracking-wider text-zinc-400 uppercase dark:text-zinc-500">
              Script d&apos;appel personnalisé
            </p>
            <div className="rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 p-4 dark:from-blue-500/10 dark:to-indigo-500/10">
              <p className="text-sm leading-relaxed whitespace-pre-wrap text-zinc-700 dark:text-zinc-300">
                {script}
              </p>
            </div>
          </div>
        ) : null}

        {activeTab === 'ia' ? (
          <div className="h-full">
            <RagAssistant
              contactName={contactName}
              schoolName={schoolName}
              desiredProgram={desiredProgram ?? null}
              campaignTitle={campaignTitle}
              baseScript={baseScript}
            />
          </div>
        ) : null}

        {activeTab === 'docs' ? (
          <div className="h-full">
            {pdfUrl !== null && pdfUrl.length > 0 ? (
              <div className="flex h-full flex-col gap-3">
                <p className="text-xs font-semibold tracking-wider text-zinc-400 uppercase dark:text-zinc-500">
                  Document de la campagne
                </p>
                <iframe
                  src={pdfUrl}
                  title="Document campagne"
                  className="h-[500px] w-full rounded-xl border border-zinc-200 dark:border-white/10"
                />
                <a
                  href={pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 self-start rounded-xl border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-600 transition hover:bg-zinc-50 dark:border-white/15 dark:text-zinc-300 dark:hover:bg-white/10"
                >
                  <FileText className="size-4" />
                  Ouvrir dans un nouvel onglet
                </a>
              </div>
            ) : (
              <div className="flex h-48 flex-col items-center justify-center gap-3 text-center">
                <div className="grid size-12 place-items-center rounded-xl bg-zinc-100 dark:bg-white/10">
                  <FileText className="size-6 text-zinc-400" />
                </div>
                <p className="text-sm font-medium text-zinc-600 dark:text-zinc-300">
                  Aucun document disponible
                </p>
                <p className="text-xs text-zinc-400 dark:text-zinc-500">
                  L&apos;administrateur n&apos;a pas encore associé de document PDF à cette
                  campagne.
                </p>
              </div>
            )}
          </div>
        ) : null}
      </div>
    </div>
  )
}
