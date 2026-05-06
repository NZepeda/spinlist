import { SupabaseClient } from "@supabase/supabase-js";
import type { Database, TablesInsert } from "@/server/database";
import type { ArtistSlugSyncStatus } from "@/shared/types";
import { ArtistSyncHardFailureError } from "@/server/artists/errors";
import { hasStoredArtistAlbums } from "@/server/artists/hasStoredArtistAlbums";
import { isArtistDiscographyStale } from "@/server/artists/isArtistDiscographyStale";
import { queueArtistDiscographyRefresh } from "@/server/artists/queueArtistDiscographyRefresh";
import { syncArtistDiscography } from "@/server/artists/syncArtistDiscography";
import { generateSlug } from "./generateSlug";
import { findAvailableSlug } from "./findAvailableSlug";
import { getSpotifyArtist } from "../spotify/getSpotifyArtist";
import { imagesToJson } from "../spotify/imagesToJson";
import { SupabaseDependencyError } from "../supabase/SupabaseDependencyError";

interface ArtistSlugLookupResult {
  slug: string;
  syncStatus: ArtistSlugSyncStatus;
}

/**
 * Converts a sync failure into the hard artist-routing error used by the API route.
 *
 * @param artistSpotifyId - The Spotify artist identifier associated with the failure.
 * @param error - The original sync failure.
 * @returns The hard-failure error used to stop artist routing.
 */
function toArtistSyncHardFailure(
  artistSpotifyId: string,
  error: unknown,
): ArtistSyncHardFailureError {
  if (error instanceof ArtistSyncHardFailureError) {
    return error;
  }

  return new ArtistSyncHardFailureError({
    artistSpotifyId,
    cause: error,
    message: "Failed to synchronize artist discography.",
  });
}

/**
 * Gets an existing slug or creates a new one for an artist.
 *
 * When the artist is new, fetches details from Spotify and creates the canonical artist record before returning the slug.
 * Handles slug collisions by appending numbers (e.g., turnstile-2, turnstile-3).
 */
export async function getOrCreateArtistSlug(
  supabase: SupabaseClient<Database>,
  artistSpotifyId: string,
  options: {
    path: string;
    requestId: string;
  },
): Promise<ArtistSlugLookupResult> {
  const { path, requestId } = options;
  const { data: existing, error: existingError } = await supabase
    .from("artists")
    .select("discography_last_synced_at, id, slug")
    .eq("spotify_id", artistSpotifyId)
    .maybeSingle();

  if (existingError) {
    throw new SupabaseDependencyError({
      message: `Failed to query existing artist: ${existingError.message}`,
      operation: "select",
      resource: "artists",
      cause: existingError,
    });
  }

  if (existing !== null) {
    const hasAlbums = await hasStoredArtistAlbums(supabase, existing.id);

    if (hasAlbums) {
      if (!isArtistDiscographyStale(existing.discography_last_synced_at)) {
        return {
          slug: existing.slug,
          syncStatus: "fresh",
        };
      }

      queueArtistDiscographyRefresh({
        artistId: existing.id,
        artistSpotifyId,
        path,
        requestId,
        supabase,
      });

      return {
        slug: existing.slug,
        syncStatus: "refresh_queued",
      };
    }

    try {
      await syncArtistDiscography({
        artistId: existing.id,
        artistSpotifyId,
        supabase,
      });

      return {
        slug: existing.slug,
        syncStatus: "synced",
      };
    } catch (error: unknown) {
      throw toArtistSyncHardFailure(artistSpotifyId, error);
    }
  }

  // The artist doesn't exist in the database yet.
  // Fetch from Spotify to get the name and images needed to create the canonical record.
  const spotifyArtist = await getSpotifyArtist(artistSpotifyId);

  if (!spotifyArtist) {
    throw new ArtistSyncHardFailureError({
      artistSpotifyId,
      message: `Artist not found on Spotify: ${artistSpotifyId}`,
    });
  }

  try {
    const baseSlug = generateSlug(spotifyArtist.name);
    const slug = await findAvailableSlug(supabase, "artists", baseSlug);

    const artistInsert: TablesInsert<"artists"> = {
      images: imagesToJson(spotifyArtist.images ?? []),
      name: spotifyArtist.name,
      slug,
      spotify_id: artistSpotifyId,
    };

    const { data: insertedArtist, error: artistError } = await supabase
      .from("artists")
      .insert(artistInsert)
      .select("id, slug")
      .single();

    if (artistError) {
      throw new SupabaseDependencyError({
        message: `Failed to create artist: ${artistError.message}`,
        operation: "insert",
        resource: "artists",
        cause: artistError,
      });
    }

    await syncArtistDiscography({
      artistId: insertedArtist.id,
      artistSpotifyId,
      spotifyArtist,
      supabase,
    });

    return {
      slug: insertedArtist.slug,
      syncStatus: "synced",
    };
  } catch (error: unknown) {
    throw toArtistSyncHardFailure(artistSpotifyId, error);
  }
}
