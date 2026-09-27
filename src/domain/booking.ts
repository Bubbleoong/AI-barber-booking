export const SLOT_MINUTES = 30;
export const MAX_ADVANCE_DAYS = 30;
export const CANCELLATION_CUTOFF_MS = 60 * 60 * 1000;

export type BookingErrorCode =
  | "INVALID_SERVICES"
  | "INVALID_CUSTOMER"
  | "INVALID_NAME"
  | "INVALID_PHONE"
  | "INVALID_START"
  | "INVALID_SLOT"
  | "OUTSIDE_BOOKING_WINDOW"
  | "INVALID_DATE"
  | "UNAUTHORIZED"
  | "INVALID_INPUT"
  | "SLOT_UNAVAILABLE"
  | "NOT_FOUND"
  | "NOT_CANCELLABLE"
  | "CONTACT_SHOP";

export type BookingCustomer = { customerName: string; phone: string };
export type BookingAvailability = {
  date: string;
  durationMinutes: number;
  slots: string[];
};

export function dateIntersectsBookingWindow(
  start: Date,
  end: Date,
  now = new Date(),
) {
  return (
    end > now &&
    start.getTime() <= now.getTime() + MAX_ADVANCE_DAYS * 24 * 60 * 60 * 1000
  );
}

export function cancellationAllowed(startAt: Date, now = new Date()) {
  return startAt.getTime() - now.getTime() >= CANCELLATION_CUTOFF_MS;
}
