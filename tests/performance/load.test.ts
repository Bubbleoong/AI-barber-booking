import assert from "node:assert/strict";
import test from "node:test";
import { performance as nodePerformance } from "node:perf_hooks";
import { chromium } from "@playwright/test";
import { createSessionCookie, SESSION_COOKIE } from "../../src/features/auth/session";
import { getDb } from "../../src/lib/db";
import { bangkokDate, bangkokWeekday } from "../../src/lib/time";

const databaseUrl = process.env.DATABASE_URL ?? "";
if (new URL(databaseUrl).pathname !== "/barber_test") {
  throw new Error("Performance tests require the isolated barber_test database");
}
const baseUrl = process.env.APP_URL;
if (baseUrl !== "http://localhost:3001") {
  throw new Error("Performance tests require localhost:3001");
}

function percentile(values: number[], fraction: number) {
  const sorted = [...values].sort((a, b) => a - b);
  return Math.round(sorted[Math.ceil(sorted.length * fraction) - 1]);
}

type LoadResult = {
  route: string;
  requests: number;
  concurrency: number;
  seconds: number;
  requestsPerSecond: number;
  p50Ms: number;
  p95Ms: number;
  maxMs: number;
};

async function runLoad(
  route: string,
  cookie: string,
  requests: number,
  concurrency: number,
): Promise<LoadResult> {
  const durations: number[] = [];
  const statuses: number[] = [];
  let next = 0;
  const started = nodePerformance.now();
  await Promise.all(
    Array.from({ length: concurrency }, async () => {
      while (next < requests) {
        next += 1;
        const before = nodePerformance.now();
        const response = await fetch(`${baseUrl}${route}`, {
          headers: { cookie },
          signal: AbortSignal.timeout(15_000),
        });
        await response.arrayBuffer();
        durations.push(nodePerformance.now() - before);
        statuses.push(response.status);
      }
    }),
  );
  assert.equal(statuses.length, requests);
  assert.deepEqual([...new Set(statuses)], [200], `${route} returned unexpected HTTP statuses`);
  const seconds = (nodePerformance.now() - started) / 1000;
  return {
    route,
    requests,
    concurrency,
    seconds: Number(seconds.toFixed(2)),
    requestsPerSecond: Number((requests / seconds).toFixed(1)),
    p50Ms: percentile(durations, 0.5),
    p95Ms: percentile(durations, 0.95),
    maxMs: Math.round(Math.max(...durations)),
  };
}

test("measure bounded HTTP and browser load against an isolated database", async () => {
  const db = getDb();
  const suffix = crypto.randomUUID();
  const [customer, admin] = await Promise.all([
    db.user.create({ data: { lineUserId: `perf-customer-${suffix}`, role: "CUSTOMER" } }),
    db.user.create({ data: { lineUserId: `perf-admin-${suffix}`, role: "ADMIN" } }),
  ]);
  const contenders = await Promise.all(
    Array.from({ length: 12 }, (_, index) =>
      db.user.create({ data: { lineUserId: `perf-contender-${suffix}-${index}` } }),
    ),
  );
  const service = await db.service.create({
    data: { name: "Load test cut", priceBaht: 250, durationMinutes: 30, isActive: true },
  });
  const startAt = new Date();
  startAt.setUTCDate(startAt.getUTCDate() + 2);
  startAt.setUTCHours(3, 0, 0, 0);
  const day = bangkokWeekday(bangkokDate(startAt));
  await db.shopHours.upsert({
    where: { day },
    create: { day, isOpen: true, openMinute: 540, closeMinute: 1080 },
    update: { isOpen: true, openMinute: 540, closeMinute: 1080 },
  });
  const cookieFor = async (user: { id: string; sessionVersion: number }) =>
    `${SESSION_COOKIE}=${await createSessionCookie(user.id, user.sessionVersion)}`;
  try {
    const customerCookie = await cookieFor(customer);
    const adminCookie = await cookieFor(admin);
    const availability = `/api/availability?date=${bangkokDate(startAt)}&serviceId=${service.id}`;
    for (const [route, cookie] of [
      ["/booking", customerCookie],
      ["/my-bookings", customerCookie],
      ["/admin", adminCookie],
      [availability, customerCookie],
    ]) {
      for (let index = 0; index < 3; index += 1) {
        assert.equal((await fetch(`${baseUrl}${route}`, { headers: { cookie } })).status, 200);
      }
    }
    const results = [
      await runLoad("/booking", customerCookie, 100, 10),
      await runLoad("/booking", customerCookie, 150, 25),
      await runLoad("/my-bookings", customerCookie, 100, 10),
      await runLoad("/admin", adminCookie, 100, 10),
      await runLoad(availability, customerCookie, 40, 10),
    ];
    console.log("HTTP load (local production build):");
    console.table(results);

    const bookingInput = {
      serviceIds: [service.id],
      startAt: startAt.toISOString(),
      customerName: "Load Tester",
      phone: "0812345678",
    };
    const conflictStarted = nodePerformance.now();
    const conflictResponses = await Promise.all(
      contenders.map(async (user) =>
        fetch(`${baseUrl}/api/bookings`, {
          method: "POST",
          headers: {
            cookie: await cookieFor(user),
            origin: baseUrl,
            "content-type": "application/json",
          },
          body: JSON.stringify(bookingInput),
          signal: AbortSignal.timeout(15_000),
        }),
      ),
    );
    const conflictStatuses = conflictResponses.map((response) => response.status);
    assert.equal(conflictStatuses.filter((status) => status === 201).length, 1);
    assert.equal(conflictStatuses.filter((status) => status === 409).length, 11);
    assert.equal(await db.booking.count({ where: { startAt, status: "CONFIRMED" } }), 1);
    console.log("Concurrent booking writes:", {
      requests: 12,
      created: 1,
      rejectedAsConflict: 11,
      elapsedMs: Math.round(nodePerformance.now() - conflictStarted),
    });

    const browser = await chromium.launch({
      executablePath:
        process.env.CHROME_PATH ?? "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
      headless: true,
    });
    try {
      const context = await browser.newContext({ viewport: { width: 1280, height: 850 } });
      for (const [route, user] of [
        ["/booking", customer],
        ["/admin", admin],
      ] as const) {
        await context.addCookies([
          {
            name: SESSION_COOKIE,
            value: await createSessionCookie(user.id, user.sessionVersion),
            url: baseUrl,
            httpOnly: true,
            sameSite: "Lax",
          },
        ]);
        const page = await context.newPage();
        const navigationMs: number[] = [];
        try {
          for (let index = 0; index < 5; index += 1) {
            await page.goto(`${baseUrl}${route}`, { waitUntil: "load" });
            const timing = await page.evaluate(() => {
              const navigation = window.performance
                .getEntries()
                .find((entry) => String(entry.entryType) === "navigation");
              return navigation?.duration ?? 0;
            });
            navigationMs.push(timing);
          }
        } finally {
          await page.close();
        }
        console.log("Browser navigation (Chrome, desktop):", {
          route,
          runs: 5,
          navigationP50Ms: percentile(navigationMs, 0.5),
          navigationP95Ms: percentile(navigationMs, 0.95),
        });
      }
      await context.close();
    } finally {
      await browser.close();
    }
  } finally {
    await db.booking.deleteMany({ where: { userId: { in: contenders.map((user) => user.id) } } });
    await db.service.delete({ where: { id: service.id } });
    await db.user.deleteMany({
      where: { id: { in: [customer.id, admin.id, ...contenders.map((user) => user.id)] } },
    });
    await db.$disconnect();
  }
});
