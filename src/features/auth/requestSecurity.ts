import { NextResponse } from "next/server";

export function rejectCrossOrigin(request: Request): NextResponse | null {
  const origin = request.headers.get("origin");
  const expected = process.env.APP_URL
    ? new URL(process.env.APP_URL).origin
    : new URL(request.url).origin;
  if (!origin || origin !== expected) {
    return NextResponse.json(
      { error: "INVALID_ORIGIN", message: "คำขอไม่ได้มาจากเว็บไซต์นี้" },
      { status: 403 },
    );
  }
  return null;
}
