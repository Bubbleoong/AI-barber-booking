"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { CustomerNavProps } from "@/types/navigation";
import styles from "@styles/components/customer/CustomerNav.module.css";

export function CustomerNav({ isAdmin }: CustomerNavProps) {
  const pathname = usePathname();
  return (
    <nav className={`${styles.nav} ${isAdmin ? styles.withAdmin : ""}`} aria-label="เมนูลูกค้า">
      <Link
        href="/booking"
        aria-current={pathname === "/booking" ? "page" : undefined}
        className={styles.link}
      >
        จองคิว
      </Link>
      <Link
        href="/my-bookings"
        aria-current={pathname.startsWith("/my-bookings") ? "page" : undefined}
        className={styles.link}
      >
        ประวัติของฉัน
      </Link>
      {isAdmin && (
        <Link href="/admin" className={`${styles.link} ${styles.adminLink}`}>
          กลับไปจัดการร้าน
        </Link>
      )}
    </nav>
  );
}
