import { bangkokMinute } from "@/lib/time";
import type { ShopHoursRule } from "@/types/schedule";

export function fitsShopHours(startAt: Date, durationMinutes: number, hours: ShopHoursRule) {
  if (!hours?.isOpen || hours.openMinute === null || hours.closeMinute === null) return false;
  const minute = bangkokMinute(startAt);
  return minute >= hours.openMinute && minute + durationMinutes <= hours.closeMinute;
}
