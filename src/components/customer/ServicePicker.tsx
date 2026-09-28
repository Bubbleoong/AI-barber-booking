"use client";
import { useState } from "react";
import type { ServicePickerProps } from "@/types/bookingView";
import styles from "@styles/components/customer/ServicePicker.module.css";

const baht = new Intl.NumberFormat("th-TH");

export function ServicePicker({ services, selectedIds, onToggle }: ServicePickerProps) {
  const [page, setPage] = useState(1);
  const pageSize = 5;
  const pageCount = Math.max(1, Math.ceil(services.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  return (
    <section aria-labelledby="service-list-title">
      <div className={styles.header}>
        <h2 id="service-list-title" className={styles.title}>
          รายการบริการ
        </h2>
        <span className={styles.count}>
          {selectedIds.length > 0
            ? `เลือกแล้ว ${selectedIds.length} รายการ`
            : `${services.length} รายการ`}
        </span>
      </div>
      <div className={styles.list}>
        {services.slice((currentPage - 1) * pageSize, currentPage * pageSize).map((service) => {
          const selected = selectedIds.includes(service.id);
          return (
            <button
              key={service.id}
              type="button"
              aria-pressed={selected}
              onClick={() => onToggle(service.id)}
              className={styles.service}
            >
              <span className={styles.serviceInfo}>
                <span className={styles.serviceName}>{service.name}</span>
                <span className={styles.serviceDuration}>{service.durationMinutes} นาที</span>
              </span>
              <strong className={styles.servicePrice}>฿{baht.format(service.priceBaht)}</strong>
              <span className={styles.selection} aria-hidden="true">
                {selected ? "✓" : ""}
              </span>
              <span className={styles.selectionLabel}>{selected ? "เลือกแล้ว" : "เลือก"}</span>
            </button>
          );
        })}
      </div>
      {pageCount > 1 && (
        <nav className={styles.pagination} aria-label="หน้ารายการบริการ">
          <button
            type="button"
            className={styles.pageButton}
            disabled={currentPage === 1}
            onClick={() => setPage(currentPage - 1)}
          >
            ก่อนหน้า
          </button>
          <span className={styles.pageNumber}>
            {currentPage} / {pageCount}
          </span>
          <button
            type="button"
            className={styles.pageButton}
            disabled={currentPage === pageCount}
            onClick={() => setPage(currentPage + 1)}
          >
            ถัดไป
          </button>
        </nav>
      )}
    </section>
  );
}
