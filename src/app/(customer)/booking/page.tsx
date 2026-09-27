import type { Metadata } from "next";
import { BookingView } from "@/views/booking/BookingView";
import { getBookableServices } from "@/features/catalog/catalogService";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "จองคิว | Barber Booking",
  description: "เลือกบริการ วัน เวลา และกรอกข้อมูลเพื่อจองคิวตัดผม",
};

export default async function BookingPage() {
  const services = await getBookableServices();
  return <BookingView services={services} />;
}
