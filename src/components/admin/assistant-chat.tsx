'use client'
import { useRef, useEffect, useState, useCallback } from 'react'
import {
  Bot,
  Send,
  Sparkles,
  GraduationCap,
  CreditCard,
  FileText,
  BookOpen,
  Home,
  TrendingUp,
  Phone,
} from 'lucide-react'
import LoaderOne from '@/components/ui/loader-one'

type Message = Readonly<{
  id: string
  role: 'user' | 'assistant'
  content: string
}>

type QuickSuggestion = Readonly<{
  id: string
  label: string
  icon: React.ReactNode
  query: string
}>

const quickSuggestions: readonly QuickSuggestion[] = [
  {
    id: 'scolarite',
    label: 'Scolarité',
    icon: <GraduationCap className="size-3.5" />,
    query: 'Quels sont les programmes de scolarité disponibles ?',
  },
  {
    id: 'frais',
    label: 'Frais',
    icon: <CreditCard className="size-3.5" />,
    query: 'Quels sont les frais de scolarité et les modalités de paiement ?',
  },
  {
    id: 'inscription',
    label: 'Inscription',
    icon: <FileText className="size-3.5" />,
    query: "Quelles sont les conditions d'inscription et les documents requis ?",
  },
  {
    id: 'filieres',
    label: 'Filières',
    icon: <BookOpen className="size-3.5" />,
    query: 'Quelles sont les filières et formations proposées ?',
  },
  {
    id: 'hebergement',
    label: 'Hébergement',
    icon: <Home className="size-3.5" />,
    query: "Y a-t-il des solutions d'hébergement disponibles ?",
  },
  {
    id: 'debouches',
    label: 'Débouchés',
    icon: <TrendingUp className="size-3.5" />,
    query: 'Quels sont les débouchés professionnels après le diplôme ?',
  },
  {
    id: 'contact',
    label: 'Contact',
    icon: <Phone className="size-3.5" />,
    query: "Quelles sont les coordonnées et l'adresse de l'établissement ?",
  },
]

