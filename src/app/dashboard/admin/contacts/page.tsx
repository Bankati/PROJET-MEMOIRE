/**
 * Page contacts admin — tableau avec sélection multiple et attribution aux agents.
 * Permet l'ajout manuel ou l'import Excel/CSV de contacts.
 */
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { and, desc, eq, inArray, or, sql } from 'drizzle-orm'
import { X } from 'lucide-react'

import { requireRole } from '@/lib/auth/server-auth'
import { db } from '@/lib/db'
import { campaigns, campaignContacts, contacts, users, agentContactAssignments } from '@/db/schema'
import { ContactDialogForm } from '@/components/admin/contact-dialog-form'
import { ImportExcelDialog } from '@/components/admin/import-excel-dialog'
import { BulkAssignContacts } from '@/components/admin/bulk-assign-contacts'
import { ContactFilters } from '@/components/admin/contact-filters'

type SearchParams = Readonly<Record<string, string | string[] | undefined>>

const readParam = ({ sp, key }: Readonly<{ sp: SearchParams; key: string }>): string => {
  const raw: string | string[] | undefined = sp[key]
  if (typeof raw === 'string') return raw
  return Array.isArray(raw) ? (raw[0] ?? '') : ''
}

async function addContact(formData: FormData): Promise<void> {
  'use server'
  const user = await requireRole({ allowedRoles: ['admin'] })
  const firstName = String(formData.get('firstName') ?? '').trim()
  const lastName = String(formData.get('lastName') ?? '').trim()
  const phonePrimary = String(formData.get('phonePrimary') ?? '').trim()
  const phoneSecondary = String(formData.get('phoneSecondary') ?? '').trim()
  const email = String(formData.get('email') ?? '').trim()
  const schoolName = String(formData.get('schoolName') ?? '').trim()
  const desiredProgram = String(formData.get('desiredProgram') ?? '').trim()
  const city = String(formData.get('city') ?? '').trim()
  const campaignId = String(formData.get('campaignId') ?? '').trim()

  if (
    (firstName.length === 0 && lastName.length === 0) ||
    phonePrimary.length === 0 ||
    campaignId.length === 0
  ) {
    redirect('/dashboard/admin/contacts?notice=missing_fields')
  }

  /* Vérifier que la campagne est accessible : soit la campagne de cet admin, soit une campagne publique */
  const accessibleCampaign = await db
    .select({ id: campaigns.id })
    .from(campaigns)
    .where(
      and(
        eq(campaigns.id, campaignId),
        or(eq(campaigns.createdByAdminId, user.id), eq(campaigns.visibility, 'public'))
      )
    )
    .limit(1)

  if (accessibleCampaign.length === 0) {
    redirect('/dashboard/admin/contacts?notice=error')
  }

  const normalizePhone = (phone: string): string => phone.replace(/\s+/g, '').replace(/^00/, '+')
  const normalizedPrimary = normalizePhone(phonePrimary)
  const normalizedSecondary = phoneSecondary.length > 0 ? normalizePhone(phoneSecondary) : ''
  const displayName = firstName.length > 0 ? firstName : lastName

  try {
    const existing = await db
      .select({ id: contacts.id })
      .from(contacts)
      .where(eq(contacts.normalizedPhonePrimary, normalizedPrimary))
      .limit(1)

    let contactId: string
    if (existing.length > 0) {
      contactId = existing[0].id
    } else {
      const [newContact] = await db
        .insert(contacts)
        .values({
          firstName: firstName.length > 0 ? firstName : displayName,
          lastName: lastName.length > 0 ? lastName : null,
          email: email.length > 0 ? email : null,
          phonePrimary,
          phoneSecondary: phoneSecondary.length > 0 ? phoneSecondary : null,
          normalizedPhonePrimary: normalizedPrimary,
          normalizedPhoneSecondary: normalizedSecondary.length > 0 ? normalizedSecondary : null,
          schoolName: schoolName.length > 0 ? schoolName : null,
          desiredProgram: desiredProgram.length > 0 ? desiredProgram : null,
          city: city.length > 0 ? city : null,
        })
        .returning({ id: contacts.id })
      contactId = newContact.id
    }

    await db
      .insert(campaignContacts)
      .values({
        campaignId,
        contactId,
        source: 'manual_form',
        importedByAdminId: user.id,
      })
      .onConflictDoNothing()
  } catch {
    redirect('/dashboard/admin/contacts?notice=error')
  }
  redirect('/dashboard/admin/contacts?notice=created')
}

