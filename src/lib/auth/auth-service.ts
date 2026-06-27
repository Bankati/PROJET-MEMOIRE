/**
 * Service d'authentification - Fonctions utilitaires.
 * L'authentification principale est gérée par Auth.js (voir src/lib/auth.ts).
 */
import { and, count, desc, eq, gt } from 'drizzle-orm'

import { db } from '@/lib/db'
import { createOtpCode, createOtpExpiration, hashOtpCode, isOtpCodeValid } from '@/lib/auth/otp'
import { hashPassword } from '@/lib/auth/password'
import { passwordResetOtps, users } from '@/db/schema'

export const findUserByEmail = async ({
  email,
}: Readonly<{
  email: string
}>): Promise<typeof users.$inferSelect | null> => {
  const normalizedEmail: string = email.trim().toLowerCase()
  const records: (typeof users.$inferSelect)[] = await db
    .select()
    .from(users)
    .where(eq(users.email, normalizedEmail))
    .limit(1)
  return records[0] ?? null
}

export const createInitialSuperAdmin = async ({
  email,
  fullName,
  password,
}: Readonly<{
  email: string
  fullName: string
  password: string
}>): Promise<boolean> => {
  const existingUsers: Array<{ count: number }> = await db
    .select({ count: count(users.id) })
    .from(users)
  const hasUsers: boolean = (existingUsers[0]?.count ?? 0) > 0
  if (hasUsers) {
    return false
  }
  const passwordHashValue: string = hashPassword({ password })
  await db.insert(users).values({
    email: email.trim().toLowerCase(),
    fullName: fullName.trim(),
    passwordHash: passwordHashValue,
    role: 'super_admin',
    status: 'active',
  })
  return true
}

export const createPasswordResetOtp = async ({
  userRecord,
}: Readonly<{
  userRecord: typeof users.$inferSelect
}>): Promise<string> => {
  const code: string = createOtpCode()
  const codeHash: string = hashOtpCode({ code })
  const expiresAt: Date = createOtpExpiration()
  await db.insert(passwordResetOtps).values({
    userId: userRecord.id,
    email: userRecord.email,
    codeHash,
    purpose: 'password_reset',
    status: 'pending',
    expiresAt,
  })
  return code
}

export const resetUserPasswordWithOtp = async ({
  email,
  code,
  newPassword,
}: Readonly<{
  email: string
  code: string
  newPassword: string
}>): Promise<boolean> => {
  const userRecord: typeof users.$inferSelect | null = await findUserByEmail({ email })
  if (userRecord === null) {
    return false
  }
  const otpRecords: (typeof passwordResetOtps.$inferSelect)[] = await db
    .select()
    .from(passwordResetOtps)
    .where(
      and(
        eq(passwordResetOtps.userId, userRecord.id),
        eq(passwordResetOtps.status, 'pending'),
        gt(passwordResetOtps.expiresAt, new Date())
      )
    )
    .orderBy(desc(passwordResetOtps.createdAt))
    .limit(1)
  const otpRecord: typeof passwordResetOtps.$inferSelect | undefined = otpRecords[0]
  if (!otpRecord) {
    return false
  }
  const isCodeValid: boolean = isOtpCodeValid({ code, hash: otpRecord.codeHash })
  if (!isCodeValid) {
    return false
  }
  const passwordHashValue: string = hashPassword({ password: newPassword })
  await db
    .update(users)
    .set({ passwordHash: passwordHashValue, updatedAt: new Date() })
    .where(eq(users.id, userRecord.id))
  await db
    .update(passwordResetOtps)
    .set({ status: 'used', consumedAt: new Date() })
    .where(eq(passwordResetOtps.id, otpRecord.id))
  return true
}
