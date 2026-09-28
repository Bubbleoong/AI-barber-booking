import { AppError } from "@/lib/errors";

function record(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value))
    throw new AppError("INVALID_INPUT", "ข้อมูลไม่ถูกต้อง", 400);
  return value as Record<string, unknown>;
}

function integer(value: unknown, min: number, max: number, label: string) {
  if (!Number.isInteger(value) || (value as number) < min || (value as number) > max)
    throw new AppError("INVALID_INPUT", `${label}ไม่ถูกต้อง`, 400);
  return value as number;
}

export function parseAdminService(value: unknown) {
  const body = record(value);
  const name = typeof body.name === "string" ? body.name.trim() : "";
  if (name.length < 2 || name.length > 100)
    throw new AppError("INVALID_INPUT", "ชื่อบริการต้องมี 2–100 ตัวอักษร", 400);
  if (typeof body.isActive !== "boolean")
    throw new AppError("INVALID_INPUT", "สถานะบริการไม่ถูกต้อง", 400);
  return {
    name,
    priceBaht: integer(body.priceBaht, 0, 100000, "ราคา"),
    durationMinutes: integer(body.durationMinutes, 1, 480, "ระยะเวลา"),
    isActive: body.isActive,
  };
}

const DAYS = [
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY",
] as const;
export function parseShopHours(value: unknown) {
  const body = record(value);
  if (
    typeof body.day !== "string" ||
    !DAYS.includes(body.day as (typeof DAYS)[number]) ||
    typeof body.isOpen !== "boolean"
  )
    throw new AppError("INVALID_INPUT", "วันหรือสถานะร้านไม่ถูกต้อง", 400);
  if (!body.isOpen)
    return {
      day: body.day as (typeof DAYS)[number],
      isOpen: false,
      openMinute: null,
      closeMinute: null,
    };
  const openMinute = integer(body.openMinute, 0, 1439, "เวลาเปิด");
  const closeMinute = integer(body.closeMinute, 1, 1440, "เวลาปิด");
  if (closeMinute <= openMinute)
    throw new AppError("INVALID_INPUT", "เวลาปิดต้องหลังเวลาเปิด", 400);
  return {
    day: body.day as (typeof DAYS)[number],
    isOpen: true,
    openMinute,
    closeMinute,
  };
}

export function parseHoliday(value: unknown) {
  const body = record(value);
  if (typeof body.date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(body.date))
    throw new AppError("INVALID_INPUT", "วันที่ไม่ถูกต้อง", 400);
  const reason = typeof body.reason === "string" ? body.reason.trim() : "";
  if (reason.length > 200) throw new AppError("INVALID_INPUT", "เหตุผลยาวเกินไป", 400);
  return { date: body.date, reason: reason || null };
}

export function parseBlockedTime(value: unknown) {
  const body = record(value);
  const startAt = typeof body.startAt === "string" ? new Date(body.startAt) : new Date(NaN);
  const endAt = typeof body.endAt === "string" ? new Date(body.endAt) : new Date(NaN);
  if (
    Number.isNaN(startAt.getTime()) ||
    Number.isNaN(endAt.getTime()) ||
    endAt <= startAt ||
    endAt.getTime() - startAt.getTime() > 24 * 60 * 60 * 1000
  )
    throw new AppError("INVALID_INPUT", "ช่วงเวลาไม่ถูกต้อง", 400);
  const reason = typeof body.reason === "string" ? body.reason.trim() : "";
  if (reason.length > 200) throw new AppError("INVALID_INPUT", "เหตุผลยาวเกินไป", 400);
  return { startAt, endAt, reason: reason || null };
}

export function parseRole(value: unknown) {
  const body = record(value);
  if (body.role !== "CUSTOMER" && body.role !== "ADMIN")
    throw new AppError("INVALID_ROLE", "role ไม่ถูกต้อง", 400);
  return body.role;
}