async function bulkAssignAction(formData: FormData): Promise<void> {
  'use server'
  const user = await requireRole({ allowedRoles: ['admin'] })
  const contactIds = String(formData.get('contactIds') ?? '').trim()
  const agentId = String(formData.get('agentId') ?? '').trim()

  if (contactIds.length === 0 || agentId.length === 0) {
    redirect('/dashboard/admin/contacts?notice=missing_fields')
  }

  const ids = contactIds.split(',').filter(Boolean)
  if (ids.length === 0) {
    redirect('/dashboard/admin/contacts?notice=missing_fields')
  }

  /*
   * Vérifier que l'agent cible appartient à cet admin
   * (ou que l'admin s'assigne les contacts à lui-même).
   */
  const isAdminItself = agentId === user.id
  if (!isAdminItself) {
    const ownedAgent = await db
      .select({ id: users.id })
      .from(users)
      .where(
        and(eq(users.id, agentId), eq(users.managedByAdminId, user.id), eq(users.role, 'agent'))
      )
      .limit(1)

    if (ownedAgent.length === 0) {
      redirect('/dashboard/admin/contacts?notice=error')
    }
  }

  /*
   * Vérifier que tous les ccIds sélectionnés appartiennent
   * à des campagnes accessibles : campagnes de cet admin OU campagnes publiques.
   */
  const accessibleCampaignIds = (
    await db
      .select({ id: campaigns.id })
      .from(campaigns)
      .where(or(eq(campaigns.createdByAdminId, user.id), eq(campaigns.visibility, 'public')))
  ).map((c) => c.id)

  if (accessibleCampaignIds.length === 0) {
    redirect('/dashboard/admin/contacts?notice=error')
  }

  const validCcs = await db
    .select({ id: campaignContacts.id })
    .from(campaignContacts)
    .where(
      and(
        inArray(campaignContacts.id, ids),
        inArray(campaignContacts.campaignId, accessibleCampaignIds)
      )
    )

  const validIds = validCcs.map((cc) => cc.id)
  if (validIds.length === 0) {
    redirect('/dashboard/admin/contacts?notice=missing_fields')
  }

  try {
    await db
      .insert(agentContactAssignments)
      .values(
        validIds.map((ccId) => ({
          campaignContactId: ccId,
          agentId,
          assignedByAdminId: user.id,
        }))
      )
      .onConflictDoNothing()
  } catch {
    redirect('/dashboard/admin/contacts?notice=error')
  }
  redirect('/dashboard/admin/contacts?notice=assigned')
}

