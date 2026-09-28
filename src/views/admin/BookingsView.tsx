import Link from "next/link";
import { BookingTable } from "@/components/admin/BookingTable";
import type { BookingsViewProps } from "@/types/admin";
import styles from "@styles/views/admin/BookingsView.module.css";
export function BookingsView({ bookings, filters, total, pageSize }: BookingsViewProps) {
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  function pageHref(page: number) {
    const params = new URLSearchParams();
    if (filters.date) params.set("date", filters.date);
    if (filters.status) params.set("status", filters.status);
    if (filters.query) params.set("q", filters.query);
    params.set("page", String(page));
    return `/admin/bookings?${params}`;
  }
  return (
    <main className={styles.page}>
      <h1 className={styles.title}>จัดการคิว</h1>
      <p className={styles.intro}>ค้นหาและกรองคิวของร้าน</p>
      <form method="get" className={styles.filters}>
        <label className={styles.filterLabel}>
          วันที่{" "}
          <input
            className={styles.filterInput}
            name="date"
            type="date"
            defaultValue={filters.date}
          />
        </label>
        <label className={styles.filterLabel}>
          สถานะ{" "}
          <select className={styles.filterInput} name="status" defaultValue={filters.status}>
            <option value="">ทั้งหมด</option>
            <option value="CONFIRMED">ยืนยันแล้ว</option>
            <option value="CANCELLED">ยกเลิก</option>
            <option value="COMPLETED">เสร็จแล้ว</option>
          </select>
        </label>
        <label className={styles.searchLabel}>
          ค้นหา{" "}
          <input
            className={styles.filterInput}
            name="q"
            maxLength={100}
            defaultValue={filters.query}
            placeholder="รหัสคิวหรือชื่อลูกค้า"
          />
        </label>
        <button className={styles.searchButton} type="submit">
          ค้นหา
        </button>
      </form>
      <BookingTable bookings={bookings} />
      {pageCount > 1 && (
        <nav className={styles.pagination} aria-label="หน้ารายการจอง">
          {filters.page > 1 ? (
            <Link className={styles.pageLink} href={pageHref(filters.page - 1)}>
              ก่อนหน้า
            </Link>
          ) : null}
          <span>
            {filters.page} / {pageCount} · {total} คิว
          </span>
          {filters.page < pageCount ? (
            <Link className={styles.pageLink} href={pageHref(filters.page + 1)}>
              ถัดไป
            </Link>
          ) : null}
        </nav>
      )}
    </main>
  );
}
