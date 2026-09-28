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
export type BookingAvailability = { date: string; durationMinutes: number; slots: string[] };
