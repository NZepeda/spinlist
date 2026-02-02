import { Database } from "@/lib/types/database.types";

/**
 * Represents a complete review record from the database.
 */
export type Review = Database["public"]["Tables"]["reviews"]["Row"];

/**
 * Type for inserting a new review into the database.
 */
export type ReviewInsert = Database["public"]["Tables"]["reviews"]["Insert"];

/**
 * Type for updating an existing review in the database.
 */
export type ReviewUpdate = Database["public"]["Tables"]["reviews"]["Update"];
