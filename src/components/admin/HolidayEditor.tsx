"use client";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { isAxiosError } from "axios";
import type { ApiErrorResponse } from "@/types/api";
import { adminClient } from "@/api-clients/admin/adminClient";
import type { HolidayEditorProps } from "@/types/admin";
import styles from "@styles/components/admin/HolidayEditor.module.css";
export function HolidayEditor({ holidays }: HolidayEditorProps) {
  const router = useRouter();
  const [date, setDate] = useState("");
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function add(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      await adminClient.addHoliday(date, reason);
      setDate("");
      setReason("");
      router.refresh();
    } catch (cause) {
      setError(
        isAxiosError<ApiErrorResponse>(cause)
          ? (cause.response?.data?.message ?? "เพิ่มวันหยุดไม่สำเร็จ")
          : "เพิ่มวันหยุดไม่สำเร็จ",
      );
    } finally {
      setBusy(false);
    }
  }
  async function remove(id: number) {
    if (!window.confirm("ยืนยันลบวันหยุดนี้?")) return;
    setBusy(true);
    setError("");
    try {
      await adminClient.removeHoliday(id);
      router.refresh();
    } catch (cause) {
      setError(
        isAxiosError<ApiErrorResponse>(cause)
          ? (cause.response?.data?.message ?? "ลบไม่สำเร็จ")
          : "ลบไม่สำเร็จ",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className={styles.wrap}>
      <form onSubmit={add} className={styles.form}>
        <label>
          วันที่
          <input
            type="date"
            required
            value={date}
            onChange={(event) => setDate(event.target.value)}
          />
        </label>
        <label>
          เหตุผล
          <input
            maxLength={200}
            value={reason}
            onChange={(event) => setReason(event.target.value)}
          />
        </label>
        <button disabled={busy}>เพิ่มวันหยุด</button>
      </form>
      {error && (
        <p role="alert" className={styles.error}>
          {error}
        </p>
      )}
      <ul>
        {holidays.map((holiday) => (
          <li key={holiday.id}>
            <span>
              {holiday.date} · {holiday.reason ?? "วันหยุด"}
            </span>
            <button type="button" disabled={busy} onClick={() => remove(holiday.id)}>
              ลบ
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
