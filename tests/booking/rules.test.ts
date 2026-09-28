import assert from "node:assert/strict";
import test from "node:test";
import { parseCustomer, parseStartAt } from "../../src/contracts/bookingContract";
import { cancellationAllowed, dateIntersectsBookingWindow } from "../../src/domain/booking";

test("accepts Thai names and Thai mobile numbers", () => {
  assert.deepEqual(parseCustomer({ customerName: "สมชาย ใจดี", phone: "0812345678" }), {
    customerName: "สมชาย ใจดี",
    phone: "0812345678",
  });
  assert.throws(() => parseCustomer({ customerName: "John123", phone: "0812345678" }));
  assert.throws(() => parseCustomer({ customerName: "John Doe", phone: "021234567" }));
  assert.throws(() => parseCustomer({ customerName: "John Doe", phone: "081234567" }));
});

test("starts only on half-hour boundaries within 30 days", () => {
  const now = new Date("2026-09-25T03:00:00.000Z");
  assert.equal(
    parseStartAt("2026-09-25T10:30:00+07:00", now).toISOString(),
    "2026-09-25T03:30:00.000Z",
  );
  assert.throws(() => parseStartAt("2026-09-25T10:15:00+07:00", now));
  assert.throws(() => parseStartAt("2026-10-25T10:30:00+07:00", now));
});

test("cancellation is allowed exactly one hour before start", () => {
  const start = new Date("2026-09-25T10:00:00.000Z");
  assert.equal(cancellationAllowed(start, new Date("2026-09-25T09:00:00.000Z")), true);
  assert.equal(cancellationAllowed(start, new Date("2026-09-25T09:00:00.001Z")), false);
});

test("availability dates use the same rolling 30-day limit as booking", () => {
  const now = new Date("2026-09-25T03:00:00.000Z");
  assert.equal(
    dateIntersectsBookingWindow(
      new Date("2026-10-25T00:00:00.000Z"),
      new Date("2026-10-26T00:00:00.000Z"),
      now,
    ),
    true,
  );
  assert.equal(
    dateIntersectsBookingWindow(
      new Date("2026-10-26T00:00:00.000Z"),
      new Date("2026-10-27T00:00:00.000Z"),
      now,
    ),
    false,
  );
  assert.equal(
    dateIntersectsBookingWindow(
      new Date("2026-09-24T00:00:00.000Z"),
      new Date("2026-09-25T00:00:00.000Z"),
      now,
    ),
    false,
  );
});
