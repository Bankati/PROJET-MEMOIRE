/**
 * Dashboard administrateur — KPI, graphiques, top agents, filtre par établissement.
 */
import {
  ArrowDownRight,
  ArrowUpRight,
  Contact,
  Filter,
  Megaphone,
  Phone,
  PhoneMissed,
  Send,
  Sparkles,
  Trophy,
  Users,
} from "lucide-react";
import { and, count, desc, eq, gte, inArray, lte, sql } from "drizzle-orm";

import { requireRole } from "@/lib/auth/server-auth";
import { db } from "@/lib/db";
import {
  campaigns,
  campaignContacts,
  callResults,
  contacts,
  users,
} from "@/db/schema";
import { AdminDashboardFilters } from "@/components/admin/dashboard-filters";

type SearchParams = Readonly<Record<string, string | string[] | undefined>>;
type CurvePoint = Readonly<{ label: string; calls: number }>;
type CampaignOption = Readonly<{ id: string; title: string }>;
type RecentAgent = Readonly<{ id: string; fullName: string; email: string; createdAt: Date }>;

const readParam = ({ sp, key }: Readonly<{ sp: SearchParams; key: string }>): string => {
  const raw: string | string[] | undefined = sp[key];
  if (typeof raw === "string") return raw;
  return Array.isArray(raw) ? (raw[0] ?? "") : "";
};

const extractCount = ({ value }: Readonly<{ value: number | string | null }>): number => {
  if (typeof value === "number") return value;
  if (typeof value === "string") { const n = Number(value); return Number.isFinite(n) ? n : 0; }
  return 0;
};

const formatDuration = ({ seconds }: Readonly<{ seconds: number }>): string => {
  const r = Math.max(0, Math.round(seconds));
  const m = Math.floor(r / 60);
  const s = r % 60;
  return m === 0 ? `${s}s` : `${m}m ${s}s`;
};

const formatTimeAgo = ({ date }: Readonly<{ date: Date }>): string => {
  const diff = Math.floor((Date.now() - date.getTime()) / 60000);
  if (diff < 60) return `il y a ${Math.max(1, diff)} min`;
  const hours = Math.floor(diff / 60);
  if (hours < 24) return `il y a ${hours}h`;
  return `il y a ${Math.floor(hours / 24)}j`;
};

const buildCurvePoints = ({
  monthlyCalls, from, to,
}: Readonly<{ monthlyCalls: ReadonlyMap<string, number>; from: Date; to: Date }>): readonly CurvePoint[] => {
  const points: CurvePoint[] = [];
  const cursor = new Date(Date.UTC(from.getUTCFullYear(), from.getUTCMonth(), 1));
  const endMonth = new Date(Date.UTC(to.getUTCFullYear(), to.getUTCMonth(), 1));
  while (cursor <= endMonth) {
    const key = `${cursor.getUTCFullYear()}-${String(cursor.getUTCMonth() + 1).padStart(2, "0")}`;
    points.push({ label: cursor.toLocaleString("fr-FR", { month: "short" }), calls: monthlyCalls.get(key) ?? 0 });
    cursor.setUTCMonth(cursor.getUTCMonth() + 1);
  }
  return points;
};

const buildAreaPath = ({
  values, maxValue, w, h,
}: Readonly<{ values: readonly number[]; maxValue: number; w: number; h: number }>): Readonly<{ linePath: string; areaPath: string }> => {
  if (values.length === 0) return { linePath: "", areaPath: "" };
  const safe = Math.max(1, maxValue);
  const pts = values.map((v, i) => {
    const x = values.length === 1 ? w / 2 : (i / (values.length - 1)) * w;
    const y = h - (v / safe) * h;
    return `${x},${y}`;
  });
  const line = `M ${pts.join(" L ")}`;
  return { linePath: line, areaPath: `${line} L ${pts[pts.length - 1].split(",")[0]},${h} L ${pts[0].split(",")[0]},${h} Z` };
};

const buildSparkline = ({ n }: Readonly<{ n: number }>): string => {
  const p = [n * 0.3, n * 0.5, n * 0.4, n * 0.7, n * 0.6, n * 0.9, n];
  const mx = Math.max(...p, 1);
  return p.map((v, i) => `${(i / (p.length - 1)) * 100},${40 - (v / mx) * 35}`).join(" ");
};

