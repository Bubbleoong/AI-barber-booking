import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { chromium } from "@playwright/test";
import { createSessionCookie, SESSION_COOKIE } from "../../src/features/auth/session";
import { getDb } from "../../src/lib/db";

const databaseUrl = process.env.DATABASE_URL ?? "";
if (new URL(databaseUrl).pathname !== "/barber_test") {
  throw new Error("Responsive tests require the isolated barber_test database");
}
const baseUrl = process.env.APP_URL;
if (baseUrl !== "http://localhost:3001") {
  throw new Error("Responsive tests require localhost:3001");
}

test("customer and admin pages fit mobile, tablet, and desktop viewports", async () => {
  const db = getDb();
  const suffix = crypto.randomUUID();
  const [customer, admin] = await Promise.all([
    db.user.create({ data: { lineUserId: `ui-customer-${suffix}`, role: "CUSTOMER" } }),
    db.user.create({ data: { lineUserId: `ui-admin-${suffix}`, role: "ADMIN" } }),
  ]);
  const service = await db.service.create({
    data: { name: "Test haircut", priceBaht: 300, durationMinutes: 30, isActive: true },
  });
  const startAt = new Date();
  startAt.setUTCDate(startAt.getUTCDate() + 2);
  startAt.setUTCHours(3, 0, 0, 0);
  const endAt = new Date(startAt.getTime() + 30 * 60_000);
  const booking = await db.booking.create({
    data: {
      userId: customer.id,
      startAt,
      endAt,
      customerName: "Test User",
      phone: "0812345678",
      items: {
        create: {
          serviceId: service.id,
          serviceNameSnapshot: service.name,
          priceBahtSnapshot: service.priceBaht,
          durationMinutesSnapshot: service.durationMinutes,
        },
      },
    },
  });
  const browser = await chromium.launch({
    executablePath:
      process.env.CHROME_PATH ?? "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    headless: true,
  });
  const cases = [
    { route: "/booking", role: "customer", label: "booking" },
    { route: "/my-bookings", role: "customer", label: "my-bookings" },
    { route: `/my-bookings/${booking.bookingCode}`, role: "customer", label: "my-booking-detail" },
    { route: "/admin", role: "admin", label: "admin-dashboard" },
    { route: "/admin/bookings", role: "admin", label: "admin-bookings" },
    {
      route: `/admin/bookings/${booking.bookingCode}`,
      role: "admin",
      label: "admin-booking-detail",
    },
    { route: "/admin/services", role: "admin", label: "admin-services" },
    { route: "/admin/schedule", role: "admin", label: "admin-schedule" },
    { route: "/admin/users", role: "admin", label: "admin-users" },
  ] as const;
  const output = path.join(process.cwd(), "test-results", "responsive");
  await mkdir(output, { recursive: true });
  try {
    for (const width of [375, 768, 1280]) {
      const context = await browser.newContext({ viewport: { width, height: 850 } });
      for (const user of [customer, admin]) {
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
        try {
          for (const item of cases.filter((entry) => entry.role === user.role.toLowerCase())) {
            const response = await page.goto(`${baseUrl}${item.route}`, {
              waitUntil: "networkidle",
            });
            assert.ok(
              response && response.status() < 400,
              `${item.route}: HTTP ${response?.status()}`,
            );
            assert.equal(new URL(page.url()).pathname, item.route);
            await page.locator("main").first().waitFor();
            const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
            assert.ok(
              scrollWidth <= width + 1,
              `${item.route} at ${width}px overflows to ${scrollWidth}px`,
            );
            if (width !== 768) {
              await page.screenshot({
                path: path.join(output, `${item.label}-${width}.png`),
                fullPage: true,
              });
            }
          }
        } finally {
          await page.close();
        }
      }
      await context.close();
    }
  } finally {
    await browser.close();
    await db.booking.delete({ where: { id: booking.id } });
    await db.service.delete({ where: { id: service.id } });
    await db.user.deleteMany({ where: { id: { in: [customer.id, admin.id] } } });
    await db.$disconnect();
  }
});
