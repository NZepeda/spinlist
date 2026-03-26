import type { ProfileRow } from "@/server/database";
import type { Profile } from "@/shared/types/domain/profile";

/**
 * Maps a database profile row into the application profile model.
 */
export function mapProfileRowToProfile(profile: ProfileRow): Profile {
  return {
    id: profile.id,
    username: profile.username,
    status: profile.status === "active" ? "active" : "pending",
    avatarUrl: profile.avatar_url,
    createdAt: profile.created_at,
    updatedAt: profile.updated_at,
  };
}
