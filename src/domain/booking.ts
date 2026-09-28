export const SLOT_MINUTES = 30;
export const MAX_ADVANCE_DAYS = 30;
export const CANCELLATION_CUTOFF_MS = 60 * 60 * 1000;

export function dateIntersectsBookingWindow(start: Date, end: Date, now = new Date()) {
  return end > now && start.getTime() <= now.getTime() + MAX_ADVANCE_DAYS * 24 * 60 * 60 * 1000;
}

export function cancellationAllowed(startAt: Date, now = new Date()) {
  return startAt.getTime() - now.getTime() >= CANCELLATION_CUTOFF_MS;
}
