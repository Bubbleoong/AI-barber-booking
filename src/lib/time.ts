import { BookingError } from "@/lib/errors";

export const SHOP_TIME_ZONE = "Asia/Bangkok";

export function bangkokDate(instant: Date) {
  return new Date(instant.getTime() + 7 * 60 * 60 * 1000).toISOString().slice(0, 10);
}

export function bangkokMinute(instant: Date) {
  const local = new Date(instant.getTime() + 7 * 60 * 60 * 1000);
  return local.getUTCHours() * 60 + local.getUTCMinutes();
}

export function dayBounds(date: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new BookingError("INVALID_DATE", "วันที่ไม่ถูกต้อง");
  const start = new Date(`${date}T00:00:00+07:00`);
  if (Number.isNaN(start.getTime()) || bangkokDate(start) !== date)
    throw new BookingError("INVALID_DATE", "วันที่ไม่ถูกต้อง");
  return { start, end: new Date(start.getTime() + 24 * 60 * 60 * 1000) };
}

const WEEKDAYS = [
  "SUNDAY",
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
] as const;
export function bangkokWeekday(date: string) {
  return WEEKDAYS[new Date(`${date}T12:00:00+07:00`).getUTCDay()];
}
