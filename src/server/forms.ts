import { z } from "zod";

/** FormData helpers shared by server actions. */

export function str(fd: FormData, key: string): string {
  const v = fd.get(key);
  return typeof v === "string" ? v.trim() : "";
}

export function optStr(fd: FormData, key: string): string | null {
  const v = str(fd, key);
  return v === "" ? null : v;
}

export function int(fd: FormData, key: string): number | null {
  const v = str(fd, key).replace(/[,\s₦]/g, "");
  if (v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? Math.round(n) : null;
}

export function bool(fd: FormData, key: string): boolean {
  const v = fd.get(key);
  return v === "on" || v === "true" || v === "1";
}

export function list(fd: FormData, key: string): string[] {
  return fd
    .getAll(key)
    .flatMap((v) => (typeof v === "string" ? v.split(/[,\n]/) : []))
    .map((s) => s.trim())
    .filter(Boolean)
    .filter((s, i, arr) => arr.findIndex((x) => x.toLowerCase() === s.toLowerCase()) === i);
}

export function date(fd: FormData, key: string): Date | null {
  const v = str(fd, key);
  if (!v) return null;
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function fieldErrors(error: z.ZodError): Record<string, string[]> {
  const out: Record<string, string[]> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    (out[key] ??= []).push(issue.message);
  }
  return out;
}

export const zEmail = z.string().trim().toLowerCase().email("Enter a valid email address");
export const zPhone = z
  .string()
  .trim()
  .regex(/^[+\d][\d\s-]{6,}$/, "Enter a valid phone number")
  .or(z.literal(""));
export const zRequired = (label: string) => z.string().trim().min(1, `${label} is required`);
