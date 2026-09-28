import { NextRequest, NextResponse } from "next/server";
import { parseAvailabilityQuery } from "@/contracts/availabilityContract";
import { getAvailableSlots } from "@/features/booking/availabilityService";
import { BookingError } from "@/lib/errors";
import { getCurrentUser } from "@/features/auth/session";
import { rateLimit } from "@/features/auth/rateLimit";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
    if (!(await rateLimit(`availability:${user.id}`, 60, 60)))
      return NextResponse.json(
        { error: "RATE_LIMITED", message: "ตรวจสอบเวลาบ่อยเกินไป กรุณารอสักครู่" },
        { status: 429 },
      );
    const { date, serviceIds } = parseAvailabilityQuery(request.nextUrl.searchParams);
    return NextResponse.json(await getAvailableSlots(date, serviceIds));
  } catch (error) {
    if (error instanceof BookingError)
      return NextResponse.json(
        { error: error.code, message: error.message },
        { status: error.status },
      );
    console.error("Availability request failed", error);
    return NextResponse.json({ error: "INTERNAL_ERROR" }, { status: 500 });
  }
}
