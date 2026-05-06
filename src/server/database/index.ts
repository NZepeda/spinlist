import type {
  CompositeTypes,
  Database,
  Enums,
  Json,
  Tables,
  TablesInsert,
  TablesUpdate,
} from "./generated/database.types";

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
export type FavoriteRow = Tables<"favorites">;
export type FollowRow = Tables<"follows">;
export type ReviewRow = Tables<"reviews">;
export type UserRow = Tables<"users">;

export type AlbumInsert = TablesInsert<"albums">;
export type ArtistInsert = TablesInsert<"artists">;
export type FavoriteInsert = TablesInsert<"favorites">;
export type FollowInsert = TablesInsert<"follows">;
export type ReviewInsert = TablesInsert<"reviews">;
export type UserInsert = TablesInsert<"users">;

export type AlbumUpdate = TablesUpdate<"albums">;
export type ArtistUpdate = TablesUpdate<"artists">;
export type FavoriteUpdate = TablesUpdate<"favorites">;
export type FollowUpdate = TablesUpdate<"follows">;
export type ReviewUpdate = TablesUpdate<"reviews">;
export type UserUpdate = TablesUpdate<"users">;
