import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { SESSION_COOKIE } from "@/features/auth/session";
import { getCurrentUser } from "@/features/auth/session";

export default async function CustomerLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) {
    console.warn("Customer session unavailable", { cookiePresent: (await cookies()).has(SESSION_COOKIE) });
    redirect("/login");
  }
  return children;
}
