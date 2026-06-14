/**
 * Gabarit partagé des tableaux de bord pour les rôles admin et agent.
 * Le super-admin utilise désormais son propre layout dédié.
 */
import {
  Activity,
  BarChart3,
  Bell,
  ChartPie,
  LayoutDashboard,
  Settings,
  Shield,
  Users,
} from 'lucide-react'

import { LogoutButton } from '@/components/auth/logout-button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ThemeSwitch } from '@/components/ui/theme-switch-button'

type DashboardMetric = Readonly<{
  label: string
  value: string
  hint: string
  icon?: React.JSX.Element
}>
type DashboardShellProps = Readonly<{
  roleLabel: string
  title: string
  subtitle: string
  fullName: string
  metrics: readonly DashboardMetric[]
  children: React.ReactNode
}>

const roleIconMap: Readonly<Record<string, React.JSX.Element>> = {
  'Super-Admin': <Shield className="size-4 text-blue-600 dark:text-blue-300" />,
  Administrateur: <Users className="size-4 text-emerald-600 dark:text-emerald-300" />,
  Agent: <Activity className="size-4 text-violet-600 dark:text-violet-300" />,
}
const initialsFromName = ({
  fullName,
}: Readonly<{
  fullName: string
}>): string => {
  const words: string[] = fullName
    .trim()
    .split(' ')
    .filter((word) => word.length > 0)
  const firstTwoWords: string[] = words.slice(0, 2)
  if (firstTwoWords.length === 0) {
    return 'U'
  }
  return firstTwoWords.map((word) => word.charAt(0).toUpperCase()).join('')
}

