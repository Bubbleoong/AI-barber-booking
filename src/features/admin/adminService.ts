import { getDb } from "@/lib/db";
import { AppError } from "@/lib/errors";
import { toBookingDetails } from "@/contracts/bookingResponse";
import { parseAdminService } from "@/contracts/adminContract";
import {
  archiveService,
  createService,
  listAllServices,
  updateService,
} from "@/repositories/serviceRepository";
import {
  dashboardBookingStats,
  findBookingByCode,
  markAnyBookingCancelled,
  searchBookings,
} from "@/repositories/bookingRepository";
import type { AdminBookingFilters } from "@/types/admin";
import { lockBookingCalendar, releaseBooking } from "@/repositories/occupancyRepository";

export async function getAdminServices() {
  return (await listAllServices()).map(({ id, name, priceBaht, durationMinutes, isActive }) => ({
    id,
    name,
    priceBaht,
    durationMinutes,
    isActive,
  }));
}

export async function addAdminService(input: unknown) {
  return createService(parseAdminService(input));
}

export async function editAdminService(id: number, input: unknown) {
  if (!Number.isSafeInteger(id) || id < 1)
    throw new AppError("INVALID_ID", "รหัสบริการไม่ถูกต้อง", 400);
  const result = await updateService(id, parseAdminService(input));
  if (result.count !== 1) throw new AppError("NOT_FOUND", "ไม่พบบริการ", 404);
  return { ok: true };
}

export async function removeAdminService(id: number) {
  if (!Number.isSafeInteger(id) || id < 1)
    throw new AppError("INVALID_ID", "รหัสบริการไม่ถูกต้อง", 400);
  const result = await archiveService(id);
  if (result.count !== 1) throw new AppError("NOT_FOUND", "ไม่พบบริการ", 404);
  return { ok: true };
}

export async function getAdminBookings(filters: AdminBookingFilters) {
  const result = await searchBookings(filters);
  return { ...result, bookings: result.bookings.map(toBookingDetails) };
}

export async function getDashboardBookingStats(today: string) {
  const result = await dashboardBookingStats(today);
  return {
    todayCount: result.todayCount,
    nextBooking: result.nextBooking ? toBookingDetails(result.nextBooking) : null,
  };
}

export async function getAdminBooking(code: string) {
  const booking = await findBookingByCode(code);
  if (!booking) throw new AppError("NOT_FOUND", "ไม่พบคิว", 404);
  return toBookingDetails(booking);
}

export async function cancelAdminBooking(code: string, now = new Date()) {
  return getDb().$transaction(async (tx) => {
    await lockBookingCalendar(tx);
    const booking = await findBookingByCode(code, tx);
    if (!booking) throw new AppError("NOT_FOUND", "ไม่พบคิว", 404);
    if (booking.status !== "CONFIRMED" || booking.startAt <= now)
      throw new AppError("NOT_CANCELLABLE", "คิวนี้ยกเลิกไม่ได้", 409);
    const result = await markAnyBookingCancelled(booking.id, tx);
    if (result.count !== 1) throw new AppError("NOT_CANCELLABLE", "คิวนี้ยกเลิกไม่ได้", 409);
    await releaseBooking(booking.id, tx);
    return { bookingId: booking.bookingCode, status: "CANCELLED" as const };
  });
}
