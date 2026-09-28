import { parseServiceIds } from "@/contracts/bookingContract";
import { dayBounds } from "@/lib/time";

export function parseAvailabilityQuery(searchParams: URLSearchParams) {
  const date = searchParams.get("date") ?? "";
  dayBounds(date);
  const serviceIds = parseServiceIds(searchParams.getAll("serviceId").map(Number));
  return { date, serviceIds };
}
