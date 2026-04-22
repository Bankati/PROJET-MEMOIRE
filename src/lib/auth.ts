/**
 * Configuration Auth.js (NextAuth v5) pour LBS Call Center.
 * Utilise le Credentials Provider avec vérification en base de données.
 * 
 * Note: Ce fichier utilise des modules Node.js et ne peut pas être importé
 * dans le middleware Edge. Utilisez auth.config.ts pour le middleware.
 */
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { count, eq } from "drizzle-orm";

import { authConfig } from "@/lib/auth.config";
import { db } from "@/lib/db";
import { users } from "@/db/schema";
import { hashPassword, verifyPassword } from "@/lib/auth/password";

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Mot de passe", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const email = (credentials.email as string).trim().toLowerCase();
        const password = credentials.password as string;

        // Vérifier si c'est le premier utilisateur (base vide)
        const userCount = await db
          .select({ count: count(users.id) })
          .from(users);
        const isFirstUser = (userCount[0]?.count ?? 0) === 0;

        // Si c'est le premier utilisateur, le créer comme super_admin
        if (isFirstUser) {
          const passwordHash = hashPassword({ password });
          const fullName = email.split("@")[0] ?? "Super Admin";
          
          const [newUser] = await db
            .insert(users)
            .values({
              email,
              fullName: fullName.charAt(0).toUpperCase() + fullName.slice(1),
              passwordHash,
              role: "super_admin",
              status: "active",
            })
            .returning();

          if (newUser) {
            return {
              id: newUser.id,
              email: newUser.email,
              role: newUser.role,
              status: newUser.status,
              fullName: newUser.fullName,
            };
          }
          return null;
        }

        // Recherche de l'utilisateur existant
        const userRecords = await db
          .select()
          .from(users)
          .where(eq(users.email, email))
          .limit(1);

        const user = userRecords[0];
        if (!user) {
          return null;
        }

        // Vérification du statut
        if (user.status !== "active") {
          return null;
        }

        // Vérification du mot de passe
        const isValidPassword = verifyPassword({
          password,
          storedHash: user.passwordHash,
        });

        if (!isValidPassword) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          role: user.role,
          status: user.status,
          fullName: user.fullName,
        };
      },
    }),
  ],
});
