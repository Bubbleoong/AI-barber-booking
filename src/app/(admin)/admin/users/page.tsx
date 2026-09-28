import { getAdminUsers } from "@/features/admin/roleService";
import { UsersView } from "@/views/admin/UsersView";
import { requireAdminPage } from "@/features/auth/authorization";
export const dynamic = "force-dynamic";
export default async function AdminUsersPage() {
  const user = await requireAdminPage();
  return <UsersView users={await getAdminUsers()} currentUserId={user.id} />;
}
