import { after } from "next/server";
import { captureServerException } from "@/monitoring/captureServerException";
import { logWorkflow } from "@/server/logging/logWorkflow";
import type { Database } from "@/server/database";
import { SupabaseClient } from "@supabase/supabase-js";
import { syncArtistDiscography } from "./syncArtistDiscography";

/**
 * Queues a stale artist discography refresh after the current response has been returned.
 *
 * @param args - The canonical artist identity and request context used for background reporting.
 */
export function queueArtistDiscographyRefresh(args: {
  artistId: string;
  artistSpotifyId: string;
  path: string;
  requestId: string;
  supabase: SupabaseClient<Database>;
}): void {
  const { artistId, artistSpotifyId, path, requestId, supabase } = args;

  after(async () => {
    logWorkflow({
      context: {
        artistId,
        artistSpotifyId,
        path,
        requestId,
      },
      event: "artist_discography_refresh",
      stage: "started",
      workflow: "artist_discography_refresh",
    });

    try {
      await syncArtistDiscography({
        artistId,
        artistSpotifyId,
        supabase,
      });

      logWorkflow({
        context: {
          artistId,
          artistSpotifyId,
          path,
          requestId,
        },
        event: "artist_discography_refresh",
        stage: "succeeded",
        workflow: "artist_discography_refresh",
      });
    } catch (error: unknown) {
      captureServerException({
        context: {
          artistId,
          artistSpotifyId,
          path,
          requestId,
        },
        error,
        event: "artist_discography_refresh_failed",
        tags: {
          route: path,
        },
      });
    }
  });
}
