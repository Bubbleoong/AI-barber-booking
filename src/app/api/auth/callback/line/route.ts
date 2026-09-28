import { timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { authenticateLineCode } from "@/features/auth/line";
import { roleDestination } from "@/features/auth/roleDestination";
import {
  cookieOptions,
  createSessionCookie,
  OAUTH_COOKIE,
  SESSION_COOKIE,
  SESSION_SECONDS,
  verifyOAuthCookie,
} from "@/features/auth/session";

export const runtime = "nodejs";

function sameState(left: string, right: string) {
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function GET(request: NextRequest) {
  const appUrl = process.env.APP_URL ?? request.nextUrl.origin;
  const failure = NextResponse.redirect(new URL("/login?error=line", appUrl));
  failure.cookies.delete(OAUTH_COOKIE);

  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");
  const oauthCookie = request.cookies.get(OAUTH_COOKIE)?.value;
  if (!code || !state || !oauthCookie) return failure;

  try {
    const expected = await verifyOAuthCookie(oauthCookie);
    if (!sameState(state, expected.state)) return failure;

    const result = await authenticateLineCode(code, expected.nonce);
    if (result.kind === "bootstrap") {
      const response = NextResponse.json(
        {
          lineUserId: result.lineUserId,
          nextStep:
            "Copy lineUserId to LINE_ADMIN_USER_ID in .env, run npm run db:seed-admin, then log in again.",
        },
        {
          headers: {
            "Cache-Control": "no-store",
            "Referrer-Policy": "no-referrer",
          },
        },
      );
      response.cookies.delete(OAUTH_COOKIE);
      response.cookies.delete(SESSION_COOKIE);
      return response;
    }
    const session = await createSessionCookie(result.user.id, result.user.sessionVersion);
    const response = NextResponse.redirect(new URL(roleDestination(result.user.role), appUrl));
    response.cookies.delete(OAUTH_COOKIE);
    response.cookies.set(SESSION_COOKIE, session, cookieOptions(SESSION_SECONDS));
    return response;
  } catch (error) {
    console.error("LINE Login callback failed", error);
    return failure;
  }
}