const buildDefaultFrom = (): string => {
  const d = new Date(); d.setMonth(d.getMonth() - 6); return d.toISOString().slice(0, 10);
};
const buildDefaultTo = (): string => new Date().toISOString().slice(0, 10);

export default async function AdminDashboardPage({
  searchParams,
}: Readonly<{ searchParams?: Promise<SearchParams> }>): Promise<React.JSX.Element> {
  const user = await requireRole({ allowedRoles: ["admin"] });
  const sp: SearchParams = (await searchParams) ?? {};
  const campaignFilter = readParam({ sp, key: "campaign" });
  const schoolFilter = readParam({ sp, key: "school" });
  const dateFromStr = readParam({ sp, key: "from" }) || buildDefaultFrom();
  const dateToStr = readParam({ sp, key: "to" }) || buildDefaultTo();
  const dateFrom = new Date(dateFromStr);
  const dateTo = new Date(dateToStr + "T23:59:59.999Z");

  const campaignOptions: readonly CampaignOption[] = await db
    .select({ id: campaigns.id, title: campaigns.title })
    .from(campaigns)
    .where(eq(campaigns.createdByAdminId, user.id))
    .orderBy(desc(campaigns.createdAt));
  const adminCampaignIds = campaignOptions.map((c) => c.id);
  const hasCampaigns = adminCampaignIds.length > 0;

  // Distinct schools from contacts in admin's campaigns
  const schoolOptions = hasCampaigns
    ? await db
        .selectDistinct({ schoolName: contacts.schoolName })
        .from(contacts)
        .innerJoin(campaignContacts, eq(campaignContacts.contactId, contacts.id))
        .where(and(inArray(campaignContacts.campaignId, adminCampaignIds), sql`${contacts.schoolName} is not null`))
        .orderBy(contacts.schoolName)
    : [];

  const callConditions: ReturnType<typeof and>[] = [gte(callResults.createdAt, dateFrom), lte(callResults.createdAt, dateTo)];
  if (campaignFilter.length > 0) {
    callConditions.push(eq(callResults.campaignId, campaignFilter));
  } else if (hasCampaigns) {
    callConditions.push(inArray(callResults.campaignId, adminCampaignIds as string[]));
  }
  if (schoolFilter.length > 0) {
    callConditions.push(eq(contacts.schoolName, schoolFilter));
  }

  const callWhereClause = and(...callConditions);
  const needsContactsJoin = schoolFilter.length > 0;

  // When school filter active, join contacts table
  const totalCallsCount = hasCampaigns
    ? schoolFilter.length > 0
      ? (await db.select({ value: count(callResults.id) }).from(callResults).innerJoin(contacts, eq(callResults.contactId, contacts.id)).where(callWhereClause))[0]?.value ?? 0
      : (await db.select({ value: count(callResults.id) }).from(callResults).where(callWhereClause))[0]?.value ?? 0
    : 0;

  const [falseNumbersCount, whatsappCount, avgDuration] = hasCampaigns
    ? await Promise.all([
        needsContactsJoin
          ? db.select({ value: count(callResults.id) }).from(callResults).innerJoin(contacts, eq(callResults.contactId, contacts.id)).where(and(callWhereClause, eq(callResults.outcome, "false_number"))).then((r) => r[0]?.value ?? 0)
          : db.select({ value: count(callResults.id) }).from(callResults).where(and(callWhereClause, eq(callResults.outcome, "false_number"))).then((r) => r[0]?.value ?? 0),
        needsContactsJoin
          ? db.select({ value: count(callResults.id) }).from(callResults).innerJoin(contacts, eq(callResults.contactId, contacts.id)).where(and(callWhereClause, eq(callResults.isWhatsappRedirected, true))).then((r) => r[0]?.value ?? 0)
          : db.select({ value: count(callResults.id) }).from(callResults).where(and(callWhereClause, eq(callResults.isWhatsappRedirected, true))).then((r) => r[0]?.value ?? 0),
        needsContactsJoin
          ? db.select({ value: sql<number>`coalesce(round(avg(${callResults.durationSeconds})::numeric, 0), 0)` }).from(callResults).innerJoin(contacts, eq(callResults.contactId, contacts.id)).where(callWhereClause).then((r) => extractCount({ value: r[0]?.value ?? 0 }))
          : db.select({ value: sql<number>`coalesce(round(avg(${callResults.durationSeconds})::numeric, 0), 0)` }).from(callResults).where(callWhereClause).then((r) => extractCount({ value: r[0]?.value ?? 0 })),
      ])
    : [0, 0, 0];

  const falseRate = totalCallsCount === 0 ? 0 : Math.round((falseNumbersCount / totalCallsCount) * 100);
  const whatsappRate = totalCallsCount === 0 ? 0 : Math.round((whatsappCount / totalCallsCount) * 100);

  const myAgentsCount = (await db.select({ value: count(users.id) }).from(users).where(and(eq(users.role, "agent"), eq(users.managedByAdminId, user.id), eq(users.status, "active"))))[0]?.value ?? 0;
  const activeCampaignsCount = (await db.select({ value: count(campaigns.id) }).from(campaigns).where(and(eq(campaigns.createdByAdminId, user.id), eq(campaigns.status, "active"))))[0]?.value ?? 0;

  const myContactsConditions: ReturnType<typeof and>[] = [eq(campaignContacts.importedByAdminId, user.id)];
  if (campaignFilter.length > 0) myContactsConditions.push(eq(campaignContacts.campaignId, campaignFilter));
  const myContactsCount = (await db.select({ value: count(campaignContacts.id) }).from(campaignContacts).where(and(...myContactsConditions)))[0]?.value ?? 0;

  const rangeDays = Math.max(1, Math.ceil((dateTo.getTime() - dateFrom.getTime()) / 86400000));
  const prevDateFrom = new Date(dateFrom.getTime() - rangeDays * 86400000);
  const prevConditions: ReturnType<typeof and>[] = [gte(callResults.createdAt, prevDateFrom), lte(callResults.createdAt, dateFrom)];
  if (campaignFilter.length > 0) {
    prevConditions.push(eq(callResults.campaignId, campaignFilter));
  } else if (hasCampaigns) {
    prevConditions.push(inArray(callResults.campaignId, adminCampaignIds as string[]));
  }
  const prevCallsCount = hasCampaigns ? (await db.select({ value: count(callResults.id) }).from(callResults).where(and(...prevConditions)))[0]?.value ?? 0 : 0;
  const callsTrend = prevCallsCount === 0 ? (totalCallsCount > 0 ? 100 : 0) : Math.round(((totalCallsCount - prevCallsCount) / prevCallsCount) * 100);

  const monthlyCallsBase = db
    .select({
      month: sql<string>`to_char(date_trunc('month', ${callResults.createdAt}), 'YYYY-MM')`,
      value: count(callResults.id),
    })
    .from(callResults);
  const monthlyCallsResult = hasCampaigns
    ? needsContactsJoin
      ? await monthlyCallsBase.innerJoin(contacts, eq(callResults.contactId, contacts.id)).where(callWhereClause).groupBy(sql`date_trunc('month', ${callResults.createdAt})`).orderBy(sql`date_trunc('month', ${callResults.createdAt}) asc`)
      : await monthlyCallsBase.where(callWhereClause).groupBy(sql`date_trunc('month', ${callResults.createdAt})`).orderBy(sql`date_trunc('month', ${callResults.createdAt}) asc`)
    : [];

  const monthlyMap: ReadonlyMap<string, number> = new Map(
    monthlyCallsResult.filter((e) => typeof e.month === "string").map((e) => [e.month as string, e.value]),
  );
  const curvePoints = buildCurvePoints({ monthlyCalls: monthlyMap, from: dateFrom, to: dateTo });
  const callValues = curvePoints.map((p) => p.calls);
  const chartMax = Math.max(...callValues, 1);
  const { linePath, areaPath } = buildAreaPath({ values: callValues, maxValue: chartMax, w: 500, h: 160 });

  const recentAgents: readonly RecentAgent[] = await db
    .select({ id: users.id, fullName: users.fullName, email: users.email, createdAt: users.createdAt })
    .from(users)
    .where(and(eq(users.role, "agent"), eq(users.managedByAdminId, user.id)))
    .orderBy(desc(users.createdAt))
    .limit(5);

  // Top agents by calls
  const topAgents = hasCampaigns
    ? await db
        .select({
          agentId: callResults.agentId,
          agentName: users.fullName,
          totalCalls: count(callResults.id),
          whatsappCalls: sql<number>`count(case when ${callResults.isWhatsappRedirected} then 1 end)`,
        })
        .from(callResults)
        .innerJoin(users, eq(callResults.agentId, users.id))
        .where(and(
          inArray(callResults.campaignId, adminCampaignIds as string[]),
          gte(callResults.createdAt, dateFrom),
          lte(callResults.createdAt, dateTo),
        ))
        .groupBy(callResults.agentId, users.fullName)
        .orderBy(desc(count(callResults.id)))
        .limit(5)
    : [];

  const statCards = [
    { label: "Appels totaux", value: `${totalCallsCount}`, gradient: "from-blue-500 to-blue-600", n: totalCallsCount, badge: `${callsTrend >= 0 ? "+" : ""}${callsTrend}%` },
    { label: "Faux numéros", value: `${falseNumbersCount}`, gradient: "from-rose-400 to-rose-500", n: falseNumbersCount, badge: `${falseRate}%` },
    { label: "WhatsApp envoyés", value: `${whatsappCount}`, gradient: "from-emerald-400 to-emerald-500", n: whatsappCount, badge: `${whatsappRate}%` },
    { label: "Durée moyenne", value: formatDuration({ seconds: avgDuration as number }), gradient: "from-amber-400 to-orange-400", n: avgDuration as number, badge: "moy." },
  ];

  const donutTotal = Math.max(1, totalCallsCount);
  const normalCount = totalCallsCount - falseNumbersCount - whatsappCount;
  const donutSegments = [
    { percent: Math.round((Math.max(0, normalCount) / donutTotal) * 100), color: "#244976", label: "Normaux" },
    { percent: falseRate, color: "#ef4444", label: "Faux n°" },
    { percent: whatsappRate, color: "#22c55e", label: "WhatsApp" },
  ];

  const selectedCampaignTitle = campaignFilter.length > 0
    ? (campaignOptions.find((c) => c.id === campaignFilter)?.title ?? "Campagne")
    : "Toutes mes campagnes";

  const currentUrl = new URL("http://x/dashboard/admin");
  if (campaignFilter.length > 0) currentUrl.searchParams.set("campaign", campaignFilter);
  if (dateFromStr) currentUrl.searchParams.set("from", dateFromStr);
  if (dateToStr) currentUrl.searchParams.set("to", dateToStr);
  const baseFilterUrl = currentUrl.search;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Dashboard</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">Vue d&apos;ensemble de vos campagnes et performances</p>
      </div>

      <AdminDashboardFilters campaigns={campaignOptions} currentCampaign={campaignFilter} currentFrom={dateFromStr} currentTo={dateToStr} />

      {/* School filter */}
      {schoolOptions.length > 0 ? (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Établissement :</span>
          <a
            href={`/dashboard/admin${baseFilterUrl}`}
            className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
              schoolFilter.length === 0
                ? "border-lbs-blue bg-lbs-blue/10 text-lbs-blue dark:border-blue-400 dark:bg-blue-500/15 dark:text-blue-300"
                : "border-zinc-200 text-zinc-600 hover:border-lbs-blue hover:text-lbs-blue dark:border-white/15 dark:text-zinc-300"
            }`}
          >
            Tous
          </a>
          {schoolOptions.map((s) => s.schoolName ? (
            <a
              key={s.schoolName}
              href={`/dashboard/admin${baseFilterUrl}&school=${encodeURIComponent(s.schoolName)}`}
              className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                schoolFilter === s.schoolName
                  ? "border-lbs-blue bg-lbs-blue/10 text-lbs-blue dark:border-blue-400 dark:bg-blue-500/15 dark:text-blue-300"
                  : "border-zinc-200 text-zinc-600 hover:border-lbs-blue hover:text-lbs-blue dark:border-white/15 dark:text-zinc-300"
              }`}
            >
              {s.schoolName}
            </a>
          ) : null)}
        </div>
      ) : null}

      {campaignFilter.length > 0 || schoolFilter.length > 0 ? (
        <div className="flex items-center gap-2 rounded-xl border border-lbs-blue/20 bg-lbs-blue/5 px-4 py-2 text-sm text-lbs-blue dark:border-blue-400/30 dark:bg-blue-500/10 dark:text-blue-200">
          <Filter className="size-3.5" />
          {campaignFilter.length > 0 ? <><span>Campagne :</span> <span className="font-medium">{selectedCampaignTitle}</span></> : null}
          {schoolFilter.length > 0 ? <><span className="ml-2">École :</span> <span className="font-medium">{schoolFilter}</span></> : null}
          <a href="/dashboard/admin" className="ml-auto text-xs underline opacity-70 hover:opacity-100">Réinitialiser</a>
        </div>
      ) : null}

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Campagnes actives", value: activeCampaignsCount, icon: <Megaphone className="size-4 text-blue-400" />, hint: "Créées par vous" },
          { label: "Contacts importés", value: myContactsCount, icon: <Contact className="size-4 text-emerald-400" />, hint: selectedCampaignTitle },
          { label: "Agents actifs", value: myAgentsCount, icon: <Users className="size-4 text-violet-400" />, hint: "Sous votre gestion" },
          { label: "Volume d'appels", value: totalCallsCount, icon: <Phone className="size-4 text-amber-400" />, hint: `Du ${dateFromStr} au ${dateToStr}` },
        ].map((kpi) => (
          <div key={kpi.label} className="rounded-2xl border border-zinc-200/70 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md dark:border-white/10 dark:bg-[#1a2332]">
            <div className="flex items-center justify-between">
              <p className="text-sm text-zinc-500 dark:text-zinc-400">{kpi.label}</p>
              {kpi.icon}
            </div>
            <p className="mt-2 text-3xl font-bold text-zinc-900 dark:text-white">{kpi.value}</p>
            <p className="mt-1 text-xs text-zinc-400">{kpi.hint}</p>
          </div>
        ))}
      </div>

      {/* Chart + donut */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-zinc-200/70 bg-white p-5 shadow-sm lg:col-span-2 dark:border-white/10 dark:bg-[#1a2332]">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Appels — {selectedCampaignTitle}</p>
              <p className="text-2xl font-bold text-zinc-900 dark:text-white">{totalCallsCount}</p>
            </div>
            <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${callsTrend >= 0 ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300" : "bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300"}`}>
              {callsTrend >= 0 ? <ArrowUpRight className="size-3" /> : <ArrowDownRight className="size-3" />}
              {callsTrend >= 0 ? "+" : ""}{callsTrend}% vs période précédente
            </span>
          </div>
          <svg viewBox="0 0 500 160" className="h-40 w-full" preserveAspectRatio="none">
            <defs>
              <linearGradient id="adminAreaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#244976" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#244976" stopOpacity="0.02" />
              </linearGradient>
            </defs>
            {areaPath.length > 0 ? (
              <>
                <path d={areaPath} fill="url(#adminAreaGrad)" />
                <path d={linePath} fill="none" stroke="#244976" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </>
            ) : null}
          </svg>
          <div className="mt-2 flex justify-between text-[11px] text-zinc-400">
            {curvePoints.map((p) => <span key={p.label}>{p.label}</span>)}
          </div>
        </div>
        <div className="rounded-2xl border border-zinc-200/70 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#1a2332]">
          <p className="mb-4 text-sm font-medium text-zinc-500 dark:text-zinc-400">Répartition du trafic</p>
          <div className="flex items-center justify-center">
            <svg viewBox="0 0 120 120" className="size-32">
              <circle cx="60" cy="60" r="50" fill="none" stroke="#e5e7eb" strokeWidth="14" className="dark:stroke-zinc-700" />
              {(() => {
                let offset = 0;
                return donutSegments.map((seg) => {
                  const circ = 2 * Math.PI * 50;
                  const dash = (seg.percent / 100) * circ;
                  const off = -offset * (circ / 100);
                  const el = <circle key={seg.label} cx="60" cy="60" r="50" fill="none" stroke={seg.color} strokeWidth="14" strokeDasharray={`${dash} ${circ - dash}`} strokeDashoffset={off} strokeLinecap="round" transform="rotate(-90 60 60)" />;
                  offset += seg.percent;
                  return el;
                });
              })()}
            </svg>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2 text-center">
            {donutSegments.map((seg) => (
              <div key={seg.label}>
                <p className="text-lg font-bold text-zinc-900 dark:text-white">{seg.percent}%</p>
                <div className="flex items-center justify-center gap-1">
                  <span className="size-2 rounded-full" style={{ background: seg.color }} />
                  <p className="text-[10px] text-zinc-500 dark:text-zinc-400">{seg.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stat gradient cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => (
          <div key={card.label} className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${card.gradient} p-5 text-white shadow-lg transition-transform duration-300 hover:scale-[1.02]`}>
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-white/80">{card.label}</p>
              <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-semibold">{card.badge}</span>
            </div>
            <p className="mt-1 text-2xl font-bold">{card.value}</p>
            <svg viewBox="0 0 100 40" className="absolute bottom-0 right-0 h-12 w-24 opacity-40" preserveAspectRatio="none">
              <polyline fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="2" points={buildSparkline({ n: card.n })} />
            </svg>
          </div>
        ))}
      </div>

      {/* Top Agents + Recent Agents */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Top Agents */}
        <div className="rounded-2xl border border-zinc-200/70 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#1a2332]">
          <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-zinc-800 dark:text-white">
            <Trophy className="size-4 text-amber-400" />
            Top Agents
          </h3>
          {topAgents.length === 0 ? (
            <p className="py-6 text-center text-sm text-zinc-400">Aucun appel enregistré.</p>
          ) : (
            <div className="space-y-3">
              {topAgents.map((agent, idx) => (
                <div key={agent.agentId} className="flex items-center gap-3">
                  <span className={`grid size-7 shrink-0 place-items-center rounded-full text-xs font-bold ${
                    idx === 0 ? "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300" :
                    idx === 1 ? "bg-zinc-100 text-zinc-600 dark:bg-white/10 dark:text-zinc-300" :
                    "bg-zinc-50 text-zinc-500 dark:bg-white/5 dark:text-zinc-400"
                  }`}>{idx + 1}</span>
                  <div className="grid size-9 shrink-0 place-items-center rounded-full bg-gradient-to-br from-blue-400 to-blue-600 text-xs font-semibold text-white">
                    {agent.agentName.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-zinc-800 dark:text-white">{agent.agentName}</p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">{agent.totalCalls} appels</p>
                  </div>
                  <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
                    {extractCount({ value: agent.whatsappCalls })} WA
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Agents */}
        <div className="rounded-2xl border border-zinc-200/70 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#1a2332]">
          <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-zinc-800 dark:text-white">
            <Sparkles className="size-4 text-amber-400" />
            Agents récents
          </h3>
          {recentAgents.length === 0 ? (
            <p className="py-6 text-center text-sm text-zinc-400">Aucun agent créé pour le moment.</p>
          ) : (
            <div className="space-y-4">
              {recentAgents.map((agent, idx) => (
                <div key={agent.id} className="flex items-center gap-3">
                  <div className="relative">
                    <div className="grid size-9 shrink-0 place-items-center rounded-full bg-gradient-to-br from-blue-400 to-blue-600 text-xs font-semibold text-white">
                      {agent.fullName.charAt(0).toUpperCase()}
                    </div>
                    {idx === 0 ? <span className="absolute -right-0.5 -top-0.5 size-2.5 rounded-full border-2 border-white bg-emerald-400 dark:border-[#1a2332]" /> : null}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-zinc-800 dark:text-white">{agent.fullName}</p>
                    <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">{agent.email}</p>
                  </div>
                  <p className="shrink-0 text-[11px] text-zinc-400">{formatTimeAgo({ date: agent.createdAt })}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Key indicators */}
      <div className="rounded-2xl border border-zinc-200/70 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#1a2332]">
        <h3 className="mb-4 text-sm font-semibold text-zinc-800 dark:text-white">Indicateurs clés</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-200 text-xs uppercase text-zinc-500 dark:border-white/10">
                <th className="px-2 py-2">Indicateur</th>
                <th className="px-2 py-2">Valeur</th>
                <th className="px-2 py-2">Taux</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-zinc-100 dark:border-white/5">
                <td className="px-2 py-3 text-zinc-700 dark:text-zinc-200"><span className="inline-flex items-center gap-1.5"><PhoneMissed className="size-3.5 text-rose-400" />Faux numéros</span></td>
                <td className="px-2 py-3 font-semibold text-zinc-900 dark:text-white">{falseNumbersCount}</td>
                <td className="px-2 py-3"><span className="rounded-full bg-rose-100 px-2 py-0.5 text-xs font-medium text-rose-700 dark:bg-rose-500/15 dark:text-rose-300">{falseRate}%</span></td>
              </tr>
              <tr>
                <td className="px-2 py-3 text-zinc-700 dark:text-zinc-200"><span className="inline-flex items-center gap-1.5"><Send className="size-3.5 text-emerald-400" />WhatsApp</span></td>
                <td className="px-2 py-3 font-semibold text-zinc-900 dark:text-white">{whatsappCount}</td>
                <td className="px-2 py-3"><span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">{whatsappRate}%</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
