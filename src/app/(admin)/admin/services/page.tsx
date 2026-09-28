import { getAdminServices } from "@/features/admin/adminService";
import { ServicesView } from "@/views/admin/ServicesView";
import { requireAdminPage } from "@/features/auth/authorization";
export const dynamic = "force-dynamic";
export default async function AdminServicesPage() {
  await requireAdminPage();
  return <ServicesView services={await getAdminServices()} />;
}
