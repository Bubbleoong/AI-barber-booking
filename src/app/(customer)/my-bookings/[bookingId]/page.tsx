import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BookingError } from "@/lib/errors";
import { cancellationAllowed } from "@/domain/booking";
import { requireUser } from "@/features/auth/session";
import { getBookingDetails } from "@/features/booking/bookingService";
import { BookingDetailView } from "@/views/customer/my-bookings/BookingDetailView";
import type { BookingDetailPageProps, BookingDetails } from "@/types/booking";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "รายละเอียดการจอง | Barber Booking" };

export default async function BookingDetailPage({ params }: BookingDetailPageProps) {
  const user = await requireUser();
  const { bookingId } = await params;
  let booking: BookingDetails;
  try {
    booking = await getBookingDetails(user.id, bookingId);
  } catch (error) {
    if (error instanceof BookingError && error.code === "NOT_FOUND") notFound();
    throw error;
  }
  const canCancel =
    booking.status === "CONFIRMED" && cancellationAllowed(new Date(booking.startAt));
  return <BookingDetailView booking={booking} canCancel={canCancel} />;
}
