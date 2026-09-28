import { getDb } from "@/lib/db";
import type { Prisma } from "@/generated/prisma/client";
import type { BookingCustomer } from "@/types/bookingDomain";
import type { BookingServiceOption } from "@/types/service";
import type { AdminBookingFilters } from "@/types/admin";
import { dayBounds } from "@/lib/time";

export function createBookingRecord(
  userId: string,
  startAt: Date,
  endAt: Date,
  customer: BookingCustomer,
  services: BookingServiceOption[],
  db: Prisma.TransactionClient,
) {
  return db.booking.create({
    data: {
      userId,
      startAt,
      endAt,
      ...customer,
      status: "CONFIRMED",
      items: {
        create: services.map((service) => ({
          serviceId: service.id,
          serviceNameSnapshot: service.name,
          priceBahtSnapshot: service.priceBaht,
          durationMinutesSnapshot: service.durationMinutes,
        })),
      },
    },
    include: { items: true },
  });
}

export function listBookingsForUser(userId: string, page = 1, pageSize = 5) {
  return getDb().booking.findMany({
    where: { userId },
    include: { items: true },
    orderBy: { startAt: "desc" },
    skip: (page - 1) * pageSize,
    take: pageSize,
  });
}

export function countBookingsForUser(userId: string) {
  return getDb().booking.count({ where: { userId } });
}

export function findOwnedBooking(
  userId: string,
  bookingId: string,
  db: Prisma.TransactionClient = getDb(),
) {
  return db.booking.findFirst({
    where: { userId, OR: [{ bookingCode: bookingId }, { id: bookingId }] },
    include: { items: true },
  });
}

export function markBookingCancelled(
  userId: string,
  bookingId: string,
  db: Prisma.TransactionClient,
) {
  return db.booking.updateMany({
    where: { id: bookingId, userId, status: "CONFIRMED" },
    data: { status: "CANCELLED" },
  });
}

export function listAllBookings() {
  return getDb().booking.findMany({ include: { items: true }, orderBy: { startAt: "desc" } });
}

function adminBookingWhere(filters: AdminBookingFilters): Prisma.BookingWhereInput {
  const bounds = filters.date ? dayBounds(filters.date) : null;
  return {
    ...(bounds ? { startAt: { gte: bounds.start, lt: bounds.end } } : {}),
    ...(filters.status ? { status: filters.status } : {}),
    ...(filters.query
      ? {
          OR: [
            { bookingCode: { contains: filters.query, mode: "insensitive" } },
            { customerName: { contains: filters.query, mode: "insensitive" } },
          ],
        }
      : {}),
  };
}

export async function searchBookings(filters: AdminBookingFilters, pageSize = 10) {
  const where = adminBookingWhere(filters);
  const total = await getDb().booking.count({ where });
  const page = Math.min(filters.page, Math.max(1, Math.ceil(total / pageSize)));
  const bookings = await getDb().booking.findMany({
    where,
    include: { items: true },
    orderBy: { startAt: "desc" },
    skip: (page - 1) * pageSize,
    take: pageSize,
  });
  return { bookings, total, page, pageSize };
}

export async function dashboardBookingStats(today: string) {
  const { start, end } = dayBounds(today);
  const [todayCount, nextBooking] = await Promise.all([
    getDb().booking.count({ where: { startAt: { gte: start, lt: end } } }),
    getDb().booking.findFirst({
      where: { status: "CONFIRMED", startAt: { gt: new Date() } },
      include: { items: true },
      orderBy: { startAt: "asc" },
    }),
  ]);
  return { todayCount, nextBooking };
}

export function findBookingByCode(code: string, db: Prisma.TransactionClient = getDb()) {
  return db.booking.findFirst({
    where: { OR: [{ bookingCode: code }, { id: code }] },
    include: { items: true },
  });
}

export function markAnyBookingCancelled(id: string, db: Prisma.TransactionClient) {
  return db.booking.updateMany({
    where: { id, status: "CONFIRMED" },
    data: { status: "CANCELLED" },
  });
}
