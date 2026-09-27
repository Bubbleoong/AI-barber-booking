import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import { findUserById } from "@/repositories/userRepository";
import type { AuthenticatedUser } from "@/types/auth";

export const SESSION_COOKIE = "barber_session";
export const OAUTH_COOKIE = "barber_line_oauth";
export const SESSION_SECONDS = 7 * 24 * 60 * 60;

function secretKey() {
  const value = process.env.AUTH_SECRET;
  if (!value || value.length < 32) {
    throw new Error("AUTH_SECRET must be at least 32 characters");
  }
  return new TextEncoder().encode(value);
}

export function cookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production" && process.env.APP_URL?.startsWith("https://"),
    sameSite: "lax" as const,
    path: "/",
    maxAge,
  };
}

export async function createOAuthCookie(state: string, nonce: string) {
  return new SignJWT({ state, nonce })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuer("barber-booking")
    .setAudience("line-oauth")
    .setIssuedAt()
    .setExpirationTime("10m")
    .sign(secretKey());
}

export async function verifyOAuthCookie(token: string) {
  const { payload } = await jwtVerify(token, secretKey(), {
    issuer: "barber-booking",
    audience: "line-oauth",
  });
  if (typeof payload.state !== "string" || typeof payload.nonce !== "string") {
    throw new Error("Invalid OAuth cookie");
  }
  return { state: payload.state, nonce: payload.nonce };
}

export async function createSessionCookie(userId: string) {
  return new SignJWT({})
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(userId)
    .setIssuer("barber-booking")
    .setAudience("barber-session")
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secretKey());
}

export async function getCurrentUser(): Promise<AuthenticatedUser | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, secretKey(), {
      issuer: "barber-booking",
      audience: "barber-session",
    });
    if (!payload.sub) return null;
    const user = await findUserById(payload.sub);
    if (!user) return null;
    return {
      id: user.id,
      lineUserId: user.lineUserId,
      displayName: user.displayName,
      pictureUrl: user.pictureUrl,
      role: user.role,
    };
  } catch (error) {
    console.error("Session validation failed", error instanceof Error ? error.message : "unknown error");
    return null;
  }
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) throw new Error("UNAUTHORIZED");
  return user;
}

export async function requireAdmin() {
  const user = await requireUser();
  if (user.role !== "ADMIN") throw new Error("FORBIDDEN");
  return user;
}
