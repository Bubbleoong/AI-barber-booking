import { getDb } from "@/lib/db";
import type { VerifiedLineProfile } from "@/types/auth";

export async function upsertLineUser(profile: VerifiedLineProfile) {
  return getDb().user.upsert({
    where: { lineUserId: profile.sub },
    create: {
      lineUserId: profile.sub,
      displayName: profile.name ?? null,
      pictureUrl: profile.picture ?? null,
    },
    update: {
      displayName: profile.name ?? null,
      pictureUrl: profile.picture ?? null,
    },
  });
}

export async function findUserById(id: string) {
  return getDb().user.findUnique({ where: { id } });
}

export async function hasInitialAdmin() {
  return (
    (await getDb().systemConfig.findUnique({
      where: { id: 1 },
      select: { id: true },
    })) !== null
  );
}

export async function listUsers() {
  const [users, config] = await Promise.all([
    getDb().user.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        displayName: true,
        lineUserId: true,
        role: true,
        createdAt: true,
      },
    }),
    getDb().systemConfig.findUnique({
      where: { id: 1 },
      select: { initialAdminId: true },
    }),
  ]);
  return users.map((user) => ({
    ...user,
    createdAt: user.createdAt.toISOString(),
    isInitialAdmin: user.id === config?.initialAdminId,
  }));
}
