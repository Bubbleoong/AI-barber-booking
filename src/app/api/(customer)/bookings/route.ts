import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/features/auth/session";
import { AppError } from "@/lib/errors";
import { readJsonBody } from "@/contracts/jsonBody";
import { rejectCrossOrigin } from "@/features/auth/requestSecurity";
import { rateLimit } from "@/features/auth/rateLimit";
import { createBooking } from "@/features/booking/bookingService";

export const runtime = "nodejs";

function failure(error: unknown) {
  if (error instanceof AppError)
    return NextResponse.json(
      { error: error.code, message: error.message },
      { status: error.status },
    );
  console.error("Booking request failed", error);
  return NextResponse.json(
    { error: "INTERNAL_ERROR", message: "ไม่สามารถดำเนินการได้ในขณะนี้" },
    { status: 500 },
  );
}

export async function POST(request: NextRequest) {
  const rejected = rejectCrossOrigin(request);
  if (rejected) return rejected;
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  try {
    if (!(await rateLimit(`booking:${user.id}`, 10, 3600)))
      return NextResponse.json(
        { error: "RATE_LIMITED", message: "ทำรายการบ่อยเกินไป กรุณาลองอีกครั้งภายหลัง" },
        { status: 429 },
      );
    const booking = await createBooking(user.id, await readJsonBody(request));
    return NextResponse.json({ booking }, { status: 201 });
  } catch (error) {
    if (error instanceof SyntaxError)
      return NextResponse.json({ error: "INVALID_JSON" }, { status: 400 });
    return failure(error);
  }
}
