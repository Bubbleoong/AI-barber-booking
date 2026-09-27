"use client";

import styles from "./bookingState.module.css";

export default function BookingError({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className={styles.errorPage}>
      <section className={styles.errorCard}>
        <h1 className={styles.errorTitle}>โหลดบริการไม่สำเร็จ</h1>
        <p className={styles.errorText}>กรุณาลองใหม่อีกครั้ง หากยังไม่สำเร็จให้ติดต่อร้าน</p>
        <button type="button" onClick={reset} className={styles.retryButton}>ลองใหม่</button>
      </section>
    </main>
  );
}
