import { redirect } from "next/navigation";
import { getCurrentUser } from "@/features/auth/session";

export async function requireAdminPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "ADMIN") redirect("/booking");
  return user;
}
