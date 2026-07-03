/**
 * Règle d'accès aux campagnes partagée par toutes les pages/routes admin :
 * un admin voit ses propres campagnes, plus les campagnes publiques des autres admins.
 * Centralisée ici pour éviter que la règle diverge si elle évolue (ex: nouveau rôle
 * partagé, nouveau critère de visibilité).
 */
import { eq, or, type SQL } from 'drizzle-orm'

import { campaigns } from '@/db/schema'

export const campaignAccessCondition = ({
  adminId,
}: Readonly<{ adminId: string }>): SQL | undefined =>
  or(eq(campaigns.createdByAdminId, adminId), eq(campaigns.visibility, 'public'))
