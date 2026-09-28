import { RoleSelector } from "@/components/admin/RoleSelector";
import type { UsersViewProps } from "@/types/admin";
import styles from "@styles/views/admin/UsersView.module.css";
export function UsersView({ users, currentUserId }: UsersViewProps) {
  return (
    <main className={styles.page}>
      <h1>จัดการผู้ใช้</h1>
      <p>ผู้ใช้จะปรากฏหลังเข้าระบบด้วย LINE ครั้งแรก</p>
      <div className={styles.list}>
        {users.map((user) => (
          <article className={styles.card} key={user.id}>
            <div>
              <strong>{user.displayName ?? "ผู้ใช้ LINE"}</strong>
              <small>{user.lineUserId}</small>
              <small>
                เข้าระบบ{" "}
                {new Date(user.createdAt).toLocaleDateString("th-TH", {
                  timeZone: "Asia/Bangkok",
                })}
              </small>
              {user.isInitialAdmin && <span>ผู้ดูแลคนแรก</span>}
            </div>
            <RoleSelector user={user} disabled={user.isInitialAdmin || user.id === currentUserId} />
          </article>
        ))}
      </div>
    </main>
  );
}
