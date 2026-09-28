import { getDb } from "@/lib/db";

export async function rateLimit(
  key: string,
  limit: number,
  windowSeconds: number,
): Promise<boolean> {
  const expiresAt = new Date(Date.now() + windowSeconds * 1000);
  const rows = await getDb().$queryRaw<Array<{ count: number }>>`
    INSERT INTO "RequestLimit" ("key", "count", "expiresAt")
    VALUES (${key}, 1, ${expiresAt})
    ON CONFLICT ("key") DO UPDATE SET
      "count" = CASE WHEN "RequestLimit"."expiresAt" <= now() THEN 1 ELSE "RequestLimit"."count" + 1 END,
      "expiresAt" = CASE WHEN "RequestLimit"."expiresAt" <= now() THEN ${expiresAt} ELSE "RequestLimit"."expiresAt" END
    RETURNING "count"
  `;
  return rows[0].count <= limit;
}
