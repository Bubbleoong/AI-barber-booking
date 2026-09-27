import { getDb } from "@/lib/db";
import type { Prisma } from "@/generated/prisma/client";
import type { BookingCustomer } from "@/domain/booking";
import type { BookingServiceOption } from "@/domain/service";

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

export function listBookingsForUser(userId: string) {
  return getDb().booking.findMany({
    where: { userId },
    include: { items: true },
    orderBy: { startAt: "desc" },
  });
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
