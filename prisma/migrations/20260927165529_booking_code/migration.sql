CREATE FUNCTION format_booking_code(booking_number bigint) RETURNS text
LANGUAGE SQL IMMUTABLE AS $$
  SELECT 'BK-' || lpad(booking_number::text, GREATEST(5, length(booking_number::text)), '0')
$$;

CREATE SEQUENCE booking_code_seq START WITH 1;

ALTER TABLE "Booking" ADD COLUMN "bookingCode" text;

WITH numbered AS (
  SELECT "id", row_number() OVER (ORDER BY "createdAt", "id") AS booking_number
  FROM "Booking"
)
UPDATE "Booking" AS booking
SET "bookingCode" = format_booking_code(numbered.booking_number)
FROM numbered
WHERE booking."id" = numbered."id";

SELECT setval(
  'booking_code_seq',
  COALESCE((SELECT max(substring("bookingCode" FROM 4)::bigint) FROM "Booking"), 0) + 1,
  false
);

ALTER TABLE "Booking"
  ALTER COLUMN "bookingCode" SET DEFAULT format_booking_code(nextval('booking_code_seq'::regclass)),
  ALTER COLUMN "bookingCode" SET NOT NULL;

CREATE UNIQUE INDEX "Booking_bookingCode_key" ON "Booking"("bookingCode");
