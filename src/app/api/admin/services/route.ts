import { NextResponse } from "next/server";
import { adminRoute } from "@/features/admin/adminRoute";
import { addAdminService } from "@/features/admin/adminService";
import { readJsonBody } from "@/contracts/jsonBody";
export const runtime = "nodejs";
export async function POST(request: Request) {
  return adminRoute(
    async () =>
      NextResponse.json(
        { service: await addAdminService(await readJsonBody(request)) },
        { status: 201 },
      ),
    request,
  );
}
