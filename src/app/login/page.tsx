import { redirect } from "next/navigation";
import Image from "next/image";
import { getCurrentUser } from "@/features/auth/session";
import { roleDestination } from "@/features/auth/roleDestination";
import styles from "@styles/app/login/login.module.css";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  const user = await getCurrentUser();
  if (user) redirect(roleDestination(user.role));
  const loginHref = process.env.APP_URL
    ? new URL("/api/auth/line", process.env.APP_URL).toString()
    : "/api/auth/line";
  return (
    <main className={styles.page}>
      <Image
        className={styles.logo}
        src="/barber-brand.png"
        alt="โลโก้ร้านตัดผม"
        width={128}
        height={128}
        priority
      />
      <span className={styles.eyebrow}>BARBER BOOKING</span>
      <h1 className={styles.title}>เข้าสู่ระบบร้านตัดผม</h1>
      <p>ใช้บัญชี LINE เพื่อเข้าสู่ระบบและจองคิว</p>
      <a className={styles.loginButton} href={loginHref}>
        เข้าสู่ระบบด้วย LINE
      </a>
      <p className={styles.hint}>
        หากกำลังตั้งค่า admin คนแรก หลังยืนยันกับ LINE หน้านี้จะแสดง LINE user ID
        ให้คัดลอกไปใช้ในไฟล์ .env
      </p>
    </main>
  );
}
