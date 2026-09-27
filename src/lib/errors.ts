import type { BookingErrorCode } from "@/domain/booking";

export class BookingError extends Error {
  constructor(readonly code: BookingErrorCode, message: string, readonly status = 400) {
    super(message);
  }
}
