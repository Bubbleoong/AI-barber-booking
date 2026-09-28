"use client";
import { useState, type FormEvent } from "react";
import { isAxiosError } from "axios";
import type { ApiErrorResponse } from "@/types/api";
import { useRouter } from "next/navigation";
import { adminClient } from "@/api-clients/admin/adminClient";
import type { ServiceFormProps } from "@/types/admin";
import styles from "@styles/components/admin/ServiceForm.module.css";

export function ServiceForm({ service, onRemoved }: ServiceFormProps) {
  const router = useRouter();
  const [name, setName] = useState(service?.name ?? "");
  const [price, setPrice] = useState(service?.priceBaht ?? 0);
  const [duration, setDuration] = useState(service?.durationMinutes ?? 30);
  const [active, setActive] = useState(service?.isActive ?? true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const data = { name, priceBaht: price, durationMinutes: duration, isActive: active };
    try {
      if (service) await adminClient.updateService(service.id, data);
      else {
        await adminClient.createService(data);
        setName("");
        setPrice(0);
        setDuration(30);
      }
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
  async function remove() {
    if (!service || !window.confirm(`ยืนยันลบบริการ ${service.name}?`)) return;
    setBusy(true);
    setError("");
    try {
      await adminClient.removeService(service.id);
      onRemoved?.();
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
    <form className={styles.form} onSubmit={submit}>
      <h2 className={styles.title}>{service ? `แก้ไขบริการ #${service.id}` : "เพิ่มบริการ"}</h2>
      <label className={styles.label}>
        ชื่อบริการ
        <input
          className={styles.input}
          required
          minLength={2}
          maxLength={100}
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
      </label>
      <label className={styles.label}>
        ราคา (บาท)
        <input
          className={styles.input}
          type="number"
          required
          min={0}
          max={100000}
          value={price}
          onChange={(event) => setPrice(Number(event.target.value))}
        />
      </label>
      <label className={styles.label}>
        ระยะเวลา (นาที)
        <input
          className={styles.input}
          type="number"
          required
          min={1}
          max={480}
          value={duration}
          onChange={(event) => setDuration(Number(event.target.value))}
        />
      </label>
      <label className={styles.checkboxLabel}>
        <input
          type="checkbox"
          checked={active}
          onChange={(event) => setActive(event.target.checked)}
        />
        เปิดรับจอง
      </label>
      {error && (
        <p role="alert" className={styles.error}>
          {error}
        </p>
      )}
      <button className={styles.saveButton} disabled={busy} type="submit">
        {busy ? "กำลังบันทึก…" : "บันทึก"}
      </button>
      {service && (
        <button className={styles.deleteButton} disabled={busy} type="button" onClick={remove}>
          ลบบริการ
        </button>
      )}
    </form>
  );
}
