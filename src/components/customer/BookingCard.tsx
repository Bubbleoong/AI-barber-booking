import Link from "next/link";
import type { BookingCardProps } from "@/types/booking";
import styles from "@styles/components/customer/BookingCard.module.css";

const money = new Intl.NumberFormat("th-TH");
const dateTime = new Intl.DateTimeFormat("th-TH", {
  timeZone: "Asia/Bangkok",
  dateStyle: "long",
  timeStyle: "short",
});
const statusText = {
  CONFIRMED: "ยืนยันแล้ว",
  CANCELLED: "ยกเลิกแล้ว",
  COMPLETED: "เสร็จสิ้น",
};

export function BookingCard({ booking, variant = "compact" }: BookingCardProps) {
  const full = variant === "full";
  return (
    <article className={styles.card}>
      <header className={styles.header}>
        <div>
          <p className={styles.label}>หมายเลขการจอง</p>
          <h2 className={styles.code}>{booking.bookingId}</h2>
        </div>
        <span className={styles.status} data-status={booking.status}>
          {statusText[booking.status]}
        </span>
      </header>
      <div className={styles.body}>
        <div>
          <p className={styles.label}>วันและเวลารับบริการ</p>
          <time className={styles.date} dateTime={booking.startAt}>
            {dateTime.format(new Date(booking.startAt))}
          </time>
        </div>
        {full ? (
          <>
            <div className={styles.contact}>
              <div>
                <p className={styles.label}>ชื่อผู้รับบริการ</p>
                <p>{booking.customerName}</p>
              </div>
              <div>
                <p className={styles.label}>เบอร์มือถือ</p>
                <p>{booking.phone}</p>
              </div>
            </div>
            <div>
              <p className={styles.label}>รายการบริการ</p>
              <ul className={styles.items}>
                {booking.items.map((item) => (
                  <li key={item.serviceId} className={styles.item}>
                    <span>
                      {item.name}{" "}
                      <span className={styles.duration}>· {item.durationMinutes} นาที</span>
                    </span>
                    <span>฿{money.format(item.priceBaht)}</span>
                  </li>
                ))}
              </ul>
            </div>
          </>
        ) : (
          <p className={styles.services}>{booking.items.map((item) => item.name).join(" · ")}</p>
        )}
      </div>
      <footer className={styles.footer}>
        <span className={styles.totalTime}>รวม {booking.totalDurationMinutes} นาที</span>
        <strong className={styles.totalPrice}>฿{money.format(booking.totalPriceBaht)}</strong>
        {!full ? (
          <Link className={styles.detailsLink} href={`/my-bookings/${booking.bookingId}`}>
            ดูรายละเอียด
          </Link>
        ) : null}
      </footer>
    </article>
  );
}
