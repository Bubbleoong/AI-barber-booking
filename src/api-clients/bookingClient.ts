import axios from "axios";
import type { AvailabilityResponse, BookingResponse, CreateBookingRequest } from "@/types/bookingClient";

export function getAvailability(date: string, serviceIds: number[], signal?: AbortSignal) {
  const query = new URLSearchParams({ date });
  serviceIds.forEach((id) => query.append("serviceId", String(id)));
  return axios.get<AvailabilityResponse>(`/api/availability?${query}`, { signal });
}

export function createBooking(request: CreateBookingRequest) {
  return axios.post<BookingResponse>("/api/bookings", request);
}

export function cancelBooking(bookingId: string) {
  return axios.patch(`/api/bookings/${encodeURIComponent(bookingId)}`);
}