export const AssistantChat = (): React.JSX.Element => {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState<string>('')
  const [isStreaming, setIsStreaming] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = useCallback(
    async (query: string): Promise<void> => {
      const text = query.trim()
      if (text.length === 0 || isStreaming) return

      setError(null)
      setInputValue('')

      const userMsg: Message = { id: `user-${Date.now()}`, role: 'user', content: text }
      const assistantId = `assistant-${Date.now() + 1}`
      const assistantMsg: Message = { id: assistantId, role: 'assistant', content: '' }

      setMessages((prev) => [...prev, userMsg, assistantMsg])
      setIsStreaming(true)

      try {
        const response = await fetch('/api/ai/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: text }),
        })

        if (!response.ok || !response.body) {
          const err = (await response.json()) as { error?: string }
          throw new Error(err.error ?? 'Erreur serveur.')
        }

        const reader = response.body.getReader()
        const decoder = new TextDecoder()

        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          const chunk = decoder.decode(value, { stream: true })
          setMessages((prev) =>
            prev.map((m) => (m.id === assistantId ? { ...m, content: m.content + chunk } : m))
          )
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Erreur de connexion.'
        setError(message)
        setMessages((prev) => prev.filter((m) => m.id !== assistantId))
      } finally {
        setIsStreaming(false)
      }
    },
    [isStreaming]
  )

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault()
    sendMessage(inputValue)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>): void => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage(inputValue)
    }
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-y-auto p-5">
        <div className="mx-auto max-w-2xl space-y-4">
          {messages.length === 0 ? (
            <div className="flex gap-3">
              <div className="grid size-8 shrink-0 place-items-center rounded-full bg-gradient-to-br from-[#244976] to-[#21416C]">
                <Bot className="size-4 text-white" />
              </div>
              <div className="max-w-[80%] rounded-2xl rounded-tl-sm bg-zinc-100 px-4 py-3 dark:bg-white/10">
                <p className="text-sm leading-relaxed text-zinc-700 dark:text-zinc-200">
                  Bonjour ! Je suis votre assistant IA connecté à la base de connaissances LBS.
                  Posez-moi une question sur la scolarité, les frais, l&apos;inscription ou les
                  programmes.
                </p>
              </div>
            </div>
          ) : null}

          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div
                className={`grid size-8 shrink-0 place-items-center rounded-full ${msg.role === 'user' ? 'bg-gradient-to-br from-blue-400 to-blue-600' : 'bg-gradient-to-br from-[#244976] to-[#21416C]'}`}
              >
                {msg.role === 'user' ? (
                  <span className="text-xs font-semibold text-white">V</span>
                ) : (
                  <Bot className="size-4 text-white" />
                )}
              </div>
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 ${msg.role === 'user' ? 'rounded-tr-sm bg-[#244976] text-white' : 'rounded-tl-sm bg-zinc-100 dark:bg-white/10'}`}
              >
                <p
                  className={`text-sm leading-relaxed whitespace-pre-wrap ${msg.role === 'user' ? 'text-white' : 'text-zinc-700 dark:text-zinc-200'}`}
                >
                  {msg.content}
                  {msg.role === 'assistant' && isStreaming && msg.content.length === 0 ? (
                    <span className="inline-block h-4 w-0.5 animate-pulse bg-current" />
                  ) : null}
                </p>
                {msg.role === 'assistant' && msg.content.length > 0 ? (
                  <div className="mt-2 rounded-lg bg-blue-50 px-2.5 py-1.5 text-xs text-blue-700 dark:bg-blue-500/10 dark:text-blue-300">
                    <Sparkles className="mr-1 mb-0.5 inline size-3" />
                    Base de connaissances LBS
                  </div>
                ) : null}
              </div>
            </div>
          ))}

          {isStreaming &&
          messages[messages.length - 1]?.role === 'assistant' &&
          messages[messages.length - 1]?.content === '' ? (
            <div className="flex gap-3">
              <div className="grid size-8 shrink-0 place-items-center rounded-full bg-gradient-to-br from-[#244976] to-[#21416C]">
                <Bot className="size-4 text-white" />
              </div>
              <div className="rounded-2xl rounded-tl-sm bg-zinc-100 px-4 py-3.5 dark:bg-white/10">
                <LoaderOne />
              </div>
            </div>
          ) : null}

          {error ? (
            <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600 dark:bg-red-500/10 dark:text-red-400">
              {error}
            </div>
          ) : null}

          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="border-t border-zinc-200/70 p-4 dark:border-white/10">
        <div className="mx-auto max-w-2xl">
          <div className="mb-3 flex flex-wrap gap-2">
            {quickSuggestions.map((s) => (
              <button
                key={s.id}
                type="button"
                disabled={isStreaming}
                onClick={() => sendMessage(s.query)}
                className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-600 transition hover:border-[#244976] hover:bg-[#244976]/5 hover:text-[#244976] disabled:opacity-50 dark:border-white/15 dark:bg-white/5 dark:text-zinc-300 dark:hover:border-blue-400 dark:hover:text-blue-300"
              >
                {s.icon}
                {s.label}
              </button>
            ))}
          </div>
          <form onSubmit={handleSubmit} className="flex items-end gap-3">
            <div className="relative flex-1">
              <textarea
                rows={1}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Posez votre question..."
                disabled={isStreaming}
                className="w-full resize-none rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 pr-12 text-sm text-zinc-800 transition outline-none focus:border-[#244976] focus:bg-white focus:ring-2 focus:ring-[#244976]/20 disabled:opacity-50 dark:border-white/15 dark:bg-[#0f1729] dark:text-white dark:focus:bg-[#0f1729]"
              />
              <button
                type="submit"
                disabled={inputValue.trim().length === 0 || isStreaming}
                className="absolute right-2 bottom-2 grid size-8 place-items-center rounded-lg bg-gradient-to-r from-[#244976] to-[#21416C] text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Send className="size-4" />
              </button>
            </div>
          </form>
          <p className="mt-2 text-center text-[10px] text-zinc-400">
            L&apos;assistant utilise la base de connaissances LBS · Entrée pour envoyer
          </p>
        </div>
      </div>
    </div>
  )
}
