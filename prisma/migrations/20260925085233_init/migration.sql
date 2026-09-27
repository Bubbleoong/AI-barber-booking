-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('CUSTOMER', 'ADMIN');

-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('CONFIRMED', 'CANCELLED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "Weekday" AS ENUM ('MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY');

-- CreateEnum
CREATE TYPE "OccupancyKind" AS ENUM ('BOOKING', 'BLOCKED_TIME', 'HOLIDAY');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "lineUserId" TEXT NOT NULL,
    "displayName" TEXT,
    "pictureUrl" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'CUSTOMER',
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SystemConfig" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "initialAdminId" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SystemConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Service" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "priceBaht" INTEGER NOT NULL,
    "durationMinutes" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "Service_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Booking" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "startAt" TIMESTAMPTZ(3) NOT NULL,
    "endAt" TIMESTAMPTZ(3) NOT NULL,
    "status" "BookingStatus" NOT NULL DEFAULT 'CONFIRMED',
    "customerName" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "Booking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BookingItem" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "serviceId" INTEGER NOT NULL,
    "serviceNameSnapshot" TEXT NOT NULL,
    "priceBahtSnapshot" INTEGER NOT NULL,
    "durationMinutesSnapshot" INTEGER NOT NULL,

    CONSTRAINT "BookingItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ShopHours" (
    "id" SERIAL NOT NULL,
    "day" "Weekday" NOT NULL,
    "isOpen" BOOLEAN NOT NULL DEFAULT false,
    "openMinute" INTEGER,
    "closeMinute" INTEGER,

    CONSTRAINT "ShopHours_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ShopHoliday" (
    "id" SERIAL NOT NULL,
    "date" DATE NOT NULL,
    "reason" TEXT,

    CONSTRAINT "ShopHoliday_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BlockedTime" (
    "id" TEXT NOT NULL,
    "startAt" TIMESTAMPTZ(3) NOT NULL,
    "endAt" TIMESTAMPTZ(3) NOT NULL,
    "reason" TEXT,

    CONSTRAINT "BlockedTime_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CalendarOccupancy" (
    "id" TEXT NOT NULL,
    "kind" "OccupancyKind" NOT NULL,
    "startAt" TIMESTAMPTZ(3) NOT NULL,
    "endAt" TIMESTAMPTZ(3) NOT NULL,
    "bookingId" TEXT,
    "blockedTimeId" TEXT,
    "holidayId" INTEGER,

    CONSTRAINT "CalendarOccupancy_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_lineUserId_key" ON "User"("lineUserId");

-- CreateIndex
CREATE UNIQUE INDEX "SystemConfig_initialAdminId_key" ON "SystemConfig"("initialAdminId");

-- CreateIndex
CREATE INDEX "Booking_userId_startAt_idx" ON "Booking"("userId", "startAt");

-- CreateIndex
CREATE INDEX "Booking_status_startAt_idx" ON "Booking"("status", "startAt");

-- CreateIndex
CREATE UNIQUE INDEX "BookingItem_bookingId_serviceId_key" ON "BookingItem"("bookingId", "serviceId");

-- CreateIndex
CREATE UNIQUE INDEX "ShopHours_day_key" ON "ShopHours"("day");

-- CreateIndex
CREATE UNIQUE INDEX "ShopHoliday_date_key" ON "ShopHoliday"("date");

-- CreateIndex
CREATE UNIQUE INDEX "CalendarOccupancy_bookingId_key" ON "CalendarOccupancy"("bookingId");

-- CreateIndex
CREATE UNIQUE INDEX "CalendarOccupancy_blockedTimeId_key" ON "CalendarOccupancy"("blockedTimeId");

-- CreateIndex
CREATE UNIQUE INDEX "CalendarOccupancy_holidayId_key" ON "CalendarOccupancy"("holidayId");

-- CreateIndex
CREATE INDEX "CalendarOccupancy_startAt_endAt_idx" ON "CalendarOccupancy"("startAt", "endAt");

-- AddForeignKey
ALTER TABLE "SystemConfig" ADD CONSTRAINT "SystemConfig_initialAdminId_fkey" FOREIGN KEY ("initialAdminId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookingItem" ADD CONSTRAINT "BookingItem_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookingItem" ADD CONSTRAINT "BookingItem_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CalendarOccupancy" ADD CONSTRAINT "CalendarOccupancy_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CalendarOccupancy" ADD CONSTRAINT "CalendarOccupancy_blockedTimeId_fkey" FOREIGN KEY ("blockedTimeId") REFERENCES "BlockedTime"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CalendarOccupancy" ADD CONSTRAINT "CalendarOccupancy_holidayId_fkey" FOREIGN KEY ("holidayId") REFERENCES "ShopHoliday"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- One barber: occupied time ranges must never overlap.
ALTER TABLE "CalendarOccupancy"
  ADD CONSTRAINT "CalendarOccupancy_valid_range" CHECK ("startAt" < "endAt"),
  ADD CONSTRAINT "CalendarOccupancy_one_source" CHECK (
    ("kind" = 'BOOKING' AND "bookingId" IS NOT NULL AND "blockedTimeId" IS NULL AND "holidayId" IS NULL) OR
    ("kind" = 'BLOCKED_TIME' AND "bookingId" IS NULL AND "blockedTimeId" IS NOT NULL AND "holidayId" IS NULL) OR
    ("kind" = 'HOLIDAY' AND "bookingId" IS NULL AND "blockedTimeId" IS NULL AND "holidayId" IS NOT NULL)
  );

ALTER TABLE "CalendarOccupancy"
  ADD CONSTRAINT "CalendarOccupancy_no_overlap"
  EXCLUDE USING gist (tstzrange("startAt", "endAt", '[)') WITH &&);

ALTER TABLE "Booking" ADD CONSTRAINT "Booking_valid_range" CHECK ("startAt" < "endAt");
ALTER TABLE "BlockedTime" ADD CONSTRAINT "BlockedTime_valid_range" CHECK ("startAt" < "endAt");
ALTER TABLE "Service" ADD CONSTRAINT "Service_valid_values" CHECK ("priceBaht" >= 0 AND "durationMinutes" > 0);
ALTER TABLE "ShopHours" ADD CONSTRAINT "ShopHours_valid_minutes" CHECK (
  ("isOpen" = false AND "openMinute" IS NULL AND "closeMinute" IS NULL) OR
  ("isOpen" = true AND "openMinute" IS NOT NULL AND "closeMinute" IS NOT NULL AND "openMinute" >= 0 AND "closeMinute" <= 1440 AND "openMinute" < "closeMinute")
);

ALTER TABLE "SystemConfig" ADD CONSTRAINT "SystemConfig_singleton" CHECK ("id" = 1);

CREATE FUNCTION protect_initial_admin() RETURNS trigger AS $$
BEGIN
  IF TG_TABLE_NAME = 'SystemConfig' THEN
    IF TG_OP <> 'INSERT' THEN
      RAISE EXCEPTION 'Initial administrator configuration is immutable';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM "User" WHERE "id" = NEW."initialAdminId" AND "role" = 'ADMIN') THEN
      RAISE EXCEPTION 'Initial administrator must have ADMIN role';
    END IF;
    RETURN NEW;
  END IF;

  IF OLD."id" = (SELECT "initialAdminId" FROM "SystemConfig" WHERE "id" = 1) THEN
    IF TG_OP = 'DELETE' OR NEW."role" <> 'ADMIN' THEN
      RAISE EXCEPTION 'Initial administrator cannot be deleted or demoted';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER "SystemConfig_initial_admin_guard"
  BEFORE INSERT OR UPDATE OR DELETE ON "SystemConfig"
  FOR EACH ROW EXECUTE FUNCTION protect_initial_admin();

CREATE TRIGGER "User_initial_admin_guard"
  BEFORE UPDATE OR DELETE ON "User"
  FOR EACH ROW EXECUTE FUNCTION protect_initial_admin();
