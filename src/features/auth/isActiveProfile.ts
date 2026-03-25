import type { Profile } from "@/shared/types";

interface ProfileStatusLike {
  status: string;
}

/**
 * Returns whether the given profile is "active".
 * "active" means the user has confirmed their email.
 */
export function isActiveProfile(
  profile: Pick<Profile, "status"> | ProfileStatusLike | null | undefined,
): boolean {
  if (!profile) {
    return false;
  }

  return profile.status === "active";
}
