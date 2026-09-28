import { NextResponse } from "next/server";
import { adminRoute } from "@/features/admin/adminRoute";
import { editAdminService, removeAdminService } from "@/features/admin/adminService";
import { readJsonBody } from "@/contracts/jsonBody";
import type { RouteContext } from "@/types/routes";
export const runtime = "nodejs";
export async function PATCH(request: Request, context: RouteContext<"serviceId">) {
  return adminRoute(
    async () =>
      NextResponse.json(
        await editAdminService(
          Number((await context.params).serviceId),
          await readJsonBody(request),
        ),
      ),
    request,
  );
}
export async function DELETE(request: Request, context: RouteContext<"serviceId">) {
  return adminRoute(
    async () =>
      NextResponse.json(await removeAdminService(Number((await context.params).serviceId))),
    request,
  );
}
