import type { TimeSlotGridProps } from "@/types/bookingView";
import styles from "@styles/components/customer/TimeSlotGrid.module.css";

const bangkokTime = new Intl.DateTimeFormat("th-TH", {
  timeZone: "Asia/Bangkok",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

export function TimeSlotGrid({ slots, selected, loading, error, onSelect }: TimeSlotGridProps) {
  return (
    <section aria-labelledby="time-slots-title">
      <h2 id="time-slots-title" className={styles.title}>
        เวลาเริ่มรับบริการ
      </h2>
      {selected && !loading && !error ? (
        <p className={styles.selectedNotice} role="status">
          ✓ เลือกเวลา {bangkokTime.format(new Date(selected))} น. แล้ว
        </p>
      ) : null}
      {loading ? (
        <p role="status" className={styles.status}>
          กำลังตรวจสอบเวลาว่าง…
        </p>
      ) : null}
      {error ? (
        <p role="alert" className={styles.error}>
          {error}
        </p>
      ) : null}
      {!loading && !error && slots.length === 0 ? (
        <p className={styles.empty}>ไม่มีเวลาว่างในวันนี้ กรุณาเลือกวันอื่น</p>
      ) : null}
      {!loading && !error && slots.length > 0 ? (
        <div className={styles.grid} role="group" aria-label="เวลาว่าง">
          {slots.map((slot) => (
            <button
              key={slot}
              type="button"
              aria-pressed={slot === selected}
              onClick={() => onSelect(slot)}
              className={styles.slot}
            >
              <span>{bangkokTime.format(new Date(slot))}</span>
              {slot === selected ? (
                <span className={styles.slotCheck} aria-hidden="true">
                  ✓
                </span>
              ) : null}
            </button>
          ))}
        </div>
      ) : null}
    </section>
  );
}
