import type { UserRow } from "@/server/database";

export type ProfileStatus = "active" | "pending";

/**
 * Canonical user record model used across the app.
 */
export type Profile = Omit<UserRow, "status"> & {
  status: ProfileStatus;
};
