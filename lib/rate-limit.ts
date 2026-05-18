import type { NextRequest } from "next/server";

const rateLimitMap = new Map<string, { tokens: number; lastReset: number }>();

const DEFAULT_LIMIT = 10;
const WINDOW_MS = 60000;

export function getClientIP(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}

export function checkRateLimit(ip: string, limit = DEFAULT_LIMIT): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (!record || now - record.lastReset > WINDOW_MS) {
    rateLimitMap.set(ip, { tokens: limit, lastReset: now });
    return true;
  }

  if (record.tokens <= 0) return false;
  record.tokens--;
  rateLimitMap.set(ip, record);
  return true;
}

export function cleanupRateLimitMap(): void {
  const now = Date.now();
  for (const [ip, record] of rateLimitMap.entries()) {
    if (now - record.lastReset > WINDOW_MS * 2) {
      rateLimitMap.delete(ip);
    }
  }
}

if (typeof setInterval !== "undefined") {
  setInterval(cleanupRateLimitMap, WINDOW_MS);
}