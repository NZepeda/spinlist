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
export type MappingRow = Tables<"mappings">;
export type ReleaseGroupRow = Tables<"release_groups">;
export type ReviewRow = Tables<"reviews">;
export type UserRow = Tables<"users">;

export type AlbumInsert = TablesInsert<"albums">;
export type ArtistInsert = TablesInsert<"artists">;
export type FavoriteInsert = TablesInsert<"favorites">;
export type FollowInsert = TablesInsert<"follows">;
export type MappingInsert = TablesInsert<"mappings">;
export type ReleaseGroupInsert = TablesInsert<"release_groups">;
export type ReviewInsert = TablesInsert<"reviews">;
export type UserInsert = TablesInsert<"users">;

export type AlbumUpdate = TablesUpdate<"albums">;
export type ArtistUpdate = TablesUpdate<"artists">;
export type FavoriteUpdate = TablesUpdate<"favorites">;
export type FollowUpdate = TablesUpdate<"follows">;
export type MappingUpdate = TablesUpdate<"mappings">;
export type ReleaseGroupUpdate = TablesUpdate<"release_groups">;
export type ReviewUpdate = TablesUpdate<"reviews">;
export type UserUpdate = TablesUpdate<"users">;
