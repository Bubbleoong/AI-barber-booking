import { getDb } from "@/lib/db";
import { AppError } from "@/lib/errors";
import { parseRole } from "@/contracts/adminContract";
import { listUsers } from "@/repositories/userRepository";

export { listUsers as getAdminUsers };

export async function changeUserRole(actorId: string, userId: string, input: unknown) {
  const role = parseRole(input);
  return getDb().$transaction(async (tx) => {
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(7042027)`;
    const [actor, target, config] = await Promise.all([
      tx.user.findUnique({ where: { id: actorId } }),
      tx.user.findUnique({ where: { id: userId } }),
      tx.systemConfig.findUnique({ where: { id: 1 } }),
    ]);
    if (!actor || actor.role !== "ADMIN")
      throw new AppError("FORBIDDEN", "ไม่มีสิทธิ์จัดการผู้ใช้", 403);
    if (!target) throw new AppError("NOT_FOUND", "ไม่พบผู้ใช้", 404);
    if (role === "CUSTOMER" && (userId === actorId || userId === config?.initialAdminId))
      throw new AppError("PROTECTED_ADMIN", "ไม่สามารถลดสิทธิ์ผู้ดูแลคนนี้", 409);
    if (
      role === "CUSTOMER" &&
      target.role === "ADMIN" &&
      (await tx.user.count({ where: { role: "ADMIN" } })) <= 1
    )
      throw new AppError("LAST_ADMIN", "ต้องมีผู้ดูแลอย่างน้อยหนึ่งคน", 409);
    const updated = await tx.user.update({
      where: { id: userId },
      data: { role },
      select: { id: true, role: true },
    });
    return updated;
  });
}
