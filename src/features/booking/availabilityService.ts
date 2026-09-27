import {
  dateIntersectsBookingWindow,
  MAX_ADVANCE_DAYS,
  SLOT_MINUTES,
} from "@/domain/booking";
import type { BookingAvailability } from "@/domain/booking";
import { overlaps } from "@/domain/timeRange";
import { parseServiceIds } from "@/contracts/bookingContract";
import { BookingError } from "@/lib/errors";
import { dayBounds } from "@/lib/time";
import { findActiveServicesByIds } from "@/repositories/serviceRepository";
import {
  findShopHours,
  findShopHoliday,
} from "@/repositories/scheduleRepository";
import { listOverlappingOccupancy } from "@/repositories/occupancyRepository";
import { fitsShopHours } from "./bookingPolicy";

export async function getAvailableSlots(
  date: string,
  rawServiceIds: unknown,
  now = new Date(),
): Promise<BookingAvailability> {
  const serviceIds = parseServiceIds(rawServiceIds);
  const { start, end } = dayBounds(date);
  if (!dateIntersectsBookingWindow(start, end, now)) {
    throw new BookingError(
      "OUTSIDE_BOOKING_WINDOW",
      "วันที่อยู่นอกช่วงที่จองได้",
    );
  }
  const services = await findActiveServicesByIds(serviceIds);
  if (services.length !== serviceIds.length)
    throw new BookingError("INVALID_SERVICES", "มีบริการที่ไม่พร้อมให้จอง");
  const durationMinutes = services.reduce(
    (sum, service) => sum + service.durationMinutes,
    0,
  );
  const [hours, holiday, occupied] = await Promise.all([
    findShopHours(date),
    findShopHoliday(date),
    listOverlappingOccupancy(start, end),
  ]);
  if (!hours?.isOpen || holiday) return { date, durationMinutes, slots: [] };

  const slots: string[] = [];
  for (let minute = 0; minute < 24 * 60; minute += SLOT_MINUTES) {
    const candidate = new Date(start.getTime() + minute * 60_000);
    const endAt = new Date(candidate.getTime() + durationMinutes * 60_000);
    if (
      candidate <= now ||
      candidate.getTime() >
        now.getTime() + MAX_ADVANCE_DAYS * 24 * 60 * 60 * 1000
    )
      continue;
    if (
      fitsShopHours(candidate, durationMinutes, hours) &&
      !occupied.some((item) =>
        overlaps(candidate, endAt, item.startAt, item.endAt),
      )
    )
      slots.push(candidate.toISOString());
  }
  return { date, durationMinutes, slots };
}
