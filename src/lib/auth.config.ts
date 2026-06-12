/**
 * Configuration Auth.js partagée (compatible Edge Runtime).
 * Ce fichier ne doit PAS importer de modules Node.js natifs.
 */
import type { NextAuthConfig } from 'next-auth'

type UserRole = 'super_admin' | 'admin' | 'agent'
type UserStatus = 'active' | 'inactive' | 'expired'

declare module 'next-auth' {
  interface User {
    role: UserRole
    status: UserStatus
    fullName: string
  }
  interface Session {
    user: {
      id: string
      email: string
      role: UserRole
      status: UserStatus
      fullName: string
    }
  }
}

declare module '@auth/core/jwt' {
  interface JWT {
    id: string
    role: UserRole
    status: UserStatus
    fullName: string
  }
}

export const authConfig: NextAuthConfig = {
  providers: [], // Les providers sont ajoutés dans auth.ts
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const pathname = nextUrl.pathname

      // Routes publiques
      const publicRoutes = ['/login', '/forgot-password', '/reset-password']
      const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route))
      const isAuthApiRoute = pathname.startsWith('/api/auth')

      // Permettre les routes API Auth.js
      if (isAuthApiRoute) {
        return true
      }

      // Rediriger vers login si non connecté et route protégée
      if (!isLoggedIn && !isPublicRoute && pathname !== '/') {
        return false // Redirige vers signIn page
      }

      // Permettre l'accès
      return true
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id as string
        token.role = user.role
        token.status = user.status
        token.fullName = user.fullName
      }
      return token
    },
    async session({ session, token }) {
      session.user.id = token.id
      session.user.role = token.role
      session.user.status = token.status
      session.user.fullName = token.fullName
      return session
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 10 * 60 * 60, // 10 heures
  },
  trustHost: true,
}
