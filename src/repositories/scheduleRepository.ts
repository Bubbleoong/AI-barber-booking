import { getDb } from "@/lib/db";
import type { Prisma } from "@/generated/prisma/client";
import { bangkokWeekday } from "@/lib/time";

export function findShopHours(
  date: string,
  db: Prisma.TransactionClient = getDb(),
) {
  return db.shopHours.findUnique({ where: { day: bangkokWeekday(date) } });
}

export function findShopHoliday(
  date: string,
  db: Prisma.TransactionClient = getDb(),
) {
  return db.shopHoliday.findUnique({
    where: { date: new Date(`${date}T00:00:00Z`) },
  });
}
