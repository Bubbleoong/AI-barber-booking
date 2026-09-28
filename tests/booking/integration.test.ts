import assert from "node:assert/strict";
import test from "node:test";
import { getDb } from "../../src/lib/db";
import { createBooking, getBookingDetails } from "../../src/features/booking/bookingService";
import { bangkokDate, bangkokWeekday } from "../../src/lib/time";

const databaseUrl = process.env.DATABASE_URL ?? "";
if (new URL(databaseUrl).pathname !== "/barber_test") {
  throw new Error("Integration tests require the isolated barber_test database");
}

test("one of two concurrent requests books a slot; invalid and foreign requests fail", async () => {
  const db = getDb();
  const suffix = crypto.randomUUID();
  const users = await Promise.all(
    [1, 2].map((n) =>
      db.user.create({
        data: { lineUserId: `test-${suffix}-${n}`, role: "CUSTOMER" },
      }),
    ),
  );
  const service = await db.service.create({
    data: { name: `Test cut ${suffix}`, priceBaht: 250, durationMinutes: 30, isActive: true },
  });
  const start = new Date();
  start.setUTCDate(start.getUTCDate() + 2);
  start.setUTCHours(3, 0, 0, 0);
  await db.shopHours.upsert({
    where: { day: bangkokWeekday(bangkokDate(start)) },
    create: {
      day: bangkokWeekday(bangkokDate(start)),
      isOpen: true,
      openMinute: 540,
      closeMinute: 1080,
    },
    update: { isOpen: true, openMinute: 540, closeMinute: 1080 },
  });
  const input = {
    serviceIds: [service.id],
    customerName: "Test User",
    phone: "0812345678",
    startAt: start.toISOString(),
  };
  try {
    const results = await Promise.allSettled(users.map((user) => createBooking(user.id, input)));
    const success = results.filter((result) => result.status === "fulfilled");
    const failure = results.filter((result) => result.status === "rejected");
    assert.equal(success.length, 1);
    assert.equal(failure.length, 1);
    assert.equal((failure[0] as PromiseRejectedResult).reason.code, "SLOT_UNAVAILABLE");
    assert.equal(await db.booking.count({ where: { startAt: start, status: "CONFIRMED" } }), 1);
    assert.equal(
      await db.calendarOccupancy.count({ where: { startAt: start, kind: "BOOKING" } }),
      1,
    );

    const winner = results.findIndex((result) => result.status === "fulfilled");
    const bookingId = (results[winner] as PromiseFulfilledResult<{ bookingId: string }>).value
      .bookingId;
    await assert.rejects(
      getBookingDetails(users[1 - winner].id, bookingId),
      (error: { code?: string }) => error.code === "NOT_FOUND",
    );
    await assert.rejects(
      createBooking(users[winner].id, { ...input, phone: "123" }),
      (error: { code?: string }) => error.code === "INVALID_PHONE",
    );
    await assert.rejects(
      createBooking(users[winner].id, { ...input, serviceIds: [999999999] }),
      (error: { code?: string }) => error.code === "INVALID_SERVICES",
    );
  } finally {
    await db.calendarOccupancy.deleteMany({
      where: { booking: { userId: { in: users.map((user) => user.id) } } },
    });
    await db.booking.deleteMany({ where: { userId: { in: users.map((user) => user.id) } } });
    await db.service.delete({ where: { id: service.id } });
    await db.user.deleteMany({ where: { id: { in: users.map((user) => user.id) } } });
    await db.$disconnect();
  }
});
