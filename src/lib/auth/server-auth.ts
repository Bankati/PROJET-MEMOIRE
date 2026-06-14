/**
 * Helpers serveur pour récupérer la session utilisateur via Auth.js.
 */
import { redirect } from 'next/navigation'

import { auth } from '@/lib/auth'

type AuthRole = 'super_admin' | 'admin' | 'agent'
type ServerAuthUser = Readonly<{
  id: string
  email: string
  role: AuthRole
  fullName: string
  status: 'active' | 'inactive' | 'expired'
}>

export const getCurrentUser = async (): Promise<ServerAuthUser | null> => {
  const session = await auth()
  if (!session?.user) {
    return null
  }
  return {
    id: session.user.id,
    email: session.user.email ?? '',
    role: session.user.role,
    fullName: session.user.fullName,
    status: session.user.status,
  }
}

export const requireUser = async (): Promise<ServerAuthUser> => {
  const user: ServerAuthUser | null = await getCurrentUser()
  if (user === null) {
    redirect('/login')
  }
  return user
}

export const requireRole = async ({
  allowedRoles,
}: Readonly<{
  allowedRoles: readonly AuthRole[]
}>): Promise<ServerAuthUser> => {
  const user: ServerAuthUser = await requireUser()
  const canAccess: boolean = allowedRoles.includes(user.role)
  if (!canAccess) {
    redirect('/dashboard')
  }
  return user
}
