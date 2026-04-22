/**
 * Page statistiques détaillées du super-admin.
 * Filtres par campagne, date de début et date de fin.
 * Tous les KPI et courbes s'adaptent dynamiquement aux filtres.
 */
import { and, count, eq, gte, lte, sql } from "drizzle-orm";
import {
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  Filter,
  PhoneMissed,
  Send,
  TrendingUp,
} from "lucide-react";

import { requireRole } from "@/lib/auth/server-auth";
import { db } from "@/lib/db";
import { campaigns, callResults, users } from "@/db/schema";
import { AnalyticsFilters } from "@/components/super-admin/analytics-filters";

type SearchParams = Readonly<Record<string, string | string[] | undefined>>;
type CurvePoint = Readonly<{ label: string; calls: number; campaigns: number }>;
type CampaignOption = Readonly<{ id: string; title: string }>;

const readParam = ({ sp, key }: Readonly<{ sp: SearchParams; key: string }>): string => {
  const raw: string | string[] | undefined = sp[key];
  if (typeof raw === "string") {
    return raw;
  }
  return Array.isArray(raw) ? (raw[0] ?? "") : "";
};
const extractCount = ({ value }: Readonly<{ value: number | string | null }>): number => {
  if (typeof value === "number") {
    return value;
  }
  if (typeof value === "string") {
    const n: number = Number(value);
    return Number.isFinite(n) ? n : 0;
  }
  return 0;
};
const formatDuration = ({ seconds }: Readonly<{ seconds: number }>): string => {
  const r: number = Math.max(0, Math.round(seconds));
  const m: number = Math.floor(r / 60);
  const s: number = r % 60;
  return m === 0 ? `${s}s` : `${m}m ${s}s`;
};
const buildDefaultDateFrom = (): string => {
  const d: Date = new Date();
  d.setMonth(d.getMonth() - 6);
  return d.toISOString().slice(0, 10);
};
const buildDefaultDateTo = (): string => {
  return new Date().toISOString().slice(0, 10);
};
const buildCurvePoints = ({
  monthlyCalls,
  monthlyCampaigns,
  from,
  to,
}: Readonly<{
  monthlyCalls: ReadonlyMap<string, number>;
  monthlyCampaigns: ReadonlyMap<string, number>;
  from: Date;
  to: Date;
}>): readonly CurvePoint[] => {
  const points: CurvePoint[] = [];
  const cursor: Date = new Date(Date.UTC(from.getUTCFullYear(), from.getUTCMonth(), 1));
  const endMonth: Date = new Date(Date.UTC(to.getUTCFullYear(), to.getUTCMonth(), 1));
  while (cursor <= endMonth) {
    const key: string = `${cursor.getUTCFullYear()}-${String(cursor.getUTCMonth() + 1).padStart(2, "0")}`;
    const label: string = cursor.toLocaleString("fr-FR", { month: "short", year: "2-digit" });
    points.push({ label, calls: monthlyCalls.get(key) ?? 0, campaigns: monthlyCampaigns.get(key) ?? 0 });
    cursor.setUTCMonth(cursor.getUTCMonth() + 1);
  }
  return points;
};
const buildAreaPath = ({
  values,
  maxValue,
  w,
  h,
}: Readonly<{ values: readonly number[]; maxValue: number; w: number; h: number }>): Readonly<{
  linePath: string;
  areaPath: string;
}> => {
  if (values.length === 0) {
    return { linePath: "", areaPath: "" };
  }
  const safe: number = Math.max(1, maxValue);
  const pts: string[] = values.map((v, i) => {
    const x: number = values.length === 1 ? w / 2 : (i / (values.length - 1)) * w;
    const y: number = h - (v / safe) * h;
    return `${x},${y}`;
  });
  const line: string = `M ${pts.join(" L ")}`;
  return {
    linePath: line,
    areaPath: `${line} L ${pts[pts.length - 1].split(",")[0]},${h} L ${pts[0].split(",")[0]},${h} Z`,
  };
};

