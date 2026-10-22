import assert from "node:assert/strict";
import test from "node:test";
import { overlaps } from "../../src/domain/timeRange";
import { roleDestination } from "../../src/features/auth/roleDestination";

test("overlaps correctly detects overlapping time ranges and boundaries", () => {
  const startA = new Date("2026-10-25T10:00:00.000Z");
  const endA = new Date("2026-10-25T11:00:00.000Z");

  // Partial overlap (A starts earlier, ends inside B)
  const partialOverlap = overlaps(
    startA,
    endA,
    new Date("2026-10-25T10:30:00.000Z"),
    new Date("2026-10-25T11:30:00.000Z"),
  );
  assert.equal(partialOverlap, true);

  // Complete containment (B is inside A)
  const contained = overlaps(
    startA,
    endA,
    new Date("2026-10-25T10:15:00.000Z"),
    new Date("2026-10-25T10:45:00.000Z"),
  );
  assert.equal(contained, true);

  // Adjacent ranges (touching boundaries without overlap)
  // [10:00 - 11:00] and [11:00 - 12:00] should NOT overlap
  const adjacentAfter = overlaps(
    startA,
    endA,
    new Date("2026-10-25T11:00:00.000Z"),
    new Date("2026-10-25T12:00:00.000Z"),
  );
  assert.equal(adjacentAfter, false);

  // [09:00 - 10:00] and [10:00 - 11:00] should NOT overlap
  const adjacentBefore = overlaps(
    startA,
    endA,
    new Date("2026-10-25T09:00:00.000Z"),
    new Date("2026-10-25T10:00:00.000Z"),
  );
  assert.equal(adjacentBefore, false);

  // Completely separate ranges
  const separate = overlaps(
    startA,
    endA,
    new Date("2026-10-25T12:00:00.000Z"),
    new Date("2026-10-25T13:00:00.000Z"),
  );
  assert.equal(separate, false);
});

test("roleDestination returns correct path according to user role", () => {
  assert.equal(roleDestination("ADMIN"), "/admin");
  assert.equal(roleDestination("CUSTOMER"), "/booking");
});
