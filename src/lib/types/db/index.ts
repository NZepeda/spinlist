import type {
  CompositeTypes,
  Database,
  Enums,
  Json,
  Tables,
  TablesInsert,
  TablesUpdate,
} from "../generated/database.types";

export type {
  CompositeTypes,
  Database,
  Enums,
  Json,
  Tables,
  TablesInsert,
  TablesUpdate,
};

export type AlbumRow = Tables<"albums">;
export type ArtistRow = Tables<"artists">;
export type ProfileRow = Tables<"profiles">;
export type ReviewRow = Tables<"reviews">;
export type WaitlistRow = Tables<"waitlist">;

export type AlbumInsert = TablesInsert<"albums">;
export type ArtistInsert = TablesInsert<"artists">;
export type ProfileInsert = TablesInsert<"profiles">;
export type ReviewInsert = TablesInsert<"reviews">;
export type WaitlistInsert = TablesInsert<"waitlist">;

export type AlbumUpdate = TablesUpdate<"albums">;
export type ArtistUpdate = TablesUpdate<"artists">;
export type ProfileUpdate = TablesUpdate<"profiles">;
export type ReviewUpdate = TablesUpdate<"reviews">;
export type WaitlistUpdate = TablesUpdate<"waitlist">;
