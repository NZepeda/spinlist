import type { UserRow } from "@/server/database";
import type { Profile } from "@/shared/types/domain/profile";

/**
 * Normalizes a database user row into the shared app user model.
 * Concretely, narrows down the user status to either "active or "pending".
 */
export function mapProfileRowToProfile(user: UserRow): Profile {
  return {
    ...user,
    status: user.status === "active" ? "active" : "pending",
  };
}
