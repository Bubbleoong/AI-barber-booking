import { notFound } from "next/navigation";
import { AppError } from "@/lib/errors";
import { getAdminBooking } from "@/features/admin/adminService";
import { BookingDetailView } from "@/views/admin/BookingDetailView";
import { requireAdminPage } from "@/features/auth/authorization";
import type { RouteContext } from "@/types/routes";
export const dynamic = "force-dynamic";
export default async function AdminBookingDetailPage({ params }: RouteContext<"bookingId">) {
  await requireAdminPage();
  let booking;
  try {
    booking = await getAdminBooking((await params).bookingId);
  } catch (error) {
    if (error instanceof AppError && error.code === "NOT_FOUND") notFound();
    throw error;
  }
  return <BookingDetailView booking={booking} />;
}
