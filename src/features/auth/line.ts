import axios from "axios";
import { hasInitialAdmin, upsertLineUser } from "@/repositories/userRepository";
import type { VerifiedLineProfile } from "@/types/auth";

function lineConfig() {
  const clientId = process.env.AUTH_LINE_ID;
  const clientSecret = process.env.AUTH_LINE_SECRET;
  const appUrl = process.env.APP_URL;
  if (!clientId || !clientSecret || !appUrl) {
    throw new Error("LINE Login is not configured");
  }
  const origin = new URL(appUrl).origin;
  return {
    clientId,
    clientSecret,
    redirectUri: `${origin}/api/auth/callback/line`,
  };
}

export function createLineAuthorizationUrl(state: string, nonce: string) {
  const { clientId, redirectUri } = lineConfig();
  const url = new URL("https://access.line.me/oauth2/v2.1/authorize");
  url.searchParams.set("response_type", "code");
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("state", state);
  url.searchParams.set("scope", "openid profile");
  url.searchParams.set("nonce", nonce);
  return url;
}

export async function authenticateLineCode(code: string, nonce: string) {
  const { clientId, clientSecret, redirectUri } = lineConfig();
  const tokenResponse = await axios.post<unknown>(
    "https://api.line.me/oauth2/v2.1/token",
    new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri,
      client_id: clientId,
      client_secret: clientSecret,
    }),
    {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      validateStatus: () => true,
    },
  );
  if (tokenResponse.status < 200 || tokenResponse.status >= 300) {
    throw new Error("LINE token exchange failed");
  }
  const tokenData = tokenResponse.data;
  if (
    !tokenData ||
    typeof tokenData !== "object" ||
    !("id_token" in tokenData) ||
    typeof tokenData.id_token !== "string"
  ) {
    throw new Error("LINE did not return an ID token");
  }

  const verifyResponse = await axios.post<unknown>(
    "https://api.line.me/oauth2/v2.1/verify",
    new URLSearchParams({
      id_token: tokenData.id_token,
      client_id: clientId,
      nonce,
    }),
    {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      validateStatus: () => true,
    },
  );
  if (verifyResponse.status < 200 || verifyResponse.status >= 300) {
    throw new Error("LINE ID token verification failed");
  }
  const profile = verifyResponse.data;
  if (
    !profile ||
    typeof profile !== "object" ||
    !("sub" in profile) ||
    typeof profile.sub !== "string" ||
    !profile.sub
  ) {
    throw new Error("LINE profile is missing a user ID");
  }
  const verified: VerifiedLineProfile = {
    sub: profile.sub,
    name: "name" in profile && typeof profile.name === "string" ? profile.name : undefined,
    picture:
      "picture" in profile && typeof profile.picture === "string" ? profile.picture : undefined,
  };
  if (!(await hasInitialAdmin())) {
    return { kind: "bootstrap" as const, lineUserId: verified.sub };
  }

  const user = await upsertLineUser(verified);
  return { kind: "authenticated" as const, user };
}
