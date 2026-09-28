import { getDb } from "@/lib/db";
import { AppError } from "@/lib/errors";
import { bangkokDate, bangkokMinute, bangkokWeekday, dayBounds } from "@/lib/time";
import { parseBlockedTime, parseHoliday, parseShopHours } from "@/contracts/adminContract";
import {
  listBlockedTimes,
  listShopHolidays,
  listShopHours,
} from "@/repositories/scheduleRepository";
import { lockBookingCalendar } from "@/repositories/occupancyRepository";

export async function getAdminSchedule() {
  const [hours, holidays, blockedTimes] = await Promise.all([
    listShopHours(),
    listShopHolidays(),
    listBlockedTimes(),
  ]);
  return {
    hours: hours.map(({ day, isOpen, openMinute, closeMinute }) => ({
      day,
      isOpen,
      openMinute,
      closeMinute,
    })),
    holidays: holidays.map(({ id, date, reason }) => ({
      id,
      date: date.toISOString().slice(0, 10),
      reason,
    })),
    blockedTimes: blockedTimes.map(({ id, startAt, endAt, reason }) => ({
      id,
      startAt: startAt.toISOString(),
      endAt: endAt.toISOString(),
      reason,
    })),
  };
}

export async function saveShopHours(input: unknown) {
  const data = parseShopHours(input);
  return getDb().$transaction(async (tx) => {
    await lockBookingCalendar(tx);
    const bookings = await tx.booking.findMany({
      where: { status: "CONFIRMED", endAt: { gt: new Date() } },
      select: { bookingCode: true, startAt: true, endAt: true },
    });
    const conflict = bookings.find((booking) => {
      if (bangkokWeekday(bangkokDate(booking.startAt)) !== data.day) return false;
      const startMinute = bangkokMinute(booking.startAt);
      const endMinute =
        startMinute + Math.ceil((booking.endAt.getTime() - booking.startAt.getTime()) / 60000);
      return !data.isOpen || startMinute < data.openMinute! || endMinute > data.closeMinute!;
    });
    if (conflict)
      throw new AppError(
        "BOOKING_CONFLICT",
        `มีคิว ${conflict.bookingCode} ที่อยู่นอกเวลาใหม่ กรุณาจัดการคิวก่อน`,
        409,
      );
    return tx.shopHours.upsert({
      where: { day: data.day },
      create: data,
      update: data,
    });
  });
}

export async function addHoliday(input: unknown) {
  const data = parseHoliday(input);
  const { start, end } = dayBounds(data.date);
  if (end <= new Date())
    throw new AppError("INVALID_DATE", "วันหยุดต้องเป็นวันนี้หรือวันในอนาคต", 400);
  return getDb().$transaction(async (tx) => {
    await lockBookingCalendar(tx);
    const conflict = await tx.booking.findFirst({
      where: {
        status: "CONFIRMED",
        startAt: { lt: end },
        endAt: { gt: start },
      },
      select: { bookingCode: true },
    });
    if (conflict)
      throw new AppError(
        "BOOKING_CONFLICT",
        `มีคิว ${conflict.bookingCode} ในวันดังกล่าว กรุณาจัดการคิวก่อน`,
        409,
      );
    const exists = await tx.shopHoliday.findUnique({
      where: { date: new Date(`${data.date}T00:00:00Z`) },
    });
    if (exists) throw new AppError("DUPLICATE_HOLIDAY", "วันหยุดนี้ถูกเพิ่มแล้ว", 409);
    const holiday = await tx.shopHoliday.create({
      data: { date: new Date(`${data.date}T00:00:00Z`), reason: data.reason },
    });
    await tx.calendarOccupancy.create({
      data: {
        kind: "HOLIDAY",
        holidayId: holiday.id,
        startAt: start,
        endAt: end,
      },
    });
    return { id: holiday.id };
  });
}

export async function removeHoliday(id: number) {
  if (!Number.isSafeInteger(id) || id < 1)
    throw new AppError("INVALID_ID", "รหัสวันหยุดไม่ถูกต้อง", 400);
  const result = await getDb().shopHoliday.deleteMany({ where: { id } });
  if (!result.count) throw new AppError("NOT_FOUND", "ไม่พบวันหยุด", 404);
  return { ok: true };
}

export async function addBlockedTime(input: unknown) {
  const data = parseBlockedTime(input);
  if (data.startAt <= new Date())
    throw new AppError("INVALID_DATE", "ช่วงปิดรับคิวต้องอยู่ในอนาคต", 400);
  return getDb().$transaction(async (tx) => {
    await lockBookingCalendar(tx);
    const conflict = await tx.calendarOccupancy.findFirst({
      where: { startAt: { lt: data.endAt }, endAt: { gt: data.startAt } },
    });
    if (conflict)
      throw new AppError("TIME_CONFLICT", "ช่วงเวลานี้ทับคิวหรือช่วงที่ปิดรับแล้ว", 409);
    const blocked = await tx.blockedTime.create({ data });
    await tx.calendarOccupancy.create({
      data: {
        kind: "BLOCKED_TIME",
        blockedTimeId: blocked.id,
        startAt: data.startAt,
        endAt: data.endAt,
      },
    });
    return { id: blocked.id };
  });
}

export async function removeBlockedTime(id: string) {
  const result = await getDb().blockedTime.deleteMany({ where: { id } });
  if (!result.count) throw new AppError("NOT_FOUND", "ไม่พบช่วงปิดรับคิว", 404);
  return { ok: true };
}
