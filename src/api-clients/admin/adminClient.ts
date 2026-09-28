import axios from "axios";
import type { UserRole } from "@/types/auth";
import type { AdminServiceInput, ShopDay } from "@/types/admin";

export const adminClient = {
  createService: (data: AdminServiceInput) => axios.post("/api/admin/services", data),
  updateService: (id: number, data: AdminServiceInput) =>
    axios.patch(`/api/admin/services/${id}`, data),
  removeService: (id: number) => axios.delete(`/api/admin/services/${id}`),
  cancelBooking: (code: string) => axios.patch(`/api/admin/bookings/${encodeURIComponent(code)}`),
  setRole: (userId: string, role: UserRole) =>
    axios.patch(`/api/admin/users/${encodeURIComponent(userId)}/role`, {
      role,
    }),
  saveHours: (data: ShopDay) => axios.patch("/api/admin/schedule", data),
  addHoliday: (date: string, reason: string) => axios.post("/api/admin/holidays", { date, reason }),
  removeHoliday: (id: number) => axios.delete(`/api/admin/holidays/${id}`),
  addBlockedTime: (startAt: string, endAt: string, reason: string) =>
    axios.post("/api/admin/blocked-times", { startAt, endAt, reason }),
  removeBlockedTime: (id: string) =>
    axios.delete(`/api/admin/blocked-times/${encodeURIComponent(id)}`),
};
