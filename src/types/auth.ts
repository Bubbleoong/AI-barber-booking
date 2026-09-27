export type UserRole = "CUSTOMER" | "ADMIN";

export type AuthenticatedUser = {
  id: string;
  lineUserId: string;
  displayName: string | null;
  pictureUrl: string | null;
  role: UserRole;
};

export type VerifiedLineProfile = {
  sub: string;
  name?: string;
  picture?: string;
};
