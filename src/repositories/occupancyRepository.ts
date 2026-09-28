import { getDb } from "@/lib/db";
import type { Prisma } from "@/generated/prisma/client";

export function listOverlappingOccupancy(
  startAt: Date,
  endAt: Date,
  db: Prisma.TransactionClient = getDb(),
) {
  return db.calendarOccupancy.findMany({
    where: { startAt: { lt: endAt }, endAt: { gt: startAt } },
    select: { startAt: true, endAt: true },
  });
}

export function findOverlappingOccupancy(startAt: Date, endAt: Date, db: Prisma.TransactionClient) {
  return db.calendarOccupancy.findFirst({
    where: { startAt: { lt: endAt }, endAt: { gt: startAt } },
    select: { id: true },
  });
}

export async function lockBookingCalendar(db: Prisma.TransactionClient) {
  await db.$executeRaw`SELECT pg_advisory_xact_lock(7042026)`;
}

export function reserveBooking(
  bookingId: string,
  startAt: Date,
  endAt: Date,
  db: Prisma.TransactionClient,
) {
  return db.calendarOccupancy.create({
    data: { kind: "BOOKING", startAt, endAt, bookingId },
  });
}

export function releaseBooking(bookingId: string, db: Prisma.TransactionClient) {
  return db.calendarOccupancy.deleteMany({ where: { bookingId } });
}
