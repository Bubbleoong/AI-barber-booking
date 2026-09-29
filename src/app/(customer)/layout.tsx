import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { SESSION_COOKIE } from "@/features/auth/session";
import { getCurrentUser } from "@/features/auth/session";
import { CustomerNav } from "@/components/customer/CustomerNav";
import type { RouteLayoutProps } from "@/types/routes";
import styles from "@styles/app/shell.module.css";

export default async function CustomerLayout({ children }: RouteLayoutProps) {
  const user = await getCurrentUser();
  if (!user) {
    console.warn("Customer session unavailable", {
      cookiePresent: (await cookies()).has(SESSION_COOKIE),
    });
    redirect("/login");
  }
  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <span className={styles.brand}>
          BARBER BOOKING
        </span>
        <span className={styles.greeting}>{user.displayName ?? "ลูกค้า"}</span>
      </header>
      <CustomerNav isAdmin={user.role === "ADMIN"} />
      {children}
    </div>
  );
}
