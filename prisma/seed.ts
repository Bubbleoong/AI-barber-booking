import "dotenv/config";
import { getDb } from "../src/lib/db";

async function main() {
  const lineUserId = process.env.LINE_ADMIN_USER_ID?.trim();
  if (!lineUserId) throw new Error("LINE_ADMIN_USER_ID is required to seed the initial admin");
  const db = getDb();

  try {
    await db.$transaction(async (tx) => {
      const existing = await tx.systemConfig.findUnique({ where: { id: 1 } });
      if (existing) {
        const user = await tx.user.findUnique({ where: { id: existing.initialAdminId } });
        if (user?.lineUserId !== lineUserId) {
          throw new Error("Initial admin has already been configured with a different LINE user ID");
        }
        return;
      }

      const admin = await tx.user.upsert({
        where: { lineUserId },
        create: { lineUserId, role: "ADMIN" },
        update: { role: "ADMIN" },
      });
      await tx.systemConfig.create({ data: { id: 1, initialAdminId: admin.id } });
    });
    console.log("Initial admin is configured");
  } finally {
    await db.$disconnect();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
