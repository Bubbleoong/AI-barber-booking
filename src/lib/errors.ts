import type { BookingErrorCode } from "@/types/bookingDomain";

export class AppError extends Error {
  constructor(
    readonly code: string,
    message: string,
    readonly status = 400,
  ) {
    super(message);
  }
}

export class BookingError extends AppError {
  constructor(code: BookingErrorCode, message: string, status = 400) {
    super(code, message, status);
  }
}
