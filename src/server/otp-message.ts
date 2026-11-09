import type { APIError } from "better-auth/api";

/**
 * What to tell someone whose sign-in code was refused, from Better Auth's email-OTP errors
 * ("OTP expired", "Too many attempts", "Invalid OTP"). Shared by the website and the console.
 */
export function otpMessage(e: APIError): string {
  const msg = String(e.body?.message ?? e.message);
  if (/attempt/i.test(msg)) return "Too many wrong tries. Request a new code.";
  if (/expire/i.test(msg)) return "That code has expired. Request a new one.";
  return "That code isn't right. Check the email and try again.";
}
