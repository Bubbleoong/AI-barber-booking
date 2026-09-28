import { NextResponse } from "next/server";
import { adminRoute } from "@/features/admin/adminRoute";
import { saveShopHours } from "@/features/admin/scheduleService";
import { readJsonBody } from "@/contracts/jsonBody";
export const runtime = "nodejs";
export async function PATCH(request: Request) {
  return adminRoute(
    async () => NextResponse.json({ hours: await saveShopHours(await readJsonBody(request)) }),
    request,
  );
}
