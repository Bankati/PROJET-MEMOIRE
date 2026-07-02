import type { Metadata } from 'next'
import { Plus_Jakarta_Sans } from 'next/font/google'
import './globals.css'

import { SessionProvider } from '@/components/providers/session-provider'

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: '--font-sans',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'LBS Call Center — Prospection intelligente pour l’enseignement supérieur',
    template: '%s • LBS Call Center',
  },
  description:
    'Plateforme SaaS de gestion de centre d’appels pour universités et écoles: campagnes, attribution de contacts, interface agent avec IA (RAG), KPI par rôle, exports, et messagerie WhatsApp.',
  applicationName: 'LBS Call Center',
  metadataBase: new URL('http://localhost:3000'),
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="fr"
      className={`${plusJakartaSans.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem("theme");if(t==="dark"||(!t&&window.matchMedia("(prefers-color-scheme:dark)").matches)){document.documentElement.classList.add("dark")}}catch(e){}})()`,
          }}
        />
      </head>
      <body
        className="flex min-h-full flex-col bg-white text-gray-900 dark:bg-[#0b1120] dark:text-gray-50"
        suppressHydrationWarning
      >
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  )
}
