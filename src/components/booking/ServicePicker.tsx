import type { ServicePickerProps } from "@/types/bookingView";
import styles from "./ServicePicker.module.css";

const baht = new Intl.NumberFormat("th-TH");

export function ServicePicker({
  services,
  selectedIds,
  onToggle,
}: ServicePickerProps) {
  return (
    <section aria-labelledby="service-list-title">
      <div className={styles.headingRow}>
        <h2 id="service-list-title" className={styles.heading}>
          รายการบริการ
        </h2>
        <span className={styles.count}>{services.length} รายการ</span>
      </div>
      <div className={styles.grid}>
        {services.map((service) => {
          const selected = selectedIds.includes(service.id);
          return (
            <button
              key={service.id}
              type="button"
              aria-pressed={selected}
              onClick={() => onToggle(service.id)}
              className={styles.card}
            >
              <span className={styles.cardTop}>
                <span className={styles.icon} aria-hidden="true">
                  ✦
                </span>
                <span className={styles.check} aria-hidden="true">
                  ✓
                </span>
              </span>
              <span className={styles.serviceName}>{service.name}</span>
              <span className={styles.duration}>
                ใช้เวลา {service.durationMinutes} นาที
              </span>
              <span className={styles.priceRow}>
                <span className={styles.priceLabel}>ราคาบริการ</span>
                <span className={styles.price}>
                  ฿{baht.format(service.priceBaht)}
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
