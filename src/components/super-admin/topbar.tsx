"use client";
/**
 * Barre horizontale supérieure du super-admin.
 * Bouton toggle sidebar, profil à droite, switch thème, messagerie, horloge live.
 */
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Clock, Megaphone, Menu } from "lucide-react";

import { LogoutButton } from "@/components/auth/logout-button";
import { ThemeSwitch } from "@/components/ui/theme-switch-button";
import { useSidebar } from "@/components/super-admin/layout-shell";

type TopbarProps = Readonly<{
  fullName: string;
  avatarUrl: string | null;
}>;

const extractInitials = ({ fullName }: Readonly<{ fullName: string }>): string => {
  const parts: string[] = fullName.trim().split(" ").filter((w) => w.length > 0);
  if (parts.length === 0) {
    return "U";
  }
  return parts.slice(0, 2).map((w) => w.charAt(0).toUpperCase()).join("");
};
const buildPageTitle = ({ pathname }: Readonly<{ pathname: string }>): string => {
  const map: Readonly<Record<string, string>> = {
    "/dashboard/super-admin": "Dashboard",
    "/dashboard/super-admin/admins": "Administrateurs",
    "/dashboard/super-admin/campaigns": "Campagnes",
    "/dashboard/super-admin/analytics": "Statistiques",
    "/dashboard/super-admin/messaging": "Messagerie",
    "/dashboard/super-admin/profile": "Mon profil",
  };
  return map[pathname] ?? "Super-Admin";
};
const buildGreeting = (): string => {
  const hour: number = new Date().getHours();
  if (hour < 12) {
    return "Bonjour";
  }
  if (hour < 18) {
    return "Bon après-midi";
  }
  return "Bonsoir";
};

export const SuperAdminTopbar = ({ fullName, avatarUrl }: TopbarProps): React.JSX.Element => {
  const pathname: string = usePathname();
  const { toggle } = useSidebar();
  const initials: string = extractInitials({ fullName });
  const pageTitle: string = buildPageTitle({ pathname });
  const [currentTime, setCurrentTime] = useState<string>("");
  useEffect(() => {
    const updateTime = (): void => {
      setCurrentTime(new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }));
    };
    updateTime();
    const interval: ReturnType<typeof setInterval> = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);
  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-zinc-200/70 bg-white px-6 dark:border-white/10 dark:bg-[#111827]">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={toggle}
          className="grid size-9 place-items-center rounded-lg border border-zinc-200 text-zinc-600 transition hover:bg-zinc-50 dark:border-white/15 dark:text-zinc-300 dark:hover:bg-white/10"
          aria-label="Toggle sidebar"
        >
          <Menu className="size-4" />
        </button>
        <div>
          <h2 className="text-lg font-semibold text-zinc-800 dark:text-white">{pageTitle}</h2>
          <p className="text-[11px] text-zinc-400 dark:text-zinc-500">{buildGreeting()}, {fullName.split(" ")[0]}</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        {currentTime.length > 0 ? (
          <div className="hidden items-center gap-1.5 rounded-lg border border-zinc-100 px-2.5 py-1.5 text-xs text-zinc-500 sm:flex dark:border-white/10 dark:text-zinc-400">
            <Clock className="size-3" />
            {currentTime}
          </div>
        ) : null}
        <Link
          href="/dashboard/super-admin/messaging"
          className="relative grid size-9 place-items-center rounded-lg border border-zinc-200 text-zinc-600 transition hover:bg-zinc-50 dark:border-white/15 dark:text-zinc-300 dark:hover:bg-white/10"
          aria-label="Messagerie"
        >
          <Megaphone className="size-4" />
          <span className="absolute -right-0.5 -top-0.5 size-2 rounded-full bg-lbs-blue" />
        </Link>
        <ThemeSwitch />
        <Link
          href="/dashboard/super-admin/profile"
          className="flex items-center gap-2.5 rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-1.5 transition hover:bg-zinc-100 dark:border-white/15 dark:bg-white/10 dark:hover:bg-white/15"
        >
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={avatarUrl} alt={fullName} className="size-8 rounded-full object-cover" />
          ) : (
            <div className="grid size-8 place-items-center rounded-full bg-gradient-to-br from-[#244976] to-[#21416C] text-xs font-semibold text-white">
              {initials}
            </div>
          )}
          <div className="hidden text-left sm:block">
            <p className="text-sm font-medium text-zinc-800 dark:text-white">{fullName}</p>
            <p className="text-[10px] text-zinc-500 dark:text-zinc-400">Super-Admin</p>
          </div>
        </Link>
        <LogoutButton />
      </div>
    </header>
  );
};
