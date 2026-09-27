import { listActiveBookingServices } from "@/repositories/serviceRepository";

export async function getBookableServices() {
  return listActiveBookingServices();
}
