'use client'
import { useState } from 'react'
import { MessageSquareQuote } from 'lucide-react'

type CallCommentProps = Readonly<{
  notes: string
  accentClassName: string
}>

export function CallComment({ notes, accentClassName }: CallCommentProps): React.JSX.Element {
  const [expanded, setExpanded] = useState(false)
  const isLong = notes.length > 140 || notes.split('\n').length > 2

  return (
    <div
      className={`mt-3 rounded-xl border-l-4 bg-zinc-50 px-3.5 py-2.5 dark:bg-white/5 ${accentClassName}`}
    >
      <div className="mb-1 flex items-center gap-1.5 text-zinc-400 dark:text-zinc-500">
        <MessageSquareQuote className="size-3.5" />
        <p className="text-[11px] font-medium tracking-wide uppercase">Commentaire</p>
      </div>
      <p
        className={`text-sm leading-relaxed whitespace-pre-wrap text-zinc-700 dark:text-zinc-200 ${
          expanded ? '' : 'line-clamp-2'
        }`}
      >
        {notes}
      </p>
      {isLong ? (
        <button
          type="button"
          onClick={() => setExpanded((prev) => !prev)}
          className="text-lbs-blue mt-1 text-xs font-medium hover:underline dark:text-[#6f9bcf]"
        >
          {expanded ? 'Voir moins' : 'Voir plus'}
        </button>
      ) : null}
    </div>
  )
}
