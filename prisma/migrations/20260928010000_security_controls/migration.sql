ALTER TABLE "User" ADD COLUMN "sessionVersion" INTEGER NOT NULL DEFAULT 0;

CREATE TABLE "RequestLimit" (
  "key" TEXT NOT NULL,
  "count" INTEGER NOT NULL DEFAULT 0,
  "expiresAt" TIMESTAMPTZ(3) NOT NULL,
  CONSTRAINT "RequestLimit_pkey" PRIMARY KEY ("key")
);

CREATE INDEX "RequestLimit_expiresAt_idx" ON "RequestLimit"("expiresAt");
