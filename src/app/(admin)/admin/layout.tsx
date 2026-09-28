import Link from "next/link";
import Image from "next/image";
import { requireAdminPage } from "@/features/auth/authorization";
import { AdminNav } from "@/components/admin/AdminNav";
import type { RouteLayoutProps } from "@/types/routes";
import styles from "@styles/app/shell.module.css";

export default async function AdminLayout({ children }: RouteLayoutProps) {
  const user = await requireAdminPage();
  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <Link href="/admin" className={styles.brand}>
          <Image className={styles.logo} src="/barber-brand.png" alt="" width={38} height={38} />
          BARBER · ADMIN
        </Link>
        <span className={styles.greeting}>{user.displayName ?? "ผู้ดูแลร้าน"}</span>
      </header>
      <AdminNav />
      {children}
    </div>
  );
}
