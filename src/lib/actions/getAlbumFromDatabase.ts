import { createServerClient } from "@/lib/auth/server";
import { PostgrestError } from "@supabase/supabase-js";
import { Database } from "../types/supabase.types";

type DatabaseAlbum = Database["public"]["Tables"]["albums"]["Row"];

const NO_DATA_ERROR_CODE = "PGRST116";

/**
 * Fetches the album identified by the given ID from the database.
 * @param albumId The ID of the album to fetch.
 * @returns The album information from the database, or null if not found.
 */
export async function getAlbumFromDatabase(
  albumId: string
): Promise<DatabaseAlbum | null> {
  const supabase = await createServerClient();

  const { data, error } = await supabase
    .from("albums")
    .select("*")
    .eq("spotify_id", albumId)
    .single<DatabaseAlbum>();

  if (error) {
    if ((error as PostgrestError).code === NO_DATA_ERROR_CODE) {
      return null;
    }
    throw new Error(error.message);
  }

  return data;
}
