"use client";
import { useState } from "react";
import { ServiceForm } from "@/components/admin/ServiceForm";
import type { ServicesViewProps } from "@/types/admin";
import styles from "@styles/views/admin/ServicesView.module.css";
const pageSize = 10;
export function ServicesView({ services }: ServicesViewProps) {
  const [page, setPage] = useState(1);
  const [editingId, setEditingId] = useState<number | null>(null);
  const pageCount = Math.max(1, Math.ceil(services.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  return (
    <main className={styles.page}>
      <h1 className={styles.title}>จัดการบริการ</h1>
      <p className={styles.intro}>แตะบริการเพื่อแก้ไขหรือลบ ประวัติคิวเก่าจะคงข้อมูลเดิม</p>
      <details className={styles.addService}>
        <summary>+ เพิ่มบริการ</summary>
        <div className={styles.addForm}>
          <ServiceForm />
        </div>
      </details>
      <div className={styles.list}>
        {services.slice((currentPage - 1) * pageSize, currentPage * pageSize).map((service) => (
          <div className={styles.card} key={service.id}>
            <button
              type="button"
              className={styles.cardButton}
              aria-expanded={editingId === service.id}
              onClick={() => setEditingId(editingId === service.id ? null : service.id)}
            >
              <span className={styles.cardInfo}>
                <strong>{service.name}</strong>
                <small className={styles.cardDetails}>
                  {service.durationMinutes} นาที · {service.priceBaht} บาท
                </small>
              </span>
              <span className={styles.cardStatus}>
                {service.isActive ? "เปิดรับจอง" : "ปิดรับจอง"}
              </span>
            </button>
            {editingId === service.id && (
              <ServiceForm service={service} onRemoved={() => setEditingId(null)} />
            )}
          </div>
        ))}
      </div>
      {services.length === 0 && <p>ยังไม่มีบริการ</p>}
      {pageCount > 1 && (
        <nav className={styles.pagination} aria-label="หน้ารายการบริการ">
          <button
            className={styles.pageButton}
            type="button"
            disabled={currentPage === 1}
            onClick={() => setPage(currentPage - 1)}
          >
            ก่อนหน้า
          </button>
          <span>
            {currentPage} / {pageCount}
          </span>
          <button
            className={styles.pageButton}
            type="button"
            disabled={currentPage === pageCount}
            onClick={() => setPage(currentPage + 1)}
          >
            ถัดไป
          </button>
        </nav>
      )}
    </main>
  );
}
