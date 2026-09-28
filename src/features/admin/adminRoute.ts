import { NextResponse } from "next/server";
import { getCurrentUser } from "@/features/auth/session";
import { AppError } from "@/lib/errors";
import type { AuthenticatedUser } from "@/types/auth";
import { rejectCrossOrigin } from "@/features/auth/requestSecurity";

export async function adminRoute(
  action: (user: AuthenticatedUser) => Promise<NextResponse>,
  request?: Request,
) {
  if (request && request.method !== "GET") {
    const rejected = rejectCrossOrigin(request);
    if (rejected) return rejected;
  }
  const user = await getCurrentUser();
  if (!user)
    return NextResponse.json(
      { error: "UNAUTHORIZED", message: "กรุณาเข้าสู่ระบบ" },
      { status: 401 },
    );
  if (user.role !== "ADMIN")
    return NextResponse.json(
      { error: "FORBIDDEN", message: "ไม่มีสิทธิ์จัดการร้าน" },
      { status: 403 },
    );
  try {
    return await action(user);
  } catch (error) {
    if (error instanceof AppError)
      return NextResponse.json(
        { error: error.code, message: error.message },
        { status: error.status },
      );
    if (error instanceof SyntaxError)
      return NextResponse.json(
        { error: "INVALID_JSON", message: "ข้อมูลไม่ถูกต้อง" },
        { status: 400 },
      );
    console.error("Admin request failed", error);
    return NextResponse.json(
      { error: "INTERNAL_ERROR", message: "ไม่สามารถดำเนินการได้ในขณะนี้" },
      { status: 500 },
    );
  }
}
