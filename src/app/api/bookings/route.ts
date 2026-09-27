import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/features/auth/session";
import { BookingError } from "@/lib/errors";
import {
  createBooking,
  listMyBookings,
} from "@/features/booking/bookingService";

export const runtime = "nodejs";

function failure(error: unknown) {
  if (error instanceof BookingError)
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

export async function GET() {
  const user = await getCurrentUser();
  if (!user)
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  try {
    return NextResponse.json({ bookings: await listMyBookings(user.id) });
  } catch (error) {
    return failure(error);
  }
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user)
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  try {
    const booking = await createBooking(user.id, await request.json());
    return NextResponse.json({ booking }, { status: 201 });
  } catch (error) {
    if (error instanceof SyntaxError)
      return NextResponse.json({ error: "INVALID_JSON" }, { status: 400 });
    return failure(error);
  }
}
