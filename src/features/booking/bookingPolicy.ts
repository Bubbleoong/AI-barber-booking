import { bangkokMinute } from "@/lib/time";

export function fitsShopHours(
  startAt: Date,
  durationMinutes: number,
  hours: {
    isOpen: boolean;
    openMinute: number | null;
    closeMinute: number | null;
  } | null,
) {
  if (!hours?.isOpen || hours.openMinute === null || hours.closeMinute === null)
    return false;
  const minute = bangkokMinute(startAt);
  return (
    minute >= hours.openMinute && minute + durationMinutes <= hours.closeMinute
  );
}
