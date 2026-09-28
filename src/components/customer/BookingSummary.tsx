import type { BookingSummaryProps } from "@/types/bookingView";
import styles from "@styles/components/customer/BookingSummary.module.css";

const baht = new Intl.NumberFormat("th-TH");
const bangkokDateTime = new Intl.DateTimeFormat("th-TH", {
  timeZone: "Asia/Bangkok",
  dateStyle: "medium",
  timeStyle: "short",
});

export function BookingSummary({ selected, onContinue, selectedSlot }: BookingSummaryProps) {
  const totalPrice = selected.reduce((total, service) => total + service.priceBaht, 0);
  const totalMinutes = selected.reduce((total, service) => total + service.durationMinutes, 0);
  return (
    <>
      {onContinue && (
        <aside className={styles.mobileSummary} aria-label="สรุปบริการที่เลือก">
          <div className={styles.mobileDetails}>
            <strong>
              {selected.length} รายการ · ฿{baht.format(totalPrice)}
            </strong>
            <p className={styles.mobileDuration}>รวม {totalMinutes} นาที</p>
          </div>
          <button
            type="button"
            disabled={selected.length === 0}
            onClick={onContinue}
            className={styles.mobileButton}
          >
            เลือกวันและเวลา
          </button>
        </aside>
      )}
      <aside
        className={`${styles.summary} ${onContinue ? styles.desktopOnly : ""}`}
        aria-label="สรุปบริการที่เลือก"
      >
        <div className={styles.header}>
          <h2 className={styles.title}>สรุปรายการ</h2>
          <span className={styles.count}>{selected.length} รายการ</span>
        </div>
        {selected.length === 0 ? (
          <p className={styles.empty}>แตะรายการบริการเพื่อเลือก รายการที่เลือกจะปรากฏตรงนี้</p>
        ) : (
          <ul className={styles.items}>
            {selected.map((service) => (
              <li key={service.id} className={styles.item}>
                <span>{service.name}</span>
                <span className={styles.itemPrice}>฿{baht.format(service.priceBaht)}</span>
              </li>
            ))}
          </ul>
        )}
        <div className={styles.totals}>
          <div className={styles.durationRow}>
            <span>เวลารวม</span>
            <span className={styles.durationValue}>{totalMinutes} นาที</span>
          </div>
          <div className={styles.totalRow}>
            <span className={styles.totalLabel}>ยอดรวม</span>
            <strong className={styles.totalPrice}>฿{baht.format(totalPrice)}</strong>
          </div>
          {selectedSlot ? (
            <p className={styles.selectedSlot}>
              วันและเวลา: {bangkokDateTime.format(new Date(selectedSlot))}
            </p>
          ) : null}
        </div>
        {onContinue && (
          <button
            type="button"
            disabled={selected.length === 0}
            onClick={onContinue}
            className={styles.continueButton}
          >
            เลือกวันและเวลา
          </button>
        )}
      </aside>
    </>
  );
}
