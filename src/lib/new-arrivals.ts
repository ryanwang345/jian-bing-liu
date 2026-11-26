/**
 * Pure helpers shared by server and client for the "new dish" launch flag.
 */

const DAY_MS = 24 * 60 * 60 * 1000;

/** Returns true while a dish flagged at `newSince` is still within its launch window. */
export function isNewArrivalActive(
  newSince: string | undefined | null,
  autoExpireDays: number,
  now: number = Date.now()
): boolean {
  if (!newSince) return false;
  if (!autoExpireDays || autoExpireDays <= 0) return true;
  const since = Date.parse(newSince);
  if (!Number.isFinite(since)) return true;
  return now - since < autoExpireDays * DAY_MS;
}

/** Days remaining before the "new" badge auto-expires (null = never expires). */
export function newArrivalDaysLeft(
  newSince: string | undefined | null,
  autoExpireDays: number,
  now: number = Date.now()
): number | null {
  if (!newSince || !autoExpireDays || autoExpireDays <= 0) return null;
  const since = Date.parse(newSince);
  if (!Number.isFinite(since)) return null;
  return Math.max(0, Math.ceil((since + autoExpireDays * DAY_MS - now) / DAY_MS));
}

/** Lightweight summary passed to the storefront banner. */
export interface NewArrivalSummary {
  id: string;
  categoryId: string;
  name: { en: string; zh: string };
  image?: string;
  price: string | null;
  isAvailable: boolean;
  newSince: string;
}
