"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { isAxiosError } from "axios";
import { cancelBooking } from "@/api-clients/bookingClient";
import type { CancelBookingButtonProps } from "@/types/booking";
import styles from "./CancelBookingButton.module.css";

const bangkokDateTime = new Intl.DateTimeFormat("th-TH", {
  timeZone: "Asia/Bangkok",
  dateStyle: "long",
  timeStyle: "short",
});

export function CancelBookingButton({ bookingId, startAt, serviceNames }: CancelBookingButtonProps) {
  const router = useRouter();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const openerRef = useRef<HTMLButtonElement>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [blocked, setBlocked] = useState(false);

  function openConfirmation() {
    setError("");
    setBlocked(false);
    dialogRef.current?.showModal();
  }

  function closeConfirmation() {
    if (pending) return;
    dialogRef.current?.close();
  }

  async function confirmCancellation() {
    if (pending || blocked) return;
    setPending(true);
    setError("");
    try {
      await cancelBooking(bookingId);
      dialogRef.current?.close();
      router.refresh();
    } catch (cause) {
      if (isAxiosError<{ error?: string; message?: string }>(cause)) {
        if (cause.response?.status === 401) {
          dialogRef.current?.close();
          router.push("/login");
          return;
        }
        const code = cause.response?.data?.error;
        if (code === "CONTACT_SHOP" || code === "NOT_CANCELLABLE") setBlocked(true);
        setError(cause.response?.data?.message ?? "ยกเลิกการจองไม่สำเร็จ กรุณาลองอีกครั้ง");
      } else {
        setError("ยกเลิกการจองไม่สำเร็จ กรุณาลองอีกครั้ง");
      }
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      <button ref={openerRef} type="button" onClick={openConfirmation} className={styles.button}>
        ยกเลิกการจอง
      </button>
      <dialog
        ref={dialogRef}
        className={styles.dialog}
        aria-labelledby="cancel-booking-title"
        aria-describedby="cancel-booking-description"
        onCancel={(event) => { if (pending) event.preventDefault(); }}
        onClose={() => { openerRef.current?.focus(); if (blocked) router.refresh(); }}
      >
        <h3 id="cancel-booking-title" className={styles.title}>ยืนยันการยกเลิกการจอง</h3>
        <p id="cancel-booking-description" className={styles.description}>
          กรุณาตรวจสอบรายการก่อนยืนยัน เมื่อยกเลิกแล้วคิวนี้จะไม่ถูกจองไว้
        </p>
        <div className={styles.bookingInfo}>
          <strong>{bookingId}</strong>
          <span>{bangkokDateTime.format(new Date(startAt))}</span>
          <span>{serviceNames.join(" · ")}</span>
        </div>
        {error ? <p role="alert" className={styles.error}>{error}</p> : null}
        <div className={styles.actions}>
          <button type="button" autoFocus onClick={closeConfirmation} disabled={pending} className={styles.backButton}>
            {blocked ? "ปิด" : "กลับไป"}
          </button>
          {!blocked ? (
            <button type="button" onClick={confirmCancellation} disabled={pending} className={styles.confirmButton}>
              {pending ? "กำลังยกเลิก…" : "ยืนยันการยกเลิก"}
            </button>
          ) : null}
        </div>
      </dialog>
    </>
  );
}
