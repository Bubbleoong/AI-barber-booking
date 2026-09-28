import { NextResponse } from "next/server";
import { adminRoute } from "@/features/admin/adminRoute";
import { cancelAdminBooking } from "@/features/admin/adminService";
import type { RouteContext } from "@/types/routes";
export const runtime = "nodejs";
export async function PATCH(request: Request, context: RouteContext<"bookingId">) {
  return adminRoute(
    async () => NextResponse.json(await cancelAdminBooking((await context.params).bookingId)),
    request,
  );
}
