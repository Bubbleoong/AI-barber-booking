"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { isAxiosError } from "axios";
import type { ApiErrorResponse } from "@/types/api";
import { adminClient } from "@/api-clients/admin/adminClient";
import type { RoleSelectorProps } from "@/types/admin";
import type { UserRole } from "@/types/auth";
import styles from "@styles/components/admin/RoleSelector.module.css";
export function RoleSelector({ user, disabled }: RoleSelectorProps) {
  const router = useRouter();
  const [role, setRole] = useState<UserRole>(user.role);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function save() {
    if (
      !window.confirm(
        `ยืนยันเปลี่ยนสิทธิ์เป็น ${role} สำหรับ ${user.displayName ?? user.lineUserId}?`,
      )
    )
      return;
    setBusy(true);
    setError("");
    try {
      await adminClient.setRole(user.id, role);
      router.refresh();
    } catch (cause) {
      setError(
        isAxiosError<ApiErrorResponse>(cause)
          ? (cause.response?.data?.message ?? "เปลี่ยนสิทธิ์ไม่สำเร็จ")
          : "เปลี่ยนสิทธิ์ไม่สำเร็จ",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className={styles.row}>
      <select
        aria-label={`สิทธิ์ของ ${user.displayName ?? user.lineUserId}`}
        disabled={disabled || busy}
        value={role}
        onChange={(event) => setRole(event.target.value as UserRole)}
      >
        <option value="CUSTOMER">CUSTOMER</option>
        <option value="ADMIN">ADMIN</option>
      </select>
      <button type="button" disabled={disabled || busy || role === user.role} onClick={save}>
        บันทึก
      </button>
      {error && (
        <span role="alert" className={styles.error}>
          {error}
        </span>
      )}
    </div>
  );
}
