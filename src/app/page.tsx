import { redirect } from "next/navigation";
import { getCurrentUser } from "@/features/auth/session";
import { roleDestination } from "@/features/auth/roleDestination";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const user = await getCurrentUser();
  redirect(user ? roleDestination(user.role) : "/login");
}
