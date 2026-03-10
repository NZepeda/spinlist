import type { ProfileRow } from "@/lib/types/db";
import type { Profile } from "@/lib/types/domain/profile";

/**
 * Maps a database profile row into the canonical profile model.
 */
export function mapProfileRowToProfile(profile: ProfileRow): Profile {
  return {
    id: profile.id,
    username: profile.username,
    avatarUrl: profile.avatar_url,
    createdAt: profile.created_at,
    updatedAt: profile.updated_at,
  };
}
