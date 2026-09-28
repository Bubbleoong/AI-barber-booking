import { parsePage } from "@/contracts/pagination";
import { dayBounds } from "@/lib/time";
import type { AdminBookingFilters } from "@/types/admin";

export function parseAdminBookingQuery(params: URLSearchParams): AdminBookingFilters {
  const date = params.get("date") ?? "";
  if (date) dayBounds(date);
  const rawStatus = params.get("status") ?? "";
  const status =
    rawStatus === "CONFIRMED" || rawStatus === "CANCELLED" || rawStatus === "COMPLETED"
      ? rawStatus
      : "";
  return {
    date,
    status,
    query: (params.get("q") ?? "").trim().slice(0, 100),
    page: parsePage(params.get("page")),
  };
}
