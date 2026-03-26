export type ProfileStatus = "active" | "pending";

/**
 * Canonical user profile model used across the app.
 */
export interface Profile {
  id: string;
  username: string;
  status: ProfileStatus;
  avatarUrl: string | null;
  createdAt: string;
  updatedAt: string;
}
