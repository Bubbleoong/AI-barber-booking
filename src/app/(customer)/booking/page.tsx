import type { Metadata } from "next";
import { BookingView } from "@/views/customer/booking/BookingView";
import { listActiveBookingServices } from "@/repositories/serviceRepository";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "จองคิว | Barber Booking",
  description: "เลือกบริการ วัน เวลา และกรอกข้อมูลเพื่อจองคิวตัดผม",
};

export default async function BookingPage() {
  const services = await listActiveBookingServices();
  return <BookingView services={services} />;
}
