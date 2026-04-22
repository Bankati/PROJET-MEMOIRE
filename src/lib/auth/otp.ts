/**
 * Outils OTP pour le reset mot de passe.
 */
import { createHash, randomInt } from "node:crypto";

const OTP_LENGTH: number = 6;
const OTP_DURATION_MINUTES: number = 3;

const createOtpHash = ({
  code,
}: Readonly<{
  code: string;
}>): string => {
  return createHash("sha256").update(code).digest("hex");
};

export const createOtpCode = (): string => {
  const numberValue: number = randomInt(0, 10 ** OTP_LENGTH);
  return `${numberValue}`.padStart(OTP_LENGTH, "0");
};

export const hashOtpCode = ({
  code,
}: Readonly<{
  code: string;
}>): string => {
  return createOtpHash({ code });
};

export const isOtpCodeValid = ({
  code,
  hash,
}: Readonly<{
  code: string;
  hash: string;
}>): boolean => {
  return createOtpHash({ code }) === hash;
};

export const createOtpExpiration = (): Date => {
  const expiration: Date = new Date();
  expiration.setMinutes(expiration.getMinutes() + OTP_DURATION_MINUTES);
  return expiration;
};
