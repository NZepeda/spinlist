import type { Profile } from "@/shared/types";


/**
 * Returns whether the given profile is "active".
 * "active" means the user has confirmed their email.
 */
export function isActiveProfile(
  profile: Pick<Profile, "status">  | null | undefined,
): boolean {
  if (!profile) {
    return false;
  }

  return profile.status === "active";
}
