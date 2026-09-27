import Link from "next/link";
import { BookingCard } from "@/components/booking/BookingCard";
import { CancelBookingButton } from "@/components/booking/CancelBookingButton";
import type { BookingDetailViewProps } from "@/types/booking";
import styles from "./BookingDetailView.module.css";

export function BookingDetailView({
  booking,
  canCancel,
}: BookingDetailViewProps) {
  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <Link href="/my-bookings" className={styles.backLink}>
          ← กลับไปประวัติการจอง
        </Link>
        <h1 className={styles.title}>รายละเอียดการจอง</h1>
        <BookingCard booking={booking} variant="full" />
        {booking.status === "CONFIRMED" ? (
          <section className={styles.cancelSection}>
            <h2 className={styles.cancelTitle}>ต้องการยกเลิกคิว?</h2>
            {canCancel ? (
              <>
                <p className={styles.cancelText}>
                  คุณยกเลิกเองได้ถึง 1 ชั่วโมงก่อนเวลารับบริการ
                </p>
                <CancelBookingButton
                  bookingId={booking.bookingId}
                  startAt={booking.startAt}
                  serviceNames={booking.items.map((item) => item.name)}
                />
              </>
            ) : (
              <p className={styles.cancelText}>
                เหลือเวลาน้อยกว่า 1 ชั่วโมงก่อนรับบริการ
                กรุณาติดต่อเจ้าของร้านเพื่อยกเลิกการจอง
              </p>
            )}
          </section>
        ) : null}
      </div>
    </main>
  );
}
