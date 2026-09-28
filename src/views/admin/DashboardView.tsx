import Link from "next/link";
import type { DashboardViewProps } from "@/types/admin";
import styles from "@styles/views/admin/DashboardView.module.css";

export function DashboardView({
  todayCount,
  nextBooking,
  serviceCount,
  userCount,
}: DashboardViewProps) {
  return (
    <main className={styles.page}>
      <p className={styles.eyebrow}>ADMIN DASHBOARD</p>
      <h1>ภาพรวมร้านวันนี้</h1>
      <div className={styles.grid}>
        <Link href="/admin/bookings" className={styles.card}>
          <span>คิววันนี้</span>
          <strong>{todayCount}</strong>
        </Link>
        <Link href="/admin/services" className={styles.card}>
          <span>บริการที่เปิดรับ</span>
          <strong>{serviceCount}</strong>
        </Link>
        <Link href="/admin/users" className={styles.card}>
          <span>ผู้ใช้</span>
          <strong>{userCount}</strong>
        </Link>
      </div>
      <section className={styles.next}>
        <h2>คิวถัดไป</h2>
        {nextBooking ? (
          <Link href={`/admin/bookings/${nextBooking.bookingId}`}>
            {nextBooking.bookingId} · {nextBooking.customerName} ·{" "}
            {new Date(nextBooking.startAt).toLocaleString("th-TH", { timeZone: "Asia/Bangkok" })}
          </Link>
        ) : (
          <p>ยังไม่มีคิวถัดไป</p>
        )}
      </section>
    </main>
  );
}
