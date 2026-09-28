import type { ChangeEvent } from "react";
import type { DatePickerProps } from "@/types/bookingView";
import styles from "@styles/components/customer/DatePicker.module.css";

export function DatePicker({ value, min, max, onChange }: DatePickerProps) {
  return (
    <label className={styles.label}>
      วันที่รับบริการ
      <input
        type="date"
        required
        value={value}
        min={min}
        max={max}
        onChange={(event: ChangeEvent<HTMLInputElement>) => onChange(event.target.value)}
        className={styles.input}
      />
      <span className={styles.hint}>จองล่วงหน้าได้สูงสุด 30 วัน</span>
    </label>
  );
}
