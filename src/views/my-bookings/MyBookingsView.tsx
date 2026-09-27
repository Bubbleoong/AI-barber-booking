import Link from "next/link";
import { BookingCard } from "@/components/booking/BookingCard";
import type { MyBookingsViewProps } from "@/types/booking";
import styles from "./MyBookingsView.module.css";

export function MyBookingsView({ bookings }: MyBookingsViewProps) {
  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <header className={styles.header}>
          <div>
            <p className={styles.eyebrow}>BARBER BOOKING</p>
            <h1 className={styles.title}>ประวัติการจองของฉัน</h1>
          </div>
          <Link href="/booking" className={styles.bookLink}>
            จองคิวใหม่
          </Link>
        </header>
        {bookings.length === 0 ? (
          <section className={styles.empty}>
            <h2>ยังไม่มีรายการจอง</h2>
            <p>เมื่อจองคิวแล้ว รายการจะแสดงที่นี่</p>
            <Link href="/booking" className={styles.bookLink}>
              เริ่มจองคิว
            </Link>
          </section>
        ) : (
          <div className={styles.grid}>
            {bookings.map((booking) => (
              <BookingCard key={booking.bookingId} booking={booking} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
