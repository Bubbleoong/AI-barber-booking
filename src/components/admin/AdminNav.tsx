"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "@styles/components/admin/AdminNav.module.css";

export function AdminNav() {
  const pathname = usePathname();
  const current = (href: string) =>
    href === "/admin" ? pathname === href : pathname.startsWith(href);
  return (
    <nav className={styles.nav} aria-label="เมนูผู้ดูแล">
      <Link
        href="/admin"
        aria-current={current("/admin") ? "page" : undefined}
        className={styles.link}
      >
        ภาพรวม
      </Link>
      <Link
        href="/admin/bookings"
        aria-current={current("/admin/bookings") ? "page" : undefined}
        className={styles.link}
      >
        คิวจอง
      </Link>
      <Link
        href="/admin/services"
        aria-current={current("/admin/services") ? "page" : undefined}
        className={styles.link}
      >
        บริการ
      </Link>
      <Link
        href="/admin/schedule"
        aria-current={current("/admin/schedule") ? "page" : undefined}
        className={styles.link}
      >
        ตารางร้าน
      </Link>
      <Link
        href="/admin/users"
        aria-current={current("/admin/users") ? "page" : undefined}
        className={`${styles.link} ${styles.desktopOnly}`}
      >
        ผู้ใช้
      </Link>
      <Link
        href="/booking"
        className={`${styles.link} ${styles.desktopOnly} ${styles.customerLink}`}
      >
        หน้าลูกค้า
      </Link>
      <details key={pathname} className={styles.more}>
        <summary
          className={styles.link}
          aria-current={current("/admin/users") ? "page" : undefined}
        >
          เพิ่มเติม
        </summary>
        <div className={styles.menu}>
          <Link href="/admin/users" aria-current={current("/admin/users") ? "page" : undefined}>
            จัดการผู้ใช้
          </Link>
          <Link href="/booking">ดูหน้าลูกค้า</Link>
        </div>
      </details>
    </nav>
  );
}
