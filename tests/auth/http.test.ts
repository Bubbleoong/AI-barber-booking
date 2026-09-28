import assert from "node:assert/strict";
import test from "node:test";
import { getDb } from "../../src/lib/db";
import { createSessionCookie, SESSION_COOKIE } from "../../src/features/auth/session";

const databaseUrl = process.env.DATABASE_URL ?? "";
if (new URL(databaseUrl).pathname !== "/barber_test") {
  throw new Error("HTTP tests require the isolated barber_test database");
}
const baseUrl = process.env.APP_URL;
if (baseUrl !== "http://localhost:3001") throw new Error("HTTP tests require localhost:3001");

test("routes distinguish guest, customer, admin, and invalid LINE callback", async () => {
  const db = getDb();
  const suffix = crypto.randomUUID();
  const [customer, admin] = await Promise.all([
    db.user.create({ data: { lineUserId: `test-customer-${suffix}`, role: "CUSTOMER" } }),
    db.user.create({ data: { lineUserId: `test-admin-${suffix}`, role: "ADMIN" } }),
  ]);
  const customerCookie = `${SESSION_COOKIE}=${await createSessionCookie(customer.id, customer.sessionVersion)}`;
  const adminCookie = `${SESSION_COOKIE}=${await createSessionCookie(admin.id, admin.sessionVersion)}`;
  const request = (path: string, cookie?: string) =>
    fetch(`${baseUrl}${path}`, {
      headers: cookie ? { cookie } : {},
      redirect: "manual",
    });
  try {
    const guestHome = await request("/");
    assert.equal(new URL(guestHome.headers.get("location")!, baseUrl).pathname, "/login");
    const customerHome = await request("/", customerCookie);
    assert.equal(new URL(customerHome.headers.get("location")!, baseUrl).pathname, "/booking");
    const adminHome = await request("/", adminCookie);
    assert.equal(new URL(adminHome.headers.get("location")!, baseUrl).pathname, "/admin");

    const adminMutation = (cookie?: string) =>
      fetch(`${baseUrl}/api/admin/schedule`, {
        method: "PATCH",
        headers: {
          origin: baseUrl,
          "content-type": "application/json",
          ...(cookie ? { cookie } : {}),
        },
        body: "{}",
      });
    assert.equal((await adminMutation()).status, 401);
    assert.equal((await adminMutation(customerCookie)).status, 403);
    assert.equal((await adminMutation(adminCookie)).status, 400);

    const bookingMutation = (cookie?: string) =>
      fetch(`${baseUrl}/api/bookings`, {
        method: "POST",
        headers: {
          origin: baseUrl,
          "content-type": "application/json",
          ...(cookie ? { cookie } : {}),
        },
        body: "{}",
      });
    assert.equal((await bookingMutation()).status, 401);
    assert.equal((await bookingMutation(customerCookie)).status, 400);
    assert.equal((await request("/admin/users", customerCookie)).status, 307);

    const missingLineData = await request("/api/auth/callback/line");
    assert.equal(new URL(missingLineData.headers.get("location")!).pathname, "/login");
    const lineStart = await request("/api/auth/line");
    assert.equal(lineStart.status, 307);
    const lineUrl = new URL(lineStart.headers.get("location")!);
    assert.equal(lineUrl.hostname, "access.line.me");
    assert.equal(lineUrl.searchParams.get("redirect_uri"), `${baseUrl}/api/auth/callback/line`);
    assert.ok(lineUrl.searchParams.get("state"));
    assert.ok(lineUrl.searchParams.get("nonce"));
    const oauthCookie = lineStart.headers.get("set-cookie")!.split(";", 1)[0];
    const wrongState = await request("/api/auth/callback/line?code=fake&state=wrong", oauthCookie);
    assert.equal(new URL(wrongState.headers.get("location")!).searchParams.get("error"), "line");
  } finally {
    await db.user.deleteMany({ where: { id: { in: [customer.id, admin.id] } } });
    await db.$disconnect();
  }
});
