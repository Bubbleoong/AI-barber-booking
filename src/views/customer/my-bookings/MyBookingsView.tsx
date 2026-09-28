import Link from "next/link";
import type { MyBookingsViewProps } from "@/types/booking";
import styles from "@styles/views/customer/my-bookings/MyBookingsView.module.css";

const dateTime = new Intl.DateTimeFormat("th-TH", {
  timeZone: "Asia/Bangkok",
  dateStyle: "medium",
  timeStyle: "short",
});
const money = new Intl.NumberFormat("th-TH");

export function MyBookingsView({ bookings, total, page, pageSize }: MyBookingsViewProps) {
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = Math.min(page, pageCount);
  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <header className={styles.header}>
          <h1 className={styles.title}>ประวัติการจอง</h1>
          <Link href="/booking" className={styles.newBookingLink}>
            จองคิวใหม่
          </Link>
        </header>
        {bookings.length === 0 ? (
          <section className={styles.emptyState}>
            <h2>ยังไม่มีรายการจอง</h2>
            <p>เมื่อจองคิวแล้ว รายการจะแสดงที่นี่</p>
            <Link href="/booking" className={styles.startLink}>
              เริ่มจองคิว
            </Link>
          </section>
        ) : (
          <>
            <div className={styles.list}>
              {bookings.map((booking) => (
                <Link
                  key={booking.bookingId}
                  href={`/my-bookings/${booking.bookingId}`}
                  className={styles.bookingCard}
                >
                  <span className={styles.cardRow}>
                    <strong className={styles.bookingCode}>{booking.bookingId}</strong>
                    <span className={styles.status} data-status={booking.status}>
                      {booking.status === "CONFIRMED"
                        ? "ยืนยันแล้ว"
                        : booking.status === "CANCELLED"
                          ? "ยกเลิกแล้ว"
                          : "เสร็จสิ้น"}
                    </span>
                  </span>
                  <span className={styles.cardMeta}>
                    <time dateTime={booking.startAt}>
                      {dateTime.format(new Date(booking.startAt))}
                    </time>
                    <strong className={styles.price}>
                      ฿{money.format(booking.totalPriceBaht)}
                    </strong>
                  </span>
                  <span className={styles.services}>
                    {booking.items.map((item) => item.name).join(" · ")}
                  </span>
                </Link>
              ))}
            </div>
            {pageCount > 1 && (
              <nav className={styles.pagination} aria-label="หน้าประวัติการจอง">
                {currentPage > 1 ? (
                  <Link className={styles.pageLink} href={`/my-bookings?page=${currentPage - 1}`}>
                    ก่อนหน้า
                  </Link>
                ) : (
                  <span className={styles.disabledPageLink}>ก่อนหน้า</span>
                )}
                <span className={styles.pageNumber}>
                  {currentPage} / {pageCount}
                </span>
                {currentPage < pageCount ? (
                  <Link className={styles.pageLink} href={`/my-bookings?page=${currentPage + 1}`}>
                    ถัดไป
                  </Link>
                ) : (
                  <span className={styles.disabledPageLink}>ถัดไป</span>
                )}
              </nav>
            )}
          </>
        )}
      </div>
    </main>
  );
}
