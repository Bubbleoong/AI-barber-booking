import { NextResponse } from "next/server";
import { adminRoute } from "@/features/admin/adminRoute";
import { removeHoliday } from "@/features/admin/scheduleService";
import type { RouteContext } from "@/types/routes";
export const runtime = "nodejs";
export async function DELETE(request: Request, context: RouteContext<"holidayId">) {
  return adminRoute(
    async () => NextResponse.json(await removeHoliday(Number((await context.params).holidayId))),
    request,
  );
}
