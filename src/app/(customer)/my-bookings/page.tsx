import type { Metadata } from "next";
import { requireUser } from "@/features/auth/session";
import { listMyBookings } from "@/features/booking/bookingService";
import { MyBookingsView } from "@/views/my-bookings/MyBookingsView";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "ประวัติการจอง | Barber Booking" };

export default async function MyBookingsPage() {
  const user = await requireUser();
  const bookings = await listMyBookings(user.id);
  return <MyBookingsView bookings={bookings} />;
}
