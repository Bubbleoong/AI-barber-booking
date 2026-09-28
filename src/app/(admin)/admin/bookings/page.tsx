import { getAdminBookings } from "@/features/admin/adminService";
import { BookingsView } from "@/views/admin/BookingsView";
import { requireAdminPage } from "@/features/auth/authorization";
import { parseAdminBookingQuery } from "@/contracts/adminBookingQuery";
import type { PageQueryProps } from "@/types/routes";
export const dynamic = "force-dynamic";
export default async function AdminBookingsPage({ searchParams }: PageQueryProps) {
  await requireAdminPage();
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(await searchParams))
    if (typeof value === "string") params.set(key, value);
  const filters = parseAdminBookingQuery(params);
  const result = await getAdminBookings(filters);
  return <BookingsView {...result} filters={{ ...filters, page: result.page }} />;
}
