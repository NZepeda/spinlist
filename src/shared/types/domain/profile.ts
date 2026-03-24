/**
 * Canonical user profile model used across the app.
 */
export interface Profile {
  id: string;
  username: string;
  avatarUrl: string | null;
  createdAt: string;
  updatedAt: string;
}
