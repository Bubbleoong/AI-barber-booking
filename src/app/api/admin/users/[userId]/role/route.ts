import { NextResponse } from "next/server";
import { adminRoute } from "@/features/admin/adminRoute";
import { changeUserRole } from "@/features/admin/roleService";
import { readJsonBody } from "@/contracts/jsonBody";
import type { RouteContext } from "@/types/routes";
export const runtime = "nodejs";
export async function PATCH(request: Request, context: RouteContext<"userId">) {
  return adminRoute(
    async (user) =>
      NextResponse.json({
        user: await changeUserRole(
          user.id,
          (await context.params).userId,
          await readJsonBody(request),
        ),
      }),
    request,
  );
}
