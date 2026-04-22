/**
 * Page dédiée à la vue globale de toutes les campagnes avec filtres avancés.
 */
import { count, desc, eq } from "drizzle-orm";
import { Table2 } from "lucide-react";

import { requireRole } from "@/lib/auth/server-auth";
import { db } from "@/lib/db";
import { campaigns, callResults, users } from "@/db/schema";
import { CampaignsFilters } from "@/components/super-admin/campaigns-filters";

type SearchParams = Readonly<Record<string, string | string[] | undefined>>;
type CampaignRow = Readonly<{
  id: string;
  title: string;
  year: number;
  status: "draft" | "active" | "paused" | "completed" | "archived";
  createdAt: Date;
  ownerAdminName: string;
  callCount: number;
}>;

const readParam = ({
  searchParams,
  key,
}: Readonly<{
  searchParams: SearchParams;
  key: string;
}>): string => {
  const raw: string | string[] | undefined = searchParams[key];
  if (typeof raw === "string") {
    return raw;
  }
  if (Array.isArray(raw)) {
    return raw[0] ?? "";
  }
  return "";
};
const statusLabel = (status: string): string => {
  const map: Readonly<Record<string, string>> = {
    active: "Active",
    completed: "Terminée",
  };
  return map[status] ?? status;
};
const statusColor = (status: string): string => {
  const map: Readonly<Record<string, string>> = {
    active: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
    completed: "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300",
  };
  return map[status] ?? "bg-zinc-100 text-zinc-600 dark:bg-zinc-500/15 dark:text-zinc-300";
};

export default async function CampaignsPage({
  searchParams,
}: Readonly<{
  searchParams?: Promise<SearchParams>;
}>): Promise<React.JSX.Element> {
  await requireRole({ allowedRoles: ["super_admin"] });
  const resolvedParams: SearchParams = (await searchParams) ?? {};
  const statusFilter: string = readParam({ searchParams: resolvedParams, key: "status" });
  const adminFilter: string = readParam({ searchParams: resolvedParams, key: "admin" });
  const queryFilter: string = readParam({ searchParams: resolvedParams, key: "q" }).toLowerCase();
  const minCallsStr: string = readParam({ searchParams: resolvedParams, key: "minCalls" });
  const minCalls: number = Number.isFinite(Number(minCallsStr)) ? Math.max(0, Number(minCallsStr)) : 0;
  const rawRows: CampaignRow[] = await db
    .select({
      id: campaigns.id,
      title: campaigns.title,
      year: campaigns.year,
      status: campaigns.status,
      createdAt: campaigns.createdAt,
      ownerAdminName: users.fullName,
      callCount: count(callResults.id),
    })
    .from(campaigns)
    .leftJoin(users, eq(campaigns.createdByAdminId, users.id))
    .leftJoin(callResults, eq(callResults.campaignId, campaigns.id))
    .groupBy(campaigns.id, users.id)
    .orderBy(desc(campaigns.createdAt))
    .then((rows) =>
      rows.map((r) => ({
        id: r.id,
        title: r.title,
        year: r.year,
        status: r.status,
        createdAt: r.createdAt,
        ownerAdminName: r.ownerAdminName ?? "Inconnu",
        callCount: r.callCount,
      })),
    );
  const filteredRows: readonly CampaignRow[] = rawRows.filter((row) => {
    const matchStatus: boolean = statusFilter.length === 0 || row.status === statusFilter;
    const matchAdmin: boolean = adminFilter.length === 0 || row.ownerAdminName === adminFilter;
    const matchQuery: boolean =
      queryFilter.length === 0 ||
      row.title.toLowerCase().includes(queryFilter) ||
      row.ownerAdminName.toLowerCase().includes(queryFilter);
    const matchCalls: boolean = row.callCount >= minCalls;
    return matchStatus && matchAdmin && matchQuery && matchCalls;
  });
  const adminOptions: readonly string[] = Array.from(new Set(rawRows.map((r) => r.ownerAdminName)));
  const adminFilterOptions: readonly { value: string; label: string }[] = adminOptions.map((name) => ({
    value: name,
    label: name,
  }));
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Campagnes</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">Vue complète de toutes les campagnes de la plateforme avec filtres avancés</p>
      </div>
      <CampaignsFilters
        adminOptions={adminFilterOptions}
        currentStatus={statusFilter}
        currentAdmin={adminFilter}
        currentQuery={readParam({ searchParams: resolvedParams, key: "q" })}
        currentMinCalls={minCalls}
      />
      <div className="rounded-2xl border border-zinc-200/70 bg-white shadow-sm dark:border-white/10 dark:bg-[#1a2332]">
        <div className="flex items-center justify-between border-b border-zinc-200 px-5 py-3 dark:border-white/10">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-zinc-700 dark:text-zinc-200">
            <Table2 className="size-4 text-blue-500" />
            {filteredRows.length} campagne{filteredRows.length > 1 ? "s" : ""}
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-200 text-xs uppercase tracking-wide text-zinc-500 dark:border-white/10 dark:text-zinc-400">
                <th className="px-5 py-3">Campagne</th>
                <th className="px-5 py-3">Année</th>
                <th className="px-5 py-3">Admin responsable</th>
                <th className="px-5 py-3">Appels</th>
                <th className="px-5 py-3">Statut</th>
                <th className="px-5 py-3">Création</th>
              </tr>
            </thead>
            <tbody>
              {filteredRows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-zinc-400">
                    Aucune campagne ne correspond aux filtres sélectionnés.
                  </td>
                </tr>
              ) : (
                filteredRows.map((row) => (
                  <tr key={row.id} className="border-b border-zinc-100 transition hover:bg-zinc-50/60 dark:border-white/5 dark:hover:bg-white/5">
                    <td className="px-5 py-4 font-medium text-zinc-900 dark:text-white">{row.title}</td>
                    <td className="px-5 py-4 text-zinc-600 dark:text-zinc-300">{row.year}</td>
                    <td className="px-5 py-4 text-zinc-600 dark:text-zinc-300">{row.ownerAdminName}</td>
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700 dark:bg-blue-500/15 dark:text-blue-300">
                        {row.callCount}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${statusColor(row.status)}`}>
                        {statusLabel(row.status)}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-zinc-500 dark:text-zinc-400">{row.createdAt.toISOString().slice(0, 10)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
