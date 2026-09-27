import type { BookingDetails } from "@/types/booking";

export type AvailabilityResponse = { slots?: string[]; message?: string };
export type BookingResponse = { booking?: BookingDetails; message?: string };
export type CreateBookingRequest = {
  serviceIds: number[];
  startAt: string;
  customerName: string;
  phone: string;
};
