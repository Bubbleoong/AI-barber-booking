import { getDb } from "@/lib/db";
import { BookingError } from "@/lib/errors";
import { bangkokDate } from "@/lib/time";
import { cancellationAllowed } from "@/domain/booking";
import { toBookingDetails } from "@/contracts/bookingResponse";
import {
  parseCustomer,
  parseServiceIds,
  parseStartAt,
} from "@/contracts/bookingContract";
import { fitsShopHours } from "./bookingPolicy";
import { findActiveServicesByIds } from "@/repositories/serviceRepository";
import {
  findShopHours,
  findShopHoliday,
} from "@/repositories/scheduleRepository";
import {
  findOverlappingOccupancy,
  lockBookingCalendar,
  reserveBooking,
  releaseBooking,
} from "@/repositories/occupancyRepository";
import {
  createBookingRecord,
  findOwnedBooking,
  listBookingsForUser,
  markBookingCancelled,
} from "@/repositories/bookingRepository";

const CONTACT_SHOP =
  "เหลือเวลาน้อยกว่า 1 ชั่วโมงก่อนรับบริการ กรุณาติดต่อเจ้าของร้านเพื่อยกเลิกการจอง";

export async function createBooking(
  userId: string,
  input: unknown,
  now = new Date(),
) {
  if (!userId) throw new BookingError("UNAUTHORIZED", "กรุณาเข้าสู่ระบบ", 401);
  if (!input || typeof input !== "object")
    throw new BookingError("INVALID_INPUT", "ข้อมูลการจองไม่ถูกต้อง");
  const body = input as Record<string, unknown>;
  const serviceIds = parseServiceIds(body.serviceIds);
  const customer = parseCustomer(body);
  const startAt = parseStartAt(body.startAt, now);
  try {
    const booking = await getDb().$transaction(async (tx) => {
      await lockBookingCalendar(tx);
      const services = await findActiveServicesByIds(serviceIds, tx);
      if (services.length !== serviceIds.length)
        throw new BookingError("INVALID_SERVICES", "มีบริการที่ไม่พร้อมให้จอง");
      const ordered = serviceIds.map(
        (id) => services.find((service) => service.id === id)!,
      );
      const durationMinutes = ordered.reduce(
        (sum, service) => sum + service.durationMinutes,
        0,
      );
      const endAt = new Date(startAt.getTime() + durationMinutes * 60_000);
      const date = bangkokDate(startAt);
      const [hours, holiday, occupied] = await Promise.all([
        findShopHours(date, tx),
        findShopHoliday(date, tx),
        findOverlappingOccupancy(startAt, endAt, tx),
      ]);
      if (
        holiday ||
        occupied ||
        !fitsShopHours(startAt, durationMinutes, hours)
      ) {
        throw new BookingError(
          "SLOT_UNAVAILABLE",
          "ช่วงเวลานี้ไม่ว่าง กรุณาเลือกเวลาใหม่",
          409,
        );
      }
      const booking = await createBookingRecord(
        userId,
        startAt,
        endAt,
        customer,
        ordered,
        tx,
      );
      await reserveBooking(booking.id, startAt, endAt, tx);
      return booking;
    });
    return toBookingDetails(booking);
  } catch (error) {
    if (error instanceof BookingError) throw error;
    if (
      typeof error === "object" &&
      error &&
      "code" in error &&
      (error.code === "P2002" ||
        error.code === "P2034" ||
        error.code === "23P01")
    ) {
      throw new BookingError(
        "SLOT_UNAVAILABLE",
        "ช่วงเวลานี้ไม่ว่าง กรุณาเลือกเวลาใหม่",
        409,
      );
    }
    throw error;
  }
}

export async function listMyBookings(userId: string) {
  if (!userId) throw new BookingError("UNAUTHORIZED", "กรุณาเข้าสู่ระบบ", 401);
  return (await listBookingsForUser(userId)).map(toBookingDetails);
}

export async function getBookingDetails(userId: string, bookingId: string) {
  if (!userId) throw new BookingError("UNAUTHORIZED", "กรุณาเข้าสู่ระบบ", 401);
  const booking = await findOwnedBooking(userId, bookingId);
  if (!booking) throw new BookingError("NOT_FOUND", "ไม่พบรายการจอง", 404);
  return toBookingDetails(booking);
}
export async function cancelBooking(
  userId: string,
  bookingId: string,
  now = new Date(),
) {
  if (!userId) throw new BookingError("UNAUTHORIZED", "กรุณาเข้าสู่ระบบ", 401);
  return getDb().$transaction(async (tx) => {
    const booking = await findOwnedBooking(userId, bookingId, tx);
    if (!booking) throw new BookingError("NOT_FOUND", "ไม่พบรายการจอง", 404);
    if (booking.status !== "CONFIRMED")
      throw new BookingError("NOT_CANCELLABLE", "รายการนี้ยกเลิกไม่ได้", 409);
    if (!cancellationAllowed(booking.startAt, now))
      throw new BookingError("CONTACT_SHOP", CONTACT_SHOP, 409);
    const result = await markBookingCancelled(userId, booking.id, tx);
    if (result.count !== 1)
      throw new BookingError("NOT_CANCELLABLE", "รายการนี้ยกเลิกไม่ได้", 409);
    await releaseBooking(booking.id, tx);
    return { bookingId: booking.bookingCode, status: "CANCELLED" as const };
  });
}
