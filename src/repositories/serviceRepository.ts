import { getDb } from "@/lib/db";
import type { Prisma } from "@/generated/prisma/client";
import type { BookingServiceOption } from "@/domain/service";

export async function listActiveBookingServices(): Promise<
  BookingServiceOption[]
> {
  return getDb().service.findMany({
    where: { isActive: true },
    orderBy: { id: "asc" },
    select: { id: true, name: true, priceBaht: true, durationMinutes: true },
  });
}

export async function findActiveServicesByIds(
  ids: number[],
  db: Prisma.TransactionClient = getDb(),
) {
  return db.service.findMany({ where: { id: { in: ids }, isActive: true } });
}
