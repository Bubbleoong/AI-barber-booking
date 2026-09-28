"use client";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { isAxiosError } from "axios";
import type { ApiErrorResponse } from "@/types/api";
import { adminClient } from "@/api-clients/admin/adminClient";
import type { AdminCancelButtonProps } from "@/types/admin";
import styles from "@styles/components/admin/AdminCancelButton.module.css";

export function AdminCancelButton({ bookingId }: AdminCancelButtonProps) {
  const dialog = useRef<HTMLDialogElement>(null);
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function cancel() {
    setBusy(true);
    setError("");
    try {
      await adminClient.cancelBooking(bookingId);
      dialog.current?.close();
      router.refresh();
    } catch (cause) {
      setError(
        isAxiosError<ApiErrorResponse>(cause)
          ? (cause.response?.data?.message ?? "ยกเลิกไม่สำเร็จ")
          : "ยกเลิกไม่สำเร็จ",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <button type="button" className={styles.trigger} onClick={() => dialog.current?.showModal()}>
        ยกเลิกคิว
      </button>
      <dialog
        ref={dialog}
        className={styles.dialog}
        onCancel={(event) => {
          if (busy) event.preventDefault();
        }}
      >
        <h2>ยืนยันการยกเลิกคิว?</h2>
        <p>คิว {bookingId} จะเปลี่ยนเป็นยกเลิกและคืนช่วงเวลาว่าง</p>
        {error && (
          <p role="alert" className={styles.error}>
            {error}
          </p>
        )}
        <div className={styles.actions}>
          <button type="button" disabled={busy} onClick={() => dialog.current?.close()}>
            กลับไป
          </button>
          <button type="button" disabled={busy} onClick={cancel}>
            {busy ? "กำลังยกเลิก…" : "ยืนยันการยกเลิก"}
          </button>
        </div>
      </dialog>
    </>
  );
}
