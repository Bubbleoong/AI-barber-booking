import styles from "@styles/app/(customer)/booking/bookingState.module.css";

export default function BookingLoading() {
  return (
    <main className={styles.loadingPage}>
      <div className={styles.loadingContent}>
        <div className={styles.loadingEyebrow} />
        <div className={styles.loadingTitle} />
        <div className={styles.loadingGrid}>
          {[0, 1, 2].map((item) => (
            <div key={item} className={styles.loadingCard} />
          ))}
        </div>
      </div>
    </main>
  );
}
