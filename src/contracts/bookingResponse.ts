import type { BookingDetails, BookingRecord } from "@/types/booking";

export function toBookingDetails(booking: BookingRecord): BookingDetails {
  const items = booking.items.map((item) => ({
    serviceId: item.serviceId,
    name: item.serviceNameSnapshot,
    priceBaht: item.priceBahtSnapshot,
    durationMinutes: item.durationMinutesSnapshot,
  }));
  return {
    bookingId: booking.bookingCode,
    status: booking.status,
    startAt: booking.startAt.toISOString(),
    endAt: booking.endAt.toISOString(),
    customerName: booking.customerName,
    phone: booking.phone,
    createdAt: booking.createdAt.toISOString(),
    items,
    totalPriceBaht: items.reduce((sum, item) => sum + item.priceBaht, 0),
    totalDurationMinutes: items.reduce((sum, item) => sum + item.durationMinutes, 0),
  };
}
