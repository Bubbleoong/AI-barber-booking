import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { createLineAuthorizationUrl } from "@/features/auth/line";
import {
  cookieOptions,
  createOAuthCookie,
  OAUTH_COOKIE,
} from "@/features/auth/session";

export const runtime = "nodejs";

export async function GET() {
  try {
    const state = randomBytes(24).toString("hex");
    const nonce = randomBytes(24).toString("hex");
    const url = createLineAuthorizationUrl(state, nonce);
    const response = NextResponse.redirect(url);
    response.cookies.set(
      OAUTH_COOKIE,
      await createOAuthCookie(state, nonce),
      cookieOptions(600),
    );
    return response;
  } catch {
    return NextResponse.json(
      { error: "LINE Login is not configured" },
      { status: 503 },
    );
  }
}
