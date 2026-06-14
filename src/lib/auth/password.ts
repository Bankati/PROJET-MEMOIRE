/**
 * Utilitaires de hashage mot de passe (Node.js scrypt).
 */
import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto'

const SCRYPT_KEY_LENGTH: number = 64
const SALT_LENGTH: number = 16

const toHex = ({ input }: Readonly<{ input: Buffer }>): string => {
  return input.toString('hex')
}
const fromHex = ({ input }: Readonly<{ input: string }>): Buffer => {
  return Buffer.from(input, 'hex')
}
const createPasswordHash = ({
  password,
  saltHex,
}: Readonly<{
  password: string
  saltHex: string
}>): string => {
  const key: Buffer = scryptSync(password, saltHex, SCRYPT_KEY_LENGTH)
  return toHex({ input: key })
}

export const hashPassword = ({
  password,
}: Readonly<{
  password: string
}>): string => {
  const saltHex: string = toHex({ input: randomBytes(SALT_LENGTH) })
  const hashHex: string = createPasswordHash({ password, saltHex })
  return `${saltHex}:${hashHex}`
}

export const verifyPassword = ({
  password,
  storedHash,
}: Readonly<{
  password: string
  storedHash: string
}>): boolean => {
  const parts: string[] = storedHash.split(':')
  if (parts.length !== 2) {
    return false
  }
  const saltHex: string = parts[0]
  const expectedHashHex: string = parts[1]
  const actualHashHex: string = createPasswordHash({ password, saltHex })
  const expectedHash: Buffer = fromHex({ input: expectedHashHex })
  const actualHash: Buffer = fromHex({ input: actualHashHex })
  if (expectedHash.length !== actualHash.length) {
    return false
  }
  return timingSafeEqual(expectedHash, actualHash)
}

export const runtime = 'nodejs'
