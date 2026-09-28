"use client";

import { isAxiosError } from "axios";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { FormEvent } from "react";
import { ServicePicker } from "@/components/customer/ServicePicker";
import { BookingSummary } from "@/components/customer/BookingSummary";
import { BookingCard } from "@/components/customer/BookingCard";
import type { BookingDetails } from "@/types/booking";
import { DatePicker } from "@/components/customer/DatePicker";
import { TimeSlotGrid } from "@/components/customer/TimeSlotGrid";
import { parseCustomer } from "@/contracts/bookingContract";
import { MAX_ADVANCE_DAYS } from "@/domain/booking";
import type { BookingViewProps } from "@/types/bookingView";
import type { AvailabilityResponse, BookingResponse } from "@/types/bookingClient";
import { createBooking, getAvailability } from "@/api-clients/customer/bookingClient";
import { bangkokDate } from "@/lib/time";
import styles from "@styles/views/customer/booking/BookingView.module.css";

export function BookingView({ services }: BookingViewProps) {
  const router = useRouter();
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [step, setStep] = useState<1 | 2>(1);
  const [date, setDate] = useState("");
  const [slots, setSlots] = useState<string[]>([]);
  const [slot, setSlot] = useState("");
  const [availabilityLoading, setAvailabilityLoading] = useState(false);
  const [availabilityError, setAvailabilityError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [bookingError, setBookingError] = useState("");
  const [createdBooking, setCreatedBooking] = useState<BookingDetails | null>(null);
  const selected = useMemo(
    () => services.filter((service) => selectedIds.includes(service.id)),
    [services, selectedIds],
  );
  const now = new Date();
  const minDate = bangkokDate(now);
  const maxDate = bangkokDate(new Date(now.getTime() + MAX_ADVANCE_DAYS * 24 * 60 * 60 * 1000));

  useEffect(() => {
    if (step !== 2 || !date || selectedIds.length === 0) return;
    const controller = new AbortController();
    getAvailability(date, selectedIds, controller.signal)
      .then(({ data }) => {
        if (controller.signal.aborted) return;
        setSlots(Array.isArray(data.slots) ? data.slots : []);
        setAvailabilityLoading(false);
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        const message = isAxiosError<AvailabilityResponse>(error)
          ? (error.response?.data?.message ?? "ตรวจสอบเวลาว่างไม่สำเร็จ")
          : error instanceof Error
            ? error.message
            : "ตรวจสอบเวลาว่างไม่สำเร็จ";
        setAvailabilityError(message);
        setAvailabilityLoading(false);
      });
    return () => controller.abort();
  }, [step, date, selectedIds, refreshKey]);

  function toggleService(id: number) {
    setSlot("");
    setSelectedIds((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
  }

  function continueToSchedule() {
    if (selectedIds.length === 0) return;
    setDate(minDate);
    setAvailabilityLoading(true);
    setAvailabilityError("");
    setSlots([]);
    setSlot("");
    setBookingError("");
    setStep(2);
  }

  function changeDate(value: string) {
    setDate(value);
    setAvailabilityLoading(Boolean(value));
    setAvailabilityError("");
    setSlot("");
    setSlots([]);
    setBookingError("");
  }

  async function submitBooking(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBookingError("");
    if (!slot || !slots.includes(slot) || availabilityLoading) {
      setBookingError("กรุณาเลือกเวลาที่ว่างก่อนยืนยันการจอง");
      return;
    }
    try {
      const customer = parseCustomer({ customerName, phone });
      setSubmitting(true);
      const { data } = await createBooking({
        serviceIds: selectedIds,
        startAt: slot,
        ...customer,
      });
      if (!data.booking?.bookingId) throw new Error("ไม่ได้รับข้อมูลยืนยันการจอง");
      setCreatedBooking(data.booking);
    } catch (error) {
      if (isAxiosError<BookingResponse>(error)) {
        if (error.response?.status === 409) {
          setSlot("");
          setAvailabilityLoading(true);
          setAvailabilityError("");
          setRefreshKey((current) => current + 1);
        }
        if (error.response?.status === 401) {
          router.push("/login");
          return;
        }
        setBookingError(error.response?.data?.message ?? "ไม่สามารถจองคิวได้ กรุณาลองอีกครั้ง");
      } else {
        setBookingError(
          error instanceof Error ? error.message : "ไม่สามารถจองคิวได้ กรุณาลองอีกครั้ง",
        );
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (createdBooking) {
    return (
      <main className={styles.successPage}>
        <section className={styles.successCard}>
          <div className={styles.successIcon} aria-hidden="true">
            ✓
          </div>
          <h1 className={styles.successTitle}>จองคิวสำเร็จ</h1>
          <BookingCard booking={createdBooking} variant="full" />
          <div className={styles.successActions}>
            <Link
              href={`/my-bookings/${createdBooking.bookingId}`}
              className={styles.newBookingLink}
            >
              ดูรายละเอียดการจอง
            </Link>
            <Link href="/my-bookings" className={styles.historyLink}>
              ดูประวัติการจอง
            </Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <header className={styles.header}>
          <p className={styles.eyebrow}>BARBER BOOKING</p>
          <div className={styles.headerContent}>
            <div>
              <p className={styles.stepLabel}>
                ขั้นตอนที่ {step} จาก 2 · {step === 1 ? "เลือกบริการ" : "เลือกคิวและกรอกข้อมูล"}
              </p>
              <h1 className={styles.title}>
                {step === 1 ? "เลือกบริการที่ต้องการ" : "เลือกวันและเวลารับบริการ"}
              </h1>
            </div>
            <div className={styles.headerAside}>
              <p className={styles.intro}>
                {step === 1
                  ? "เลือกได้มากกว่าหนึ่งรายการ เราจะรวมราคาและเวลาให้ก่อนเลือกคิว"
                  : "เลือกเวลาว่าง แล้วกรอกชื่อและเบอร์โทรเพื่อยืนยันในหน้านี้"}
              </p>
              <Link href="/my-bookings" className={styles.historyLink}>
                ดูประวัติการจอง
              </Link>
            </div>
          </div>
        </header>
        {services.length === 0 ? (
          <section className={styles.emptyServices}>
            <h2 className={styles.emptyTitle}>ยังไม่มีบริการที่เปิดให้จอง</h2>
            <p className={styles.emptyText}>กรุณากลับมาตรวจสอบอีกครั้งภายหลัง</p>
          </section>
        ) : (
          <div className={styles.columns}>
            {step === 1 ? (
              <ServicePicker
                services={services}
                selectedIds={selectedIds}
                onToggle={toggleService}
              />
            ) : (
              <form onSubmit={submitBooking} className={styles.form}>
                <button
                  type="button"
                  onClick={() => {
                    setStep(1);
                    setSlot("");
                  }}
                  className={styles.backButton}
                >
                  ← กลับไปเลือกบริการ
                </button>
                <DatePicker value={date} min={minDate} max={maxDate} onChange={changeDate} />
                <TimeSlotGrid
                  slots={slots}
                  selected={slot}
                  loading={availabilityLoading}
                  error={availabilityError}
                  onSelect={(value) => {
                    setSlot(value);
                    setBookingError("");
                  }}
                />
                {availabilityError ? (
                  <button
                    type="button"
                    onClick={() => {
                      setAvailabilityLoading(true);
                      setAvailabilityError("");
                      setRefreshKey((current) => current + 1);
                    }}
                    className={styles.retryButton}
                  >
                    ลองโหลดเวลาว่างอีกครั้ง
                  </button>
                ) : null}
                <div className={styles.contactFields}>
                  <label className={styles.fieldLabel}>
                    ชื่อผู้รับบริการ
                    <input
                      type="text"
                      name="customerName"
                      autoComplete="name"
                      required
                      minLength={2}
                      maxLength={100}
                      value={customerName}
                      onChange={(event) => setCustomerName(event.target.value)}
                      className={styles.fieldInput}
                      placeholder="ชื่อและนามสกุล"
                    />
                  </label>
                  <label className={styles.fieldLabel}>
                    เบอร์มือถือ
                    <input
                      type="tel"
                      name="phone"
                      autoComplete="tel"
                      inputMode="tel"
                      required
                      pattern="0[689][0-9]{8}"
                      maxLength={10}
                      value={phone}
                      onChange={(event) => setPhone(event.target.value)}
                      className={styles.fieldInput}
                      placeholder="0812345678"
                    />
                    <span className={styles.fieldHint}>
                      เบอร์มือถือไทย 10 หลัก เริ่มด้วย 06, 08 หรือ 09
                    </span>
                  </label>
                </div>
                {bookingError ? (
                  <p role="alert" className={styles.bookingError}>
                    {bookingError}
                  </p>
                ) : null}
                <button
                  type="submit"
                  disabled={!slot || availabilityLoading || submitting}
                  className={styles.submitButton}
                >
                  {submitting ? "กำลังยืนยันการจอง…" : "ยืนยันการจอง"}
                </button>
              </form>
            )}
            <BookingSummary
              selected={selected}
              onContinue={step === 1 ? continueToSchedule : undefined}
              selectedSlot={step === 2 ? slot : undefined}
            />
          </div>
        )}
      </div>
    </main>
  );
}
