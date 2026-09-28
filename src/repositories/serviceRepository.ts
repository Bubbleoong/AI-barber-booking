import { getDb } from "@/lib/db";
import type { Prisma } from "@/generated/prisma/client";
import type { BookingServiceOption } from "@/types/service";
import type { AdminServiceInput } from "@/types/admin";

export async function listActiveBookingServices(): Promise<BookingServiceOption[]> {
  return getDb().service.findMany({
    where: { isActive: true, deletedAt: null },
    orderBy: { id: "asc" },
    select: { id: true, name: true, priceBaht: true, durationMinutes: true },
  });
}

export async function findActiveServicesByIds(
  ids: number[],
  db: Prisma.TransactionClient = getDb(),
) {
  return db.service.findMany({
    where: { id: { in: ids }, isActive: true, deletedAt: null },
  });
}

export function listAllServices() {
  return getDb().service.findMany({
    where: { deletedAt: null },
    orderBy: { id: "asc" },
  });
}

export function createService(data: AdminServiceInput) {
  return getDb().service.create({ data });
}

export function updateService(id: number, data: AdminServiceInput) {
  return getDb().service.updateMany({ where: { id, deletedAt: null }, data });
}

export function archiveService(id: number) {
  return getDb().service.updateMany({
    where: { id, deletedAt: null },
    data: { deletedAt: new Date(), isActive: false },
  });
}
