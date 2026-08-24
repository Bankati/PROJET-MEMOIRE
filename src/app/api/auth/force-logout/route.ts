import { signOut } from '@/lib/auth'

export const runtime = 'nodejs'

// Appelé par le middleware quand une session JWT structurellement valide ne
// correspond plus à un utilisateur actif en base (compte supprimé ou désactivé
// après connexion) — nettoie le cookie de session puis redirige vers /login.
// signOut() ne peut nettoyer les cookies que depuis un Route Handler ou une
// Server Action, jamais depuis un Server Component ni l'Edge Runtime.
export const GET = async () => {
  await signOut({ redirectTo: '/login' })
}
