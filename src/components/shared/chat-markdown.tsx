import ReactMarkdown from 'react-markdown'

type ChatMarkdownProps = Readonly<{
  content: string
  className?: string
}>

// Rendu markdown des réponses de l'assistant IA (gras, listes, titres) — sans ce
// composant, le contenu s'affiche en texte brut avec les astérisques et tirets
// markdown visibles tels quels au lieu d'être mis en forme.
export const ChatMarkdown = ({ content, className }: ChatMarkdownProps): React.JSX.Element => {
  return (
    <div className={`chat-markdown text-sm leading-relaxed ${className ?? ''}`}>
      <ReactMarkdown
        components={{
          p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
          strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
          ul: ({ children }) => (
            <ul className="mb-2 list-disc space-y-1 pl-5 last:mb-0">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="mb-2 list-decimal space-y-1 pl-5 last:mb-0">{children}</ol>
          ),
          li: ({ children }) => <li>{children}</li>,
          h1: ({ children }) => <p className="mb-1 font-semibold">{children}</p>,
          h2: ({ children }) => <p className="mb-1 font-semibold">{children}</p>,
          h3: ({ children }) => <p className="mb-1 font-semibold">{children}</p>,
          a: ({ children, href }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-lbs-blue underline dark:text-blue-300"
            >
              {children}
            </a>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
