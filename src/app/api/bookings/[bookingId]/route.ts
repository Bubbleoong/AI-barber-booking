import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/features/auth/session";
import { BookingError } from "@/lib/errors";
import { cancelBooking, getBookingDetails } from "@/features/booking/bookingService";

export const runtime = "nodejs";

type Context = { params: Promise<{ bookingId: string }> };

function failure(error: unknown) {
  if (error instanceof BookingError) {
    return NextResponse.json({ error: error.code, message: error.message }, { status: error.status });
  }
  console.error("Booking detail request failed", error);
  return NextResponse.json({ error: "INTERNAL_ERROR", message: "ไม่สามารถดำเนินการได้ในขณะนี้" }, { status: 500 });
}

export async function GET(_request: NextRequest, context: Context) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  try {
    const { bookingId } = await context.params;
    return NextResponse.json({ booking: await getBookingDetails(user.id, bookingId) });
  } catch (error) {
    return failure(error);
  }
}

export async function PATCH(_request: NextRequest, context: Context) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  try {
    const { bookingId } = await context.params;
    return NextResponse.json(await cancelBooking(user.id, bookingId));
  } catch (error) {
    return failure(error);
  }
}
