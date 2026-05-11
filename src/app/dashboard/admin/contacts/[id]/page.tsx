import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Building2,
  Calendar,
  Mail,
  MapPin,
  MessageCircle,
  Megaphone,
  Phone,
  User,
} from "lucide-react";
import { and, eq } from "drizzle-orm";

import { requireRole } from "@/lib/auth/server-auth";
import { db } from "@/lib/db";
import { campaigns, campaignContacts, contacts } from "@/db/schema";
import { PhoneDialer } from "@/components/agent/phone-dialer";
import { CallCenterTabs } from "@/components/agent/call-center-tabs";

type PageProps = Readonly<{ params: Promise<{ id: string }> }>;

export default async function AdminContactDetailPage({ params }: PageProps): Promise<React.JSX.Element> {
  const user = await requireRole({ allowedRoles: ["admin"] });
  const { id } = await params;

  const result = await db
    .select({
      ccId: campaignContacts.id,
      contactId: contacts.id,
      firstName: contacts.firstName,
      lastName: contacts.lastName,
      phonePrimary: contacts.phonePrimary,
      phoneSecondary: contacts.phoneSecondary,
      email: contacts.email,
      schoolName: contacts.schoolName,
      city: contacts.city,
      createdAt: campaignContacts.createdAt,
      campaignId: campaigns.id,
      campaignTitle: campaigns.title,
      campaignScript: campaigns.baseScript,
      campaignDetails: campaigns.details,
      pdfUrl: campaigns.pdfUrl,
    })
    .from(campaignContacts)
    .innerJoin(contacts, eq(campaignContacts.contactId, contacts.id))
    .innerJoin(campaigns, eq(campaignContacts.campaignId, campaigns.id))
    .where(and(
      eq(campaignContacts.id, id),
      eq(campaigns.createdByAdminId, user.id),
    ))
    .limit(1);

  if (result.length === 0) notFound();

  const contact = result[0];
  const contactName = `${contact.firstName} ${contact.lastName ?? ""}`.trim();

  const dynamicScript = contact.campaignScript
    .replace(/\{prénom\}/gi, contact.firstName)
    .replace(/\{nom\}/gi, contact.lastName ?? "")
    .replace(/\{école\}/gi, contact.schoolName ?? "votre établissement")
    .replace(/\{ville\}/gi, contact.city ?? "votre ville");

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/admin/contacts"
            className="grid size-9 place-items-center rounded-xl border border-zinc-200 text-zinc-600 transition hover:bg-zinc-50 dark:border-white/15 dark:text-zinc-300 dark:hover:bg-white/10"
          >
            <ArrowLeft className="size-4" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-zinc-900 dark:text-white">{contactName}</h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">{contact.campaignTitle}</p>
          </div>
        </div>
        <a
          href={`https://wa.me/${contact.phonePrimary.replace(/\s+/g, "").replace(/^\+/, "")}`}
          target="_blank" rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-sm font-medium text-emerald-700 transition hover:bg-emerald-100 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300"
        >
          <MessageCircle className="size-4" /> WhatsApp
        </a>
      </div>

      {/* 3-panel layout */}
      <div className="grid gap-4 lg:grid-cols-4">

        {/* LEFT PANEL — campaign + prospect info */}
        <div className="space-y-4 lg:col-span-1">
          <div className="rounded-2xl border border-zinc-200/70 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-[#1a2332]">
            <div className="mb-3 flex items-center gap-2">
              <Megaphone className="size-4 text-lbs-blue dark:text-blue-400" />
              <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Campagne</p>
            </div>
            <p className="font-semibold text-zinc-800 dark:text-white">{contact.campaignTitle}</p>
            {contact.campaignDetails ? (
              <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400 line-clamp-3">{contact.campaignDetails}</p>
            ) : null}
          </div>

          <div className="rounded-2xl border border-zinc-200/70 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-[#1a2332]">
            <div className="mb-3 flex items-center gap-2">
              <User className="size-4 text-blue-400" />
              <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Prospect</p>
            </div>
            <div className="space-y-2.5">
              <div className="flex items-start gap-2.5">
                <User className="mt-0.5 size-4 shrink-0 text-zinc-400" />
                <div>
                  <p className="text-[10px] text-zinc-400">Nom</p>
                  <p className="text-sm font-medium text-zinc-800 dark:text-white">{contactName}</p>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <Phone className="mt-0.5 size-4 shrink-0 text-zinc-400" />
                <div>
                  <p className="text-[10px] text-zinc-400">Tél. principal</p>
                  <p className="text-sm font-medium text-zinc-800 dark:text-white">{contact.phonePrimary}</p>
                  {contact.phoneSecondary ? <p className="text-xs text-zinc-500">{contact.phoneSecondary}</p> : null}
                </div>
              </div>
              {contact.email ? (
                <div className="flex items-start gap-2.5">
                  <Mail className="mt-0.5 size-4 shrink-0 text-zinc-400" />
                  <div>
                    <p className="text-[10px] text-zinc-400">Email</p>
                    <p className="text-sm font-medium text-zinc-800 dark:text-white break-all">{contact.email}</p>
                  </div>
                </div>
              ) : null}
              {contact.schoolName ? (
                <div className="flex items-start gap-2.5">
                  <Building2 className="mt-0.5 size-4 shrink-0 text-zinc-400" />
                  <div>
                    <p className="text-[10px] text-zinc-400">École</p>
                    <p className="text-sm font-medium text-zinc-800 dark:text-white">{contact.schoolName}</p>
                  </div>
                </div>
              ) : null}
              {contact.city ? (
                <div className="flex items-start gap-2.5">
                  <MapPin className="mt-0.5 size-4 shrink-0 text-zinc-400" />
                  <div>
                    <p className="text-[10px] text-zinc-400">Ville</p>
                    <p className="text-sm font-medium text-zinc-800 dark:text-white">{contact.city}</p>
                  </div>
                </div>
              ) : null}
              <div className="flex items-start gap-2.5">
                <Calendar className="mt-0.5 size-4 shrink-0 text-zinc-400" />
                <div>
                  <p className="text-[10px] text-zinc-400">Ajouté le</p>
                  <p className="text-sm font-medium text-zinc-800 dark:text-white">
                    {contact.createdAt.toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CENTER PANEL — Script | IA | Docs tabs */}
        <div className="lg:col-span-2">
          <CallCenterTabs
            script={dynamicScript}
            contactName={contactName}
            schoolName={contact.schoolName}
            campaignTitle={contact.campaignTitle}
            baseScript={contact.campaignScript}
            pdfUrl={contact.pdfUrl}
          />
        </div>

        {/* RIGHT PANEL — Dialer */}
        <div className="lg:col-span-1">
          <PhoneDialer
            phonePrimary={contact.phonePrimary}
            phoneSecondary={contact.phoneSecondary}
            contactName={contactName}
          />
        </div>
      </div>
    </div>
  );
}