export const DashboardShell = ({
  roleLabel,
  title,
  subtitle,
  fullName,
  metrics,
  children,
}: DashboardShellProps): React.JSX.Element => {
  const userInitials: string = initialsFromName({ fullName })
  return (
    <div className="min-h-screen bg-[#f6f8fc] text-zinc-900 transition-colors dark:bg-[#0d1522] dark:text-zinc-100">
      <div className="mx-auto flex w-full max-w-[1460px] gap-4 px-4 py-4 sm:px-6">
        <div className="flex-1 space-y-5">
          <header className="rounded-[26px] border border-zinc-200/70 bg-white px-5 py-4 shadow-[0_10px_28px_-18px_rgba(15,23,42,0.38)] dark:border-white/10 dark:bg-gradient-to-r dark:from-[#122743] dark:via-[#17304f] dark:to-[#2a1435] dark:shadow-2xl dark:shadow-black/25">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="space-y-2">
                <p className="border-lbs-blue/20 bg-lbs-blue/5 text-lbs-blue inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs dark:border-white/15 dark:bg-white/8 dark:text-zinc-100">
                  {roleIconMap[roleLabel]}
                  {roleLabel}
                </p>
                <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 sm:text-3xl dark:text-white">
                  {title}
                </h1>
                <p className="text-sm text-zinc-600 dark:text-zinc-300">{subtitle}</p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  className="grid size-10 place-items-center rounded-xl border border-zinc-200 bg-white text-zinc-700 transition hover:bg-zinc-100 dark:border-white/15 dark:bg-white/10 dark:text-zinc-200 dark:hover:bg-white/15"
                  aria-label="Notifications"
                >
                  <Bell className="size-4" />
                </button>
                <ThemeSwitch />
                <div className="flex items-center gap-3 rounded-2xl border border-zinc-200 bg-[#f8fafc] px-3 py-2 dark:border-white/15 dark:bg-white/10">
                  <div className="grid size-9 place-items-center rounded-full bg-gradient-to-br from-[#4b6bda] to-[#6f52d9] text-xs font-semibold text-white">
                    {userInitials}
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium text-zinc-900 dark:text-white">{fullName}</p>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-300">Profil connecté</p>
                  </div>
                </div>
                <LogoutButton />
              </div>
            </div>
          </header>
          <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {metrics.map((metric) => (
              <Card
                key={metric.label}
                className="rounded-2xl border-zinc-200/90 bg-white shadow-[0_8px_22px_-18px_rgba(15,23,42,0.5)] dark:border-white/10 dark:bg-white/5 dark:shadow-none"
              >
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <CardDescription className="text-zinc-600 dark:text-zinc-300">
                      {metric.label}
                    </CardDescription>
                    {metric.icon ? (
                      <div className="grid size-9 place-items-center rounded-xl border border-zinc-200 bg-[#f8fafc] dark:border-white/15 dark:bg-white/8">
                        {metric.icon}
                      </div>
                    ) : null}
                  </div>
                  <CardTitle className="mt-2 text-2xl text-zinc-900 dark:text-white">
                    {metric.value}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">{metric.hint}</p>
                </CardContent>
              </Card>
            ))}
          </section>
          <section>
            <Card className="rounded-2xl border-zinc-200/90 bg-white shadow-[0_10px_26px_-18px_rgba(15,23,42,0.55)] dark:border-white/10 dark:bg-white/5 dark:shadow-none">
              <CardHeader>
                <CardTitle className="inline-flex items-center gap-2 text-zinc-900 dark:text-white">
                  <BarChart3 className="text-lbs-blue size-5" />
                  Pilotage opérationnel
                </CardTitle>
                <CardDescription className="text-zinc-600 dark:text-zinc-300">
                  Vue d&apos;ensemble opérationnelle de la plateforme.
                </CardDescription>
              </CardHeader>
              <CardContent>{children}</CardContent>
            </Card>
          </section>
        </div>
        <aside className="sticky top-4 hidden h-fit w-[96px] shrink-0 rounded-[26px] border border-zinc-200/90 bg-white p-3 shadow-[0_10px_28px_-18px_rgba(15,23,42,0.5)] xl:block dark:border-white/10 dark:bg-gradient-to-b dark:from-[#152c4c] dark:to-[#0f2139] dark:shadow-2xl dark:shadow-black/30">
          <div className="mb-4 grid place-items-center rounded-2xl border border-zinc-200 bg-[#f8fafc] px-2 py-3 text-center dark:border-white/10 dark:bg-white/8">
            <p className="text-[10px] font-semibold tracking-widest text-zinc-500 uppercase dark:text-zinc-300">
              Menu
            </p>
          </div>
          <div className="space-y-2">
            <button
              type="button"
              className="group flex w-full flex-col items-center gap-1 rounded-2xl border border-zinc-200 bg-[#eef3ff] py-2 text-[#3e5ecf] transition hover:bg-[#e8eeff] dark:border-white/10 dark:bg-white/10 dark:text-zinc-200 dark:hover:bg-white/15"
            >
              <LayoutDashboard className="size-4" />
              <span className="text-[10px]">Vue</span>
            </button>
            <button
              type="button"
              className="group flex w-full flex-col items-center gap-1 rounded-2xl border border-zinc-200 bg-transparent py-2 text-zinc-600 transition hover:bg-zinc-100 dark:border-white/10 dark:text-zinc-300 dark:hover:bg-white/10"
            >
              <ChartPie className="size-4" />
              <span className="text-[10px]">KPI</span>
            </button>
            <button
              type="button"
              className="group flex w-full flex-col items-center gap-1 rounded-2xl border border-zinc-200 bg-transparent py-2 text-zinc-600 transition hover:bg-zinc-100 dark:border-white/10 dark:text-zinc-300 dark:hover:bg-white/10"
            >
              <Users className="size-4" />
              <span className="text-[10px]">Users</span>
            </button>
            <button
              type="button"
              className="group flex w-full flex-col items-center gap-1 rounded-2xl border border-zinc-200 bg-transparent py-2 text-zinc-600 transition hover:bg-zinc-100 dark:border-white/10 dark:text-zinc-300 dark:hover:bg-white/10"
            >
              <Settings className="size-4" />
              <span className="text-[10px]">Config</span>
            </button>
          </div>
        </aside>
      </div>
    </div>
  )
}
