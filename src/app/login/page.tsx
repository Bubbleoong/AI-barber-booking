export const dynamic = "force-dynamic";

export default function LoginPage() {
  const loginHref = process.env.APP_URL
    ? new URL("/api/auth/line", process.env.APP_URL).toString()
    : "/api/auth/line";
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center gap-6 px-6">
      <h1 className="text-2xl font-semibold">เข้าสู่ระบบร้านตัดผม</h1>
      <p>ใช้บัญชี LINE เพื่อเข้าสู่ระบบและจองคิว</p>
      <a
        className="rounded bg-green-600 px-5 py-3 text-center font-medium text-white"
        href={loginHref}
      >
        เข้าสู่ระบบด้วย LINE
      </a>
      <p className="text-sm text-gray-600">
        หากกำลังตั้งค่า admin คนแรก หลังยืนยันกับ LINE หน้านี้จะแสดง LINE user ID
        ให้คัดลอกไปใช้ในไฟล์ .env
      </p>
    </main>
  );
}
