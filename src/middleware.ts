/**
 * Middleware Next.js pour la protection des routes avec Auth.js.
 * Utilise auth.config.ts qui est compatible avec Edge Runtime.
 */
import NextAuth from "next-auth";
import { NextResponse } from "next/server";

import { authConfig } from "@/lib/auth.config";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { nextUrl, auth: session } = req;
  const isLoggedIn = !!session?.user;
  const pathname = nextUrl.pathname;

  // Routes publiques
  const publicRoutes = ["/login", "/forgot-password", "/reset-password"];
  const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route));
  const isAuthApiRoute = pathname.startsWith("/api/auth");

  // Permettre les routes API Auth.js et les routes publiques
  if (isAuthApiRoute) {
    return NextResponse.next();
  }

  // Rediriger vers login si non connecté et route protégée
  if (!isLoggedIn && !isPublicRoute && pathname !== "/") {
    return NextResponse.redirect(new URL("/login", nextUrl));
  }

  // Rediriger vers le bon dashboard selon le rôle quand connecté sur route publique ou "/"
  if (isLoggedIn && (isPublicRoute || pathname === "/")) {
    const role = session.user.role;
    if (role === "super_admin") {
      return NextResponse.redirect(new URL("/dashboard/super-admin", nextUrl));
    }
    if (role === "admin") {
      return NextResponse.redirect(new URL("/dashboard/admin", nextUrl));
    }
    return NextResponse.redirect(new URL("/dashboard/agent", nextUrl));
  }

  // Vérification des rôles pour les routes dashboard
  if (isLoggedIn && pathname.startsWith("/dashboard")) {
    const role = session.user.role;

    // Routes admin : bloquées pour les agents
    if (pathname.startsWith("/dashboard/admin") && role === "agent") {
      return NextResponse.redirect(new URL("/dashboard/agent", nextUrl));
    }

    // Routes super-admin : bloquées pour admin et agent
    if (pathname.startsWith("/dashboard/super-admin") && role !== "super_admin") {
      const fallback = role === "admin" ? "/dashboard/admin" : "/dashboard/agent";
      return NextResponse.redirect(new URL(fallback, nextUrl));
    }

    // Routes agent : bloquées pour admin et super_admin
    if (pathname.startsWith("/dashboard/agent") && (role === "admin" || role === "super_admin")) {
      const fallback = role === "super_admin" ? "/dashboard/super-admin" : "/dashboard/admin";
      return NextResponse.redirect(new URL(fallback, nextUrl));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    // Protéger toutes les routes sauf les assets statiques
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
