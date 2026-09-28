import type { UserRole } from "@/types/auth";

export function roleDestination(role: UserRole): "/admin" | "/booking" {
  return role === "ADMIN" ? "/admin" : "/booking";
}
