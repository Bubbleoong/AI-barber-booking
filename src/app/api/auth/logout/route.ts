import { NextResponse } from "next/server";
import {
  getCurrentUser,
  OAUTH_COOKIE,
  revokeUserSessions,
  SESSION_COOKIE,
} from "@/features/auth/session";
import { rejectCrossOrigin } from "@/features/auth/requestSecurity";

export async function POST(request: Request) {
  const rejected = rejectCrossOrigin(request);
  if (rejected) return rejected;
  const user = await getCurrentUser();
  if (user) await revokeUserSessions(user.id);
  const response = NextResponse.json({ ok: true });
  response.cookies.delete(SESSION_COOKIE);
  response.cookies.delete(OAUTH_COOKIE);
  return response;
}
