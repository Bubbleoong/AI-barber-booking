"use client";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { isAxiosError } from "axios";
import type { ApiErrorResponse } from "@/types/api";
import { adminClient } from "@/api-clients/admin/adminClient";
import type { ShopHoursEditorProps } from "@/types/admin";
import styles from "@styles/components/admin/ShopHoursEditor.module.css";
const labels: Record<string, string> = {
  MONDAY: "จันทร์",
  TUESDAY: "อังคาร",
  WEDNESDAY: "พุธ",
  THURSDAY: "พฤหัสบดี",
  FRIDAY: "ศุกร์",
  SATURDAY: "เสาร์",
  SUNDAY: "อาทิตย์",
};
const time = (minute: number | null) =>
  minute === null
    ? "09:00"
    : `${String(Math.floor(minute / 60)).padStart(2, "0")}:${String(minute % 60).padStart(2, "0")}`;
const minutes = (value: string) => Number(value.slice(0, 2)) * 60 + Number(value.slice(3));
export function ShopHoursEditor({ day }: ShopHoursEditorProps) {
  const router = useRouter();
  const [open, setOpen] = useState(day.isOpen);
  const [from, setFrom] = useState(time(day.openMinute));
  const [to, setTo] = useState(
    day.closeMinute === null ? "18:00" : day.closeMinute === 1440 ? "00:00" : time(day.closeMinute),
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function save(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      await adminClient.saveHours({
        day: day.day,
        isOpen: open,
        openMinute: open ? minutes(from) : null,
        closeMinute: open ? (to === "00:00" ? 1440 : minutes(to)) : null,
      });
      router.refresh();
    } catch (cause) {
      setError(
        isAxiosError<ApiErrorResponse>(cause)
          ? (cause.response?.data?.message ?? "บันทึกไม่สำเร็จ")
          : "บันทึกไม่สำเร็จ",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <form onSubmit={save} className={styles.row}>
      <div className={styles.heading}>
        <strong>{labels[day.day]}</strong>
        <label>
          <input
            type="checkbox"
            checked={open}
            onChange={(event) => setOpen(event.target.checked)}
          />{" "}
          เปิดร้าน
        </label>
      </div>
      <div className={styles.times}>
        <label>
          เวลาเปิด
          <input
            type="time"
            disabled={!open}
            value={from}
            onChange={(event) => setFrom(event.target.value)}
          />
        </label>
        <label>
          เวลาปิด
          <input
            type="time"
            disabled={!open}
            value={to}
            onChange={(event) => setTo(event.target.value)}
          />
        </label>
      </div>
      <button disabled={busy} type="submit">
        บันทึก
      </button>
      {error && <p role="alert">{error}</p>}
    </form>
  );
}
