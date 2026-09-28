import { NextResponse } from "next/server";
import { adminRoute } from "@/features/admin/adminRoute";
import { addBlockedTime } from "@/features/admin/scheduleService";
import { readJsonBody } from "@/contracts/jsonBody";
export const runtime = "nodejs";
export async function POST(request: Request) {
  return adminRoute(
    async () =>
      NextResponse.json(await addBlockedTime(await readJsonBody(request)), { status: 201 }),
    request,
  );
}
