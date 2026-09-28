"use client";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { isAxiosError } from "axios";
import type { ApiErrorResponse } from "@/types/api";
import { adminClient } from "@/api-clients/admin/adminClient";
import type { BlockedTimeEditorProps } from "@/types/admin";
import styles from "@styles/components/admin/BlockedTimeEditor.module.css";
export function BlockedTimeEditor({ blockedTimes }: BlockedTimeEditorProps) {
  const router = useRouter();
  const [startAt, setStartAt] = useState("");
  const [endAt, setEndAt] = useState("");
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function add(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      await adminClient.addBlockedTime(`${startAt}:00+07:00`, `${endAt}:00+07:00`, reason);
      setStartAt("");
      setEndAt("");
      setReason("");
      router.refresh();
    } catch (cause) {
      setError(
        isAxiosError<ApiErrorResponse>(cause)
          ? (cause.response?.data?.message ?? "เพิ่มช่วงเวลาไม่สำเร็จ")
          : "เพิ่มช่วงเวลาไม่สำเร็จ",
      );
    } finally {
      setBusy(false);
    }
  }
  async function remove(id: string) {
    if (!window.confirm("ยืนยันลบช่วงปิดรับคิวนี้?")) return;
    setBusy(true);
    setError("");
    try {
      await adminClient.removeBlockedTime(id);
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
          ตั้งแต่
          <input
            type="datetime-local"
            required
            value={startAt}
            onChange={(event) => setStartAt(event.target.value)}
          />
        </label>
        <label>
          ถึง
          <input
            type="datetime-local"
            required
            value={endAt}
            onChange={(event) => setEndAt(event.target.value)}
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
        <button disabled={busy}>ปิดรับคิว</button>
      </form>
      {error && (
        <p role="alert" className={styles.error}>
          {error}
        </p>
      )}
      <ul>
        {blockedTimes.map((item) => (
          <li key={item.id}>
            <span>
              {new Date(item.startAt).toLocaleString("th-TH", { timeZone: "Asia/Bangkok" })} –{" "}
              {new Date(item.endAt).toLocaleString("th-TH", { timeZone: "Asia/Bangkok" })} ·{" "}
              {item.reason ?? "ปิดรับคิว"}
            </span>
            <button type="button" disabled={busy} onClick={() => remove(item.id)}>
              ลบ
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
