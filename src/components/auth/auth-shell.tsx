import Image from 'next/image'
import Link from 'next/link'
import { Check, Phone } from 'lucide-react'

type AuthShellProps = Readonly<{
  title: string
  description: string
  footerLabel: string
  footerHref: string
  footerText: string
  children: React.ReactNode
}>

const features = [
  'Gestion multi-agents & multi-campagnes',
  'Assistant IA intégré (RAG)',
  'Analytique en temps réel',
] as const

export const AuthShell = ({
  title,
  description,
  footerLabel,
  footerHref,
  footerText,
  children,
}: AuthShellProps): React.JSX.Element => {
  return (
    <div className="flex min-h-screen">
      {/* ── Left panel: branding (desktop only) ── */}
      <div className="relative hidden overflow-hidden bg-gradient-to-br from-[#244976] via-[#1d3d68] to-[#132a4f] p-12 lg:flex lg:w-[42%] lg:flex-col lg:justify-between">
        {/* Decorative circles */}
        <div className="pointer-events-none absolute -top-24 -right-24 size-72 rounded-full bg-white/[0.04]" />
        <div className="pointer-events-none absolute -bottom-32 -left-20 size-96 rounded-full bg-white/[0.04]" />
        <div className="pointer-events-none absolute top-1/2 right-0 size-48 -translate-y-1/2 rounded-full bg-white/[0.03]" />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="grid size-10 place-items-center rounded-xl bg-white/15 shadow-inner">
            <Phone className="size-5 text-white" />
          </div>
          <span className="text-lg font-bold tracking-wide text-white">LBS Call Center</span>
        </div>

        {/* Center content */}
        <div className="relative z-10">
          <Image
            src="/LBS%20LOGO.jpeg"
            alt="Lomé Business School"
            width={80}
            height={80}
            className="mb-8 rounded-2xl border border-white/20 object-cover shadow-xl"
            priority
          />
          <h2 className="text-3xl leading-tight font-extrabold text-white">
            Gérez vos campagnes
            <br />
            <span className="text-blue-200">intelligemment</span>
          </h2>
          <p className="mt-4 text-base leading-relaxed text-white/55">
            La plateforme SaaS de prospection pour universités et grandes écoles.
          </p>
          <ul className="mt-8 space-y-3">
            {features.map((feat) => (
              <li key={feat} className="flex items-center gap-3">
                <div className="grid size-5 shrink-0 place-items-center rounded-full bg-white/15">
                  <Check className="size-3 text-white" strokeWidth={3} />
                </div>
                <span className="text-sm text-white/70">{feat}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Footer quote */}
        <div className="relative z-10">
          <p className="text-xs text-white/35">
            © {new Date().getFullYear()} LBS Call Center · Lomé Business School
          </p>
        </div>
      </div>

      {/* ── Right panel: form ── */}
      <div className="flex flex-1 flex-col items-center justify-center bg-[#f4f7fe] px-5 py-12 sm:px-10 dark:bg-[#0b1120]">
        {/* Mobile logo */}
        <div className="mb-8 flex items-center gap-3 lg:hidden">
          <Image
            src="/LBS%20LOGO.jpeg"
            alt="Lomé Business School"
            width={40}
            height={40}
            className="rounded-xl border border-gray-200 object-cover dark:border-white/10"
            priority
          />
          <span className="text-base font-bold text-gray-900 dark:text-white">LBS Call Center</span>
        </div>

        {/* Form card */}
        <div className="w-full max-w-md rounded-2xl border border-gray-100 bg-white p-8 shadow-sm dark:border-white/[0.08] dark:bg-[#1e2535]">
          <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">{title}</h1>
          <p className="mt-1.5 text-sm text-gray-500 dark:text-gray-400">{description}</p>

          <div className="mt-6">{children}</div>

          {footerLabel.length > 0 ? (
            <p className="mt-6 text-center text-xs text-gray-400 dark:text-gray-500">
              <Link
                href={footerHref}
                className="font-semibold text-[#244976] hover:underline dark:text-blue-300"
              >
                {footerLabel}
              </Link>
              {footerText.length > 0 ? <> {footerText}</> : null}
            </p>
          ) : null}
        </div>

        <p className="mt-6 text-xs text-gray-400 dark:text-gray-600">
          © {new Date().getFullYear()} LBS Call Center
        </p>
      </div>
    </div>
  )
}
