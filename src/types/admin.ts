import type { BookingDetails } from "@/types/booking";
import type { UserRole } from "@/types/auth";

export type AdminService = {
  id: number;
  name: string;
  priceBaht: number;
  durationMinutes: number;
  isActive: boolean;
};
export type AdminUser = {
  id: string;
  displayName: string | null;
  lineUserId: string;
  role: UserRole;
  createdAt: string;
  isInitialAdmin: boolean;
};
export type AdminBooking = BookingDetails;
export type ShopDay = {
  day: string;
  isOpen: boolean;
  openMinute: number | null;
  closeMinute: number | null;
};
export type ShopHolidayItem = { id: number; date: string; reason: string | null };
export type BlockedTimeItem = { id: string; startAt: string; endAt: string; reason: string | null };
export type AdminSchedule = {
  hours: ShopDay[];
  holidays: ShopHolidayItem[];
  blockedTimes: BlockedTimeItem[];
};
export type DashboardViewProps = {
  todayCount: number;
  nextBooking: AdminBooking | null;
  serviceCount: number;
  userCount: number;
};
export type AdminBookingFilters = {
  date: string;
  status: "" | "CONFIRMED" | "CANCELLED" | "COMPLETED";
  query: string;
  page: number;
};
export type BookingsViewProps = {
  bookings: AdminBooking[];
  filters: AdminBookingFilters;
  total: number;
  pageSize: number;
};
export type ServicesViewProps = { services: AdminService[] };
export type ScheduleViewProps = { schedule: AdminSchedule };
export type UsersViewProps = { users: AdminUser[]; currentUserId: string };
export type AdminServiceInput = Omit<AdminService, "id">;
export type ServiceFormProps = { service?: AdminService; onRemoved?: () => void };
export type ShopHoursEditorProps = { day: ShopDay };
export type RoleSelectorProps = { user: AdminUser; disabled: boolean };
export type HolidayEditorProps = { holidays: ShopHolidayItem[] };
export type BlockedTimeEditorProps = { blockedTimes: BlockedTimeItem[] };
export type AdminBookingDetailViewProps = { booking: AdminBooking };
export type AdminCancelButtonProps = { bookingId: string };
export type BookingTableProps = { bookings: AdminBooking[] };
