import { NextRequest, NextResponse } from "next/server";
import { parseAvailabilityQuery } from "@/contracts/availabilityContract";
import { getAvailableSlots } from "@/features/booking/availabilityService";
import { BookingError } from "@/lib/errors";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const { date, serviceIds } = parseAvailabilityQuery(request.nextUrl.searchParams);
    return NextResponse.json(await getAvailableSlots(date, serviceIds));
  } catch (error) {
    if (error instanceof BookingError) return NextResponse.json({ error: error.code, message: error.message }, { status: error.status });
    console.error("Availability request failed", error);
    return NextResponse.json({ error: "INTERNAL_ERROR" }, { status: 500 });
  }
}