export default async function AdminContactsPage({
  searchParams,
}: Readonly<{ searchParams?: Promise<SearchParams> }>): Promise<React.JSX.Element> {
  const user = await requireRole({ allowedRoles: ['admin'] })
  const sp: SearchParams = (await searchParams) ?? {}
  const schoolFilter = readParam({ sp, key: 'school' })
  const campaignFilter = readParam({ sp, key: 'campaign' })

  /* Campagnes accessibles : les propres campagnes de l'admin + les campagnes publiques des autres */
  const myCampaigns = await db
    .select({ id: campaigns.id, title: campaigns.title })
    .from(campaigns)
    .where(or(eq(campaigns.createdByAdminId, user.id), eq(campaigns.visibility, 'public')))
    .orderBy(desc(campaigns.createdAt))
  const myCampaignIds = myCampaigns.map((c) => c.id)

  const myAgents = await db
    .select({ id: users.id, fullName: users.fullName })
    .from(users)
    .where(
      and(eq(users.managedByAdminId, user.id), eq(users.role, 'agent'), eq(users.status, 'active'))
    )
    .orderBy(users.fullName)

  const schoolOptions =
    myCampaignIds.length > 0
      ? await db
          .selectDistinct({ schoolName: contacts.schoolName })
          .from(contacts)
          .innerJoin(campaignContacts, eq(campaignContacts.contactId, contacts.id))
          .where(
            and(
              inArray(campaignContacts.campaignId, myCampaignIds),
              sql`${contacts.schoolName} is not null`
            )
          )
          .orderBy(contacts.schoolName)
      : []

  const contactConditions: ReturnType<typeof and>[] = []
  if (campaignFilter.length > 0) {
    contactConditions.push(eq(campaignContacts.campaignId, campaignFilter))
  } else if (myCampaignIds.length > 0) {
    contactConditions.push(inArray(campaignContacts.campaignId, myCampaignIds))
  }
  if (schoolFilter.length > 0) {
    contactConditions.push(eq(contacts.schoolName, schoolFilter))
  }

  const contactsList =
    myCampaignIds.length > 0
      ? await db
          .select({
            ccId: campaignContacts.id,
            firstName: contacts.firstName,
            lastName: contacts.lastName,
            phonePrimary: contacts.phonePrimary,
            phoneSecondary: contacts.phoneSecondary,
            email: contacts.email,
            schoolName: contacts.schoolName,
            isAssigned: sql<boolean>`${agentContactAssignments.id} is not null`,
            assignedTo: users.fullName,
          })
          .from(campaignContacts)
          .innerJoin(contacts, eq(campaignContacts.contactId, contacts.id))
          .leftJoin(
            agentContactAssignments,
            eq(agentContactAssignments.campaignContactId, campaignContacts.id)
          )
          .leftJoin(users, eq(users.id, agentContactAssignments.agentId))
          .where(contactConditions.length > 0 ? and(...contactConditions) : undefined)
          .orderBy(desc(campaignContacts.createdAt))
          .limit(200)
      : []

  const notice = readParam({ sp, key: 'notice' })
  const noticeMessages: Readonly<Record<string, { text: string; type: 'success' | 'error' }>> = {
    created: { text: 'Contact ajouté avec succès.', type: 'success' },
    assigned: { text: 'Contact(s) attribué(s) avec succès.', type: 'success' },
    missing_fields: { text: 'Veuillez remplir tous les champs obligatoires.', type: 'error' },
    error: { text: 'Une erreur est survenue.', type: 'error' },
  }
  const currentNotice = notice.length > 0 ? noticeMessages[notice] : undefined

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-zinc-900 sm:text-2xl dark:text-white">Contacts</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Consultez et attribuez vos prospects
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <ContactDialogForm campaigns={myCampaigns} addAction={addContact} />
          <ImportExcelDialog campaigns={myCampaigns} />
        </div>
      </div>

      {currentNotice ? (
        <div
          className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm ${
            currentNotice.type === 'success'
              ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300'
              : 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300'
          }`}
        >
          {currentNotice.text}
          <Link href="/dashboard/admin/contacts" className="ml-auto">
            <X className="size-4" />
          </Link>
        </div>
      ) : null}

      {/* Filters */}
      <ContactFilters
        campaigns={myCampaigns}
        schoolOptions={schoolOptions.flatMap((s) => (s.schoolName ? [s.schoolName] : []))}
        currentCampaign={campaignFilter}
        currentSchool={schoolFilter}
      />

      {/* Contacts table with bulk assignment */}
      <BulkAssignContacts
        contacts={contactsList.map((c) => ({
          ccId: c.ccId,
          firstName: c.firstName,
          lastName: c.lastName,
          phonePrimary: c.phonePrimary,
          phoneSecondary: c.phoneSecondary,
          email: c.email,
          schoolName: c.schoolName,
          isAssigned: Boolean(c.isAssigned),
          assignedTo: c.assignedTo ?? null,
        }))}
        agents={myAgents}
        adminId={user.id}
        adminName={user.fullName}
        bulkAssignAction={bulkAssignAction}
      />
    </div>
  )
}
