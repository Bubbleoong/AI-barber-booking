import Link from "next/link";
import type { BookingTableProps } from "@/types/admin";
import styles from "@styles/components/admin/BookingTable.module.css";
export function BookingTable({ bookings }: BookingTableProps) {
  return (
    <div className={styles.root}>
      <div className={styles.mobileList}>
        {bookings.map((booking) => (
          <Link
            className={styles.mobileCard}
            key={booking.bookingId}
            href={`/admin/bookings/${booking.bookingId}`}
          >
            <span className={styles.cardRow}>
              <strong className={styles.code}>{booking.bookingId}</strong>
              <span className={styles.status} data-status={booking.status}>
                {booking.status === "CONFIRMED"
                  ? "ยืนยันแล้ว"
                  : booking.status === "CANCELLED"
                    ? "ยกเลิก"
                    : "เสร็จแล้ว"}
              </span>
            </span>
            <span className={styles.cardMeta}>
              <span>
                {new Date(booking.startAt).toLocaleString("th-TH", {
                  timeZone: "Asia/Bangkok",
                  dateStyle: "medium",
                  timeStyle: "short",
                })}{" "}
                · {booking.customerName}
              </span>
              <span aria-hidden="true">›</span>
            </span>
          </Link>
        ))}
      </div>
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>รหัส</th>
              <th>วันเวลา</th>
              <th>ลูกค้า</th>
              <th>บริการ</th>
              <th>สถานะ</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((booking) => (
              <tr key={booking.bookingId}>
                <td>{booking.bookingId}</td>
                <td>
                  {new Date(booking.startAt).toLocaleString("th-TH", { timeZone: "Asia/Bangkok" })}
                </td>
                <td>{booking.customerName}</td>
                <td>{booking.items.map((item) => item.name).join(", ")}</td>
                <td>{booking.status}</td>
                <td>
                  <Link
                    className={styles.detailsLink}
                    href={`/admin/bookings/${booking.bookingId}`}
                  >
                    ดูรายละเอียด
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {bookings.length === 0 && <p className={styles.empty}>ไม่พบคิวตามตัวกรอง</p>}
    </div>
  );
}
