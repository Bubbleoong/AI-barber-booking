import { MAX_ADVANCE_DAYS, SLOT_MINUTES } from "@/domain/booking";
import type { BookingCustomer } from "@/types/bookingDomain";
import { BookingError } from "@/lib/errors";

export function parseServiceIds(value: unknown): number[] {
  if (
    !Array.isArray(value) ||
    value.length === 0 ||
    value.length > 20 ||
    !value.every((id) => Number.isSafeInteger(id) && id > 0) ||
    new Set(value).size !== value.length
  ) {
    throw new BookingError("INVALID_SERVICES", "กรุณาเลือกบริการที่ถูกต้อง");
  }
  return value as number[];
}

export function parseCustomer(value: unknown): BookingCustomer {
  if (!value || typeof value !== "object")
    throw new BookingError("INVALID_CUSTOMER", "กรุณากรอกชื่อและเบอร์โทร");
  const input = value as Record<string, unknown>;
  const customerName =
    typeof input.customerName === "string" ? input.customerName.trim().normalize("NFC") : "";
  const phone = typeof input.phone === "string" ? input.phone.trim() : "";
  if (
    customerName.length < 2 ||
    customerName.length > 100 ||
    !/^\p{L}[\p{L}\p{M} ]*\p{L}[\p{M}]*$/u.test(customerName) ||
    / {2,}/.test(customerName)
  ) {
    throw new BookingError(
      "INVALID_NAME",
      "ชื่อใช้ตัวอักษรภาษาไทยหรืออังกฤษและช่องว่างเท่านั้น (2–100 ตัวอักษร)",
    );
  }
  if (!/^0[689]\d{8}$/.test(phone)) {
    throw new BookingError(
      "INVALID_PHONE",
      "กรุณากรอกเบอร์มือถือไทย 10 หลักที่ขึ้นต้นด้วย 06, 08 หรือ 09",
    );
  }
  return { customerName, phone };
}

export function parseStartAt(value: unknown, now = new Date()) {
  if (
    typeof value !== "string" ||
    !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?(?:Z|[+-]\d{2}:\d{2})$/.test(value)
  ) {
    throw new BookingError("INVALID_START", "กรุณาระบุเวลาเริ่มพร้อมเขตเวลา");
  }
  const startAt = new Date(value);
  if (Number.isNaN(startAt.getTime()))
    throw new BookingError("INVALID_START", "เวลาเริ่มไม่ถูกต้อง");
  const bangkok = new Date(startAt.getTime() + 7 * 60 * 60 * 1000);
  if (
    bangkok.getUTCMinutes() % SLOT_MINUTES !== 0 ||
    bangkok.getUTCSeconds() !== 0 ||
    bangkok.getUTCMilliseconds() !== 0
  ) {
    throw new BookingError("INVALID_SLOT", "เวลาเริ่มต้องอยู่ในรอบทุก 30 นาที");
  }
  if (
    startAt.getTime() <= now.getTime() ||
    startAt.getTime() > now.getTime() + MAX_ADVANCE_DAYS * 24 * 60 * 60 * 1000
  ) {
    throw new BookingError(
      "OUTSIDE_BOOKING_WINDOW",
      "จองได้ตั้งแต่เวลาปัจจุบันจนถึง 30 วันล่วงหน้า",
    );
  }
  return startAt;
}
