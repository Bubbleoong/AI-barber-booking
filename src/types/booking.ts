import type { Prisma } from "@/generated/prisma/client";

export type BookingRecord = Prisma.BookingGetPayload<{ include: { items: true } }>;

export type BookingDetails = {
  bookingId: string;
  status: "CONFIRMED" | "CANCELLED" | "COMPLETED";
  startAt: string;
  endAt: string;
  customerName: string;
  phone: string;
  createdAt: string;
  items: {
    serviceId: number;
    name: string;
    priceBaht: number;
    durationMinutes: number;
  }[];
  totalPriceBaht: number;
  totalDurationMinutes: number;
};

export type BookingCardProps = {
  booking: BookingDetails;
  variant?: "compact" | "full";
};
export type MyBookingsViewProps = { bookings: BookingDetails[] };
export type BookingDetailViewProps = { booking: BookingDetails; canCancel: boolean };
export type CancelBookingButtonProps = {
  bookingId: string;
  startAt: string;
  serviceNames: string[];
};
export type BookingDetailPageProps = { params: Promise<{ bookingId: string }> };