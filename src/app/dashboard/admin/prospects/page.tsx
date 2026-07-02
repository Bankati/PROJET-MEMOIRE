import { and, desc, eq } from 'drizzle-orm'
import { sql } from 'drizzle-orm'

import { requireRole } from '@/lib/auth/server-auth'
import { db } from '@/lib/db'
import { campaigns, users } from '@/db/schema'
import { ProspectsTable } from '@/components/admin/prospects-table'

export type ProspectRow = {
  contactId: string
  firstName: string | null
  lastName: string | null
  phonePrimary: string | null
  phoneSecondary: string | null
  email: string | null
  schoolName: string | null
  city: string | null
  ccId: string
  campaignId: string
  campaignTitle: string
  campaignYear: number | null
  source: string
  addedAt: string
  lastOutcome: string | null
  lastCallAt: string | null
  lastAgentName: string | null
}

export type CampaignOption = {
  id: string
  title: string
  year: number | null
  status: string
}

export type AgentOption = {
  id: string
  fullName: string
}

export default async function ProspectsPage(): Promise<React.JSX.Element> {
  const user = await requireRole({ allowedRoles: ['admin'] })

  const myCampaigns: CampaignOption[] = await db
    .select({
      id: campaigns.id,
      title: campaigns.title,
      year: campaigns.year,
      status: campaigns.status,
    })
    .from(campaigns)
    .where(eq(campaigns.createdByAdminId, user.id))
    .orderBy(desc(campaigns.createdAt))

  const myAgents: AgentOption[] = await db
    .select({ id: users.id, fullName: users.fullName })
    .from(users)
    .where(
      and(eq(users.managedByAdminId, user.id), eq(users.role, 'agent'), eq(users.status, 'active'))
    )
    .orderBy(users.fullName)

  let prospects: ProspectRow[] = []

  if (myCampaigns.length > 0) {
    const rawRows = await db.execute(sql`
      SELECT
        c.id                    AS "contactId",
        c.first_name            AS "firstName",
        c.last_name             AS "lastName",
        c.phone_primary         AS "phonePrimary",
        c.phone_secondary       AS "phoneSecondary",
        c.email,
        c.school_name           AS "schoolName",
        c.city,
        cc.id                   AS "ccId",
        cc.campaign_id          AS "campaignId",
        cam.title               AS "campaignTitle",
        cam.year                AS "campaignYear",
        cc.source,
        cc.created_at           AS "addedAt",
        cr.outcome              AS "lastOutcome",
        cr.created_at           AS "lastCallAt",
        u.full_name             AS "lastAgentName"
      FROM campaign_contacts cc
      INNER JOIN contacts c   ON c.id  = cc.contact_id
      INNER JOIN campaigns cam ON cam.id = cc.campaign_id
      LEFT JOIN LATERAL (
        SELECT outcome, created_at, agent_id
        FROM call_results
        WHERE contact_id  = c.id
          AND campaign_id = cc.campaign_id
        ORDER BY created_at DESC
        LIMIT 1
      ) cr ON true
      LEFT JOIN users u ON u.id = cr.agent_id
      WHERE cam.created_by_admin_id = ${user.id}
      ORDER BY COALESCE(cr.created_at, cc.created_at) DESC
      LIMIT 500
    `)
    // db.execute() with raw SQL returns untyped rows; type matches the SELECT columns above
    prospects = rawRows as unknown as ProspectRow[]
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Gestion des Prospects</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Historique complet de tous vos prospects — filtrez et transférez-les entre campagnes
        </p>
      </div>
      <ProspectsTable prospects={prospects} campaigns={myCampaigns} agents={myAgents} />
    </div>
  )
}
