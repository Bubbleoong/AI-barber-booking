import type { Metadata } from "next";
import { requireUser } from "@/features/auth/session";
import { listMyBookings } from "@/features/booking/bookingService";
import { MyBookingsView } from "@/views/customer/my-bookings/MyBookingsView";
import { parsePage } from "@/contracts/pagination";
import type { PageQueryProps } from "@/types/routes";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "ประวัติการจอง | Barber Booking" };

export default async function MyBookingsPage({ searchParams }: PageQueryProps) {
  const user = await requireUser();
  const rawPage = (await searchParams).page;
  const page = parsePage(typeof rawPage === "string" ? rawPage : undefined);
  return <MyBookingsView {...await listMyBookings(user.id, page)} />;
}
