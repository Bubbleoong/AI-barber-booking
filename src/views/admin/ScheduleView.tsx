import { ShopHoursEditor } from "@/components/admin/ShopHoursEditor";
import { HolidayEditor } from "@/components/admin/HolidayEditor";
import { BlockedTimeEditor } from "@/components/admin/BlockedTimeEditor";
import type { ScheduleViewProps } from "@/types/admin";
import styles from "@styles/views/admin/ScheduleView.module.css";
const days = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"];
export function ScheduleView({ schedule }: ScheduleViewProps) {
  return (
    <main className={styles.page}>
      <h1>ตารางร้าน</h1>
      <p>หากมีคิวยืนยันอยู่ในเวลาที่จะปิด ระบบจะไม่บันทึกจนกว่าจะจัดการคิวนั้นก่อน</p>
      <section className={styles.section}>
        <h2>เวลาเปิดประจำสัปดาห์</h2>
        {days.map((day) => (
          <ShopHoursEditor
            key={day}
            day={
              schedule.hours.find((item) => item.day === day) ?? {
                day,
                isOpen: false,
                openMinute: null,
                closeMinute: null,
              }
            }
          />
        ))}
      </section>
      <section className={styles.section}>
        <h2>วันหยุดทั้งวัน</h2>
        <HolidayEditor holidays={schedule.holidays} />
      </section>
      <section className={styles.section}>
        <h2>ปิดรับคิวบางช่วง</h2>
        <BlockedTimeEditor blockedTimes={schedule.blockedTimes} />
      </section>
    </main>
  );
}