export default async function AnalyticsPage({
  searchParams,
}: Readonly<{
  searchParams?: Promise<SearchParams>;
}>): Promise<React.JSX.Element> {
  await requireRole({ allowedRoles: ["super_admin"] });
  const sp: SearchParams = (await searchParams) ?? {};
  const campaignFilter: string = readParam({ sp, key: "campaign" });
  const dateFromStr: string = readParam({ sp, key: "from" }) || buildDefaultDateFrom();
  const dateToStr: string = readParam({ sp, key: "to" }) || buildDefaultDateTo();
  const dateFrom: Date = new Date(dateFromStr);
  const dateTo: Date = new Date(dateToStr + "T23:59:59.999Z");
  const campaignOptions: readonly CampaignOption[] = await db
    .select({ id: campaigns.id, title: campaigns.title })
    .from(campaigns)
    .orderBy(campaigns.title);
  const callConditions: ReturnType<typeof and>[] = [gte(callResults.createdAt, dateFrom), lte(callResults.createdAt, dateTo)];
  if (campaignFilter.length > 0) {
    callConditions.push(eq(callResults.campaignId, campaignFilter));
  }
  const callWhere = and(...callConditions);
  const campaignConditions: ReturnType<typeof and>[] = [gte(campaigns.createdAt, dateFrom), lte(campaigns.createdAt, dateTo)];
  if (campaignFilter.length > 0) {
    campaignConditions.push(eq(campaigns.id, campaignFilter));
  }
  const campWhere = and(...campaignConditions);
  const totalCalls: number = (
    await db.select({ value: count(callResults.id) }).from(callResults).where(callWhere)
  )[0]?.value ?? 0;
  const falseNumbers: number = (
    await db.select({ value: count(callResults.id) }).from(callResults).where(and(callWhere, eq(callResults.outcome, "false_number")))
  )[0]?.value ?? 0;
  const whatsappCount: number = (
    await db.select({ value: count(callResults.id) }).from(callResults).where(and(callWhere, eq(callResults.isWhatsappRedirected, true)))
  )[0]?.value ?? 0;
  const avgDurationResult: Array<{ value: number | string | null }> = await db
    .select({ value: sql<number>`coalesce(round(avg(${callResults.durationSeconds})::numeric, 0), 0)` })
    .from(callResults)
    .where(callWhere);
  const avgDuration: number = extractCount({ value: avgDurationResult[0]?.value ?? 0 });
  const totalAdmins: number = (
    await db.select({ value: count(users.id) }).from(users).where(eq(users.role, "admin"))
  )[0]?.value ?? 0;
  const totalAgents: number = (
    await db.select({ value: count(users.id) }).from(users).where(eq(users.role, "agent"))
  )[0]?.value ?? 0;
  const filteredCampaigns: number = (
    await db.select({ value: count(campaigns.id) }).from(campaigns).where(campWhere)
  )[0]?.value ?? 0;
  const falseRate: number = totalCalls === 0 ? 0 : Math.round((falseNumbers / totalCalls) * 100);
  const whatsappRate: number = totalCalls === 0 ? 0 : Math.round((whatsappCount / totalCalls) * 100);
  const rangeDays: number = Math.max(1, Math.ceil((dateTo.getTime() - dateFrom.getTime()) / 86400000));
  const prevFrom: Date = new Date(dateFrom.getTime() - rangeDays * 86400000);
  const prevConditions: ReturnType<typeof and>[] = [gte(callResults.createdAt, prevFrom), lte(callResults.createdAt, dateFrom)];
  if (campaignFilter.length > 0) {
    prevConditions.push(eq(callResults.campaignId, campaignFilter));
  }
  const prevCalls: number = (
    await db.select({ value: count(callResults.id) }).from(callResults).where(and(...prevConditions))
  )[0]?.value ?? 0;
  const callsTrend: number =
    prevCalls === 0 ? (totalCalls > 0 ? 100 : 0) : Math.round(((totalCalls - prevCalls) / prevCalls) * 100);
  const monthlyCallsResult: Array<{ month: string | null; value: number }> = await db
    .select({
      month: sql<string>`to_char(date_trunc('month', ${callResults.createdAt}), 'YYYY-MM')`,
      value: count(callResults.id),
    })
    .from(callResults)
    .where(callWhere)
    .groupBy(sql`date_trunc('month', ${callResults.createdAt})`)
    .orderBy(sql`date_trunc('month', ${callResults.createdAt}) asc`);
  const monthlyCampaignsResult: Array<{ month: string | null; value: number }> = await db
    .select({
      month: sql<string>`to_char(date_trunc('month', ${campaigns.createdAt}), 'YYYY-MM')`,
      value: count(campaigns.id),
    })
    .from(campaigns)
    .where(campWhere)
    .groupBy(sql`date_trunc('month', ${campaigns.createdAt})`)
    .orderBy(sql`date_trunc('month', ${campaigns.createdAt}) asc`);
  const callsMap: ReadonlyMap<string, number> = new Map(
    monthlyCallsResult.filter((e) => typeof e.month === "string").map((e) => [e.month as string, e.value]),
  );
  const campaignsMap: ReadonlyMap<string, number> = new Map(
    monthlyCampaignsResult.filter((e) => typeof e.month === "string").map((e) => [e.month as string, e.value]),
  );
  const curvePoints: readonly CurvePoint[] = buildCurvePoints({
    monthlyCalls: callsMap,
    monthlyCampaigns: campaignsMap,
    from: dateFrom,
    to: dateTo,
  });
  const callValues: readonly number[] = curvePoints.map((p) => p.calls);
  const campaignValues: readonly number[] = curvePoints.map((p) => p.campaigns);
  const allMax: number = Math.max(...callValues, ...campaignValues, 1);
  const callsChart = buildAreaPath({ values: callValues, maxValue: allMax, w: 500, h: 160 });
  const campaignsChart = buildAreaPath({ values: campaignValues, maxValue: allMax, w: 500, h: 160 });
  const selectedCampaignTitle: string =
    campaignFilter.length > 0
      ? (campaignOptions.find((c) => c.id === campaignFilter)?.title ?? "Campagne")
      : "Toutes les campagnes";
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Statistiques</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">Courbes d&apos;évolution et indicateurs filtrables</p>
      </div>
      <AnalyticsFilters
        campaigns={campaignOptions}
        currentCampaign={campaignFilter}
        currentFrom={dateFromStr}
        currentTo={dateToStr}
      />
      {campaignFilter.length > 0 ? (
        <div className="flex items-center gap-2 rounded-xl border border-lbs-blue/20 bg-lbs-blue/5 px-4 py-2 text-sm text-lbs-blue dark:border-blue-400/30 dark:bg-blue-500/10 dark:text-blue-200">
          <Filter className="size-3.5" />
          Données filtrées sur : <span className="font-medium">{selectedCampaignTitle}</span>
          <span className="text-xs text-zinc-500 dark:text-zinc-400">du {dateFromStr} au {dateToStr}</span>
          <a href="/dashboard/super-admin/analytics" className="ml-auto text-xs underline opacity-70 hover:opacity-100">Réinitialiser</a>
        </div>
      ) : null}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Administrateurs", value: totalAdmins, color: "from-blue-400 to-blue-600", icon: "👤" },
          { label: "Agents", value: totalAgents, color: "from-violet-400 to-purple-500", icon: "🎧" },
          { label: "Campagnes", value: filteredCampaigns, color: "from-cyan-400 to-blue-500", icon: "📊" },
          { label: "Appels", value: totalCalls, color: "from-amber-400 to-orange-500", icon: "📞" },
        ].map((stat) => (
          <div key={stat.label} className={`rounded-2xl bg-gradient-to-br ${stat.color} p-5 text-white shadow-lg transition-transform duration-300 hover:scale-[1.02]`}>
            <div className="flex items-center justify-between">
              <p className="text-sm text-white/80">{stat.label}</p>
              <span className="text-lg">{stat.icon}</span>
            </div>
            <p className="mt-1 text-3xl font-bold">{stat.value}</p>
          </div>
        ))}
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-zinc-200/70 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-[#1a2332]">
          <div className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
            <PhoneMissed className="size-4 text-rose-400" />
            Faux numéros
          </div>
          <p className="mt-1 text-2xl font-bold text-zinc-900 dark:text-white">{falseNumbers}</p>
          <span className="rounded-full bg-rose-100 px-2 py-0.5 text-xs font-medium text-rose-700 dark:bg-rose-500/15 dark:text-rose-300">{falseRate}% du total</span>
        </div>
        <div className="rounded-2xl border border-zinc-200/70 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-[#1a2332]">
          <div className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
            <Send className="size-4 text-emerald-400" />
            WhatsApp
          </div>
          <p className="mt-1 text-2xl font-bold text-zinc-900 dark:text-white">{whatsappCount}</p>
          <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">{whatsappRate}% du total</span>
        </div>
        <div className="rounded-2xl border border-zinc-200/70 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-[#1a2332]">
          <div className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
            <TrendingUp className="size-4 text-blue-400" />
            Durée moyenne
          </div>
          <p className="mt-1 text-2xl font-bold text-zinc-900 dark:text-white">{formatDuration({ seconds: avgDuration })}</p>
          <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-500/15 dark:text-blue-300">par appel</span>
        </div>
        <div className="rounded-2xl border border-zinc-200/70 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-[#1a2332]">
          <div className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
            {callsTrend >= 0 ? <ArrowUpRight className="size-4 text-emerald-400" /> : <ArrowDownRight className="size-4 text-rose-400" />}
            Tendance
          </div>
          <p className="mt-1 text-2xl font-bold text-zinc-900 dark:text-white">{callsTrend >= 0 ? "+" : ""}{callsTrend}%</p>
          <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${callsTrend >= 0 ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300" : "bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300"}`}>
            vs période précédente
          </span>
        </div>
      </div>
      <div className="rounded-2xl border border-zinc-200/70 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#1a2332]">
        <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-zinc-700 dark:text-zinc-200">
          <TrendingUp className="size-4 text-lbs-blue" />
          Appels — {selectedCampaignTitle}
        </h3>
        <svg viewBox="0 0 500 160" className="h-44 w-full" preserveAspectRatio="none">
          <defs>
            <linearGradient id="callsG" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#244976" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#244976" stopOpacity="0.02" />
            </linearGradient>
          </defs>
          {callsChart.areaPath.length > 0 ? (
            <>
              <path d={callsChart.areaPath} fill="url(#callsG)" />
              <path d={callsChart.linePath} fill="none" stroke="#244976" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </>
          ) : null}
        </svg>
        <div className="mt-2 flex justify-between text-[11px] text-zinc-400">
          {curvePoints.map((p) => (<span key={p.label}>{p.label}</span>))}
        </div>
      </div>
      <div className="rounded-2xl border border-zinc-200/70 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#1a2332]">
        <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-zinc-700 dark:text-zinc-200">
          <BarChart3 className="size-4 text-blue-500" />
          Campagnes créées — {dateFromStr} → {dateToStr}
        </h3>
        <svg viewBox="0 0 500 160" className="h-44 w-full" preserveAspectRatio="none">
          <defs>
            <linearGradient id="campG" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.02" />
            </linearGradient>
          </defs>
          {campaignsChart.areaPath.length > 0 ? (
            <>
              <path d={campaignsChart.areaPath} fill="url(#campG)" />
              <path d={campaignsChart.linePath} fill="none" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </>
          ) : null}
        </svg>
        <div className="mt-2 flex justify-between text-[11px] text-zinc-400">
          {curvePoints.map((p) => (<span key={p.label}>{p.label}</span>))}
        </div>
      </div>
      <div className="rounded-2xl border border-zinc-200/70 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#1a2332]">
        <h3 className="mb-3 text-sm font-semibold text-zinc-700 dark:text-zinc-200">Détail mensuel</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-200 text-xs uppercase text-zinc-500 dark:border-white/10">
                <th className="px-4 py-2">Mois</th>
                <th className="px-4 py-2">Appels</th>
                <th className="px-4 py-2">Campagnes</th>
              </tr>
            </thead>
            <tbody>
              {curvePoints.map((point) => (
                <tr key={point.label} className="border-b border-zinc-100 dark:border-white/5">
                  <td className="px-4 py-2.5 font-medium text-zinc-800 dark:text-zinc-200">{point.label}</td>
                  <td className="px-4 py-2.5 text-zinc-600 dark:text-zinc-300">{point.calls}</td>
                  <td className="px-4 py-2.5 text-zinc-600 dark:text-zinc-300">{point.campaigns}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
