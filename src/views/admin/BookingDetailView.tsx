import Link from "next/link";
import { BookingCard } from "@/components/customer/BookingCard";
import { AdminCancelButton } from "@/components/admin/AdminCancelButton";
import type { AdminBookingDetailViewProps } from "@/types/admin";
import styles from "@styles/views/admin/BookingDetailView.module.css";
export function BookingDetailView({ booking }: AdminBookingDetailViewProps) {
  return (
    <main className={styles.page}>
      <Link href="/admin/bookings" className={styles.back}>
        ← กลับไปรายการคิว
      </Link>
      <h1>รายละเอียดคิว</h1>
      <BookingCard booking={booking} variant="full" />
      {booking.status === "CONFIRMED" && new Date(booking.startAt) > new Date() && (
        <div className={styles.actions}>
          <AdminCancelButton bookingId={booking.bookingId} />
        </div>
      )}
    </main>
  );
}
