/**
 * Middleware Next.js pour la protection des routes avec Auth.js.
 * Utilise auth.config.ts qui est compatible avec Edge Runtime.
 */
import NextAuth from 'next-auth'
import { NextResponse } from 'next/server'

import { authConfig } from '@/lib/auth.config'

const { auth } = NextAuth(authConfig)

// Le middleware (Edge) n'a pas accès à la base de données : il ne peut donc pas
// savoir si l'utilisateur d'un JWT structurellement valide existe encore ou est
// toujours actif. Passé cet intervalle depuis la dernière vérification réelle
// (auth.ts, qui interroge la base), on délègue la question à /api/auth/validate-session
// (Node) avant de faire confiance à la session pour une route protégée.
const SESSION_REVALIDATE_INTERVAL_MS = 5 * 60 * 1000

export default auth(async (req) => {
  const { nextUrl, auth: session } = req
  const isLoggedIn = !!session?.user
  const pathname = nextUrl.pathname

  // Routes publiques
  const publicRoutes = ['/login', '/forgot-password', '/reset-password']
  const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route))
  const isAuthApiRoute = pathname.startsWith('/api/auth')

  // Permettre les routes API Auth.js et les routes publiques
  if (isAuthApiRoute) {
    return NextResponse.next()
  }

  // Rediriger vers login si non connecté et route protégée
  if (!isLoggedIn && !isPublicRoute && pathname !== '/') {
    return NextResponse.redirect(new URL('/login', nextUrl))
  }

  // Session structurellement valide mais jamais (re)vérifiée en base récemment —
  // ex. compte supprimé ou désactivé après la connexion — on tranche avant
  // d'accorder l'accès à une route protégée.
  if (isLoggedIn && pathname.startsWith('/dashboard')) {
    const validatedAt = session.user.validatedAt ?? 0
    if (Date.now() - validatedAt > SESSION_REVALIDATE_INTERVAL_MS) {
      const validateUrl = new URL('/api/auth/validate-session', nextUrl)
      const res = await fetch(validateUrl, {
        headers: { cookie: req.headers.get('cookie') ?? '' },
      })
      const { valid } = (await res.json()) as { valid: boolean }
      if (!valid) {
        return NextResponse.redirect(new URL('/api/auth/force-logout', nextUrl))
      }
    }
  }

  // Rediriger vers le bon dashboard selon le rôle quand connecté sur route publique ou "/"
  if (isLoggedIn && (isPublicRoute || pathname === '/')) {
    const role = session.user.role
    if (role === 'super_admin') {
      return NextResponse.redirect(new URL('/dashboard/super-admin', nextUrl))
    }
    if (role === 'admin') {
      return NextResponse.redirect(new URL('/dashboard/admin', nextUrl))
    }
    return NextResponse.redirect(new URL('/dashboard/agent', nextUrl))
  }

  // Vérification des rôles pour les routes dashboard
  if (isLoggedIn && pathname.startsWith('/dashboard')) {
    const role = session.user.role

    // Routes admin : bloquées pour les agents
    if (pathname.startsWith('/dashboard/admin') && role === 'agent') {
      return NextResponse.redirect(new URL('/dashboard/agent', nextUrl))
    }

    // Routes super-admin : bloquées pour admin et agent
    if (pathname.startsWith('/dashboard/super-admin') && role !== 'super_admin') {
      const fallback = role === 'admin' ? '/dashboard/admin' : '/dashboard/agent'
      return NextResponse.redirect(new URL(fallback, nextUrl))
    }

    // Routes agent : bloquées pour admin et super_admin
    if (pathname.startsWith('/dashboard/agent') && (role === 'admin' || role === 'super_admin')) {
      const fallback = role === 'super_admin' ? '/dashboard/super-admin' : '/dashboard/admin'
      return NextResponse.redirect(new URL(fallback, nextUrl))
    }
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    // Exclure assets statiques ET routes /api/ (elles font leur propre vérification auth)
    '/((?!_next/static|_next/image|favicon.ico|api/(?!auth).*|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
