import assert from "node:assert/strict";
import test from "node:test";
import { parseServiceIds } from "../../src/contracts/bookingContract";
import {
  parseAdminService,
  parseBlockedTime,
  parseHoliday,
  parseRole,
  parseShopHours,
} from "../../src/contracts/adminContract";

test("parseServiceIds accepts valid unique positive integer IDs up to 20 items", () => {
  assert.deepEqual(parseServiceIds([1, 2, 5]), [1, 2, 5]);
  assert.deepEqual(parseServiceIds([10]), [10]);

  // Reject empty array
  assert.throws(() => parseServiceIds([]));
  // Reject non-array
  assert.throws(() => parseServiceIds("1,2"));
  assert.throws(() => parseServiceIds(null));
  // Reject duplicates
  assert.throws(() => parseServiceIds([1, 2, 2]));
  // Reject zero or negative IDs
  assert.throws(() => parseServiceIds([0]));
  assert.throws(() => parseServiceIds([-5]));
  // Reject floats
  assert.throws(() => parseServiceIds([1.5]));
  // Reject more than 20 items
  const twentyOneItems = Array.from({ length: 21 }, (_, i) => i + 1);
  assert.throws(() => parseServiceIds(twentyOneItems));
});

test("parseAdminService validates service name, price, duration, and status", () => {
  const valid = parseAdminService({
    name: "ตัดผมชาย",
    priceBaht: 350,
    durationMinutes: 45,
    isActive: true,
  });
  assert.deepEqual(valid, {
    name: "ตัดผมชาย",
    priceBaht: 350,
    durationMinutes: 45,
    isActive: true,
  });

  // Name length boundaries (2 - 100 characters)
  assert.throws(() =>
    parseAdminService({ name: "ก", priceBaht: 100, durationMinutes: 30, isActive: true }),
  );
  assert.throws(() =>
    parseAdminService({
      name: "A".repeat(101),
      priceBaht: 100,
      durationMinutes: 30,
      isActive: true,
    }),
  );

  // Price boundaries (0 - 100,000)
  assert.throws(() =>
    parseAdminService({ name: "บริการ", priceBaht: -1, durationMinutes: 30, isActive: true }),
  );
  assert.throws(() =>
    parseAdminService({ name: "บริการ", priceBaht: 100001, durationMinutes: 30, isActive: true }),
  );

  // Duration boundaries (1 - 480 minutes)
  assert.throws(() =>
    parseAdminService({ name: "บริการ", priceBaht: 100, durationMinutes: 0, isActive: true }),
  );
  assert.throws(() =>
    parseAdminService({ name: "บริการ", priceBaht: 100, durationMinutes: 481, isActive: true }),
  );

  // Status must be boolean
  assert.throws(() =>
    parseAdminService({ name: "บริการ", priceBaht: 100, durationMinutes: 30, isActive: "true" }),
  );
});

test("parseShopHours validates weekday, open status, and minute boundaries", () => {
  const openHours = parseShopHours({
    day: "MONDAY",
    isOpen: true,
    openMinute: 600,
    closeMinute: 1200,
  });
  assert.deepEqual(openHours, {
    day: "MONDAY",
    isOpen: true,
    openMinute: 600,
    closeMinute: 1200,
  });

  const closedHours = parseShopHours({
    day: "SUNDAY",
    isOpen: false,
  });
  assert.deepEqual(closedHours, {
    day: "SUNDAY",
    isOpen: false,
    openMinute: null,
    closeMinute: null,
  });

  // Invalid day name
  assert.throws(() =>
    parseShopHours({ day: "HOLIDAY", isOpen: true, openMinute: 600, closeMinute: 1200 }),
  );

  // Close minute must be after open minute
  assert.throws(() =>
    parseShopHours({ day: "TUESDAY", isOpen: true, openMinute: 600, closeMinute: 600 }),
  );
  assert.throws(() =>
    parseShopHours({ day: "TUESDAY", isOpen: true, openMinute: 700, closeMinute: 600 }),
  );
});

test("parseHoliday validates date format and reason length", () => {
  const holiday = parseHoliday({
    date: "2026-12-31",
    reason: "วันสิ้นปี",
  });
  assert.deepEqual(holiday, {
    date: "2026-12-31",
    reason: "วันสิ้นปี",
  });

  // Reason optional / empty trimmed
  const noReason = parseHoliday({ date: "2026-01-01" });
  assert.deepEqual(noReason, { date: "2026-01-01", reason: null });

  // Invalid date format
  assert.throws(() => parseHoliday({ date: "2026/12/31" }));
  assert.throws(() => parseHoliday({ date: "31-12-2026" }));
  assert.throws(() => parseHoliday({ date: "invalid-date" }));

  // Reason too long (> 200 chars)
  assert.throws(() => parseHoliday({ date: "2026-12-31", reason: "X".repeat(201) }));
});

test("parseBlockedTime validates start/end time and max 24h duration", () => {
  const valid = parseBlockedTime({
    startAt: "2026-10-25T09:00:00.000Z",
    endAt: "2026-10-25T12:00:00.000Z",
    reason: "ทำความสะอาดร้าน",
  });
  assert.equal(valid.startAt.toISOString(), "2026-10-25T09:00:00.000Z");
  assert.equal(valid.endAt.toISOString(), "2026-10-25T12:00:00.000Z");
  assert.equal(valid.reason, "ทำความสะอาดร้าน");

  // End time must be after start time
  assert.throws(() =>
    parseBlockedTime({
      startAt: "2026-10-25T12:00:00.000Z",
      endAt: "2026-10-25T10:00:00.000Z",
    }),
  );
  assert.throws(() =>
    parseBlockedTime({
      startAt: "2026-10-25T12:00:00.000Z",
      endAt: "2026-10-25T12:00:00.000Z",
    }),
  );

  // Maximum blocked duration is 24 hours
  assert.throws(() =>
    parseBlockedTime({
      startAt: "2026-10-25T00:00:00.000Z",
      endAt: "2026-10-26T00:00:01.000Z",
    }),
  );

  // Invalid date string
  assert.throws(() =>
    parseBlockedTime({
      startAt: "not-a-date",
      endAt: "2026-10-25T12:00:00.000Z",
    }),
  );
});

test("parseRole accepts CUSTOMER and ADMIN roles only", () => {
  assert.equal(parseRole({ role: "ADMIN" }), "ADMIN");
  assert.equal(parseRole({ role: "CUSTOMER" }), "CUSTOMER");
  assert.throws(() => parseRole({ role: "SUPER_ADMIN" }));
  assert.throws(() => parseRole({ role: "" }));
  assert.throws(() => parseRole({ role: 123 }));
});
