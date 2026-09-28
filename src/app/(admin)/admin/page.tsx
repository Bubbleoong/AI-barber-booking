import { DashboardView } from "@/views/admin/DashboardView";
import { getAdminServices, getDashboardBookingStats } from "@/features/admin/adminService";
import { getAdminUsers } from "@/features/admin/roleService";
import { bangkokDate } from "@/lib/time";
import { requireAdminPage } from "@/features/auth/authorization";
export const dynamic = "force-dynamic";
export default async function AdminPage() {
  await requireAdminPage();
  const [bookingStats, services, users] = await Promise.all([
    getDashboardBookingStats(bangkokDate(new Date())),
    getAdminServices(),
    getAdminUsers(),
  ]);
  return (
    <DashboardView
      {...bookingStats}
      serviceCount={services.filter((service) => service.isActive).length}
      userCount={users.length}
    />
  );
}
