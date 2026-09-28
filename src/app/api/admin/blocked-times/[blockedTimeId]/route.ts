import { NextResponse } from "next/server";
import { adminRoute } from "@/features/admin/adminRoute";
import { removeBlockedTime } from "@/features/admin/scheduleService";
import type { RouteContext } from "@/types/routes";
export const runtime = "nodejs";
export async function DELETE(request: Request, context: RouteContext<"blockedTimeId">) {
  return adminRoute(
    async () => NextResponse.json(await removeBlockedTime((await context.params).blockedTimeId)),
    request,
  );
}
