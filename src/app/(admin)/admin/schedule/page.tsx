import { getAdminSchedule } from "@/features/admin/scheduleService";
import { ScheduleView } from "@/views/admin/ScheduleView";
import { requireAdminPage } from "@/features/auth/authorization";
export const dynamic = "force-dynamic";
export default async function AdminSchedulePage() {
  await requireAdminPage();
  return <ScheduleView schedule={await getAdminSchedule()} />;
}
