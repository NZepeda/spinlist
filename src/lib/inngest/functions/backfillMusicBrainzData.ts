import { eventType, staticSchema } from "inngest";
import { inngest } from "@/lib/inngest/client";
import type { MusicBrainzBackfillEventData } from "@/lib/inngest/types";
import { getReleaseGroup } from "@/server/musicbrainz/getReleaseGroup";
import { createServiceClient } from "@/server/supabase/service";

/**
 * Background job that fetches a MusicBrainz release group ID and saves it to the database.
 *
 * Runs at most one at a time and waits 3 seconds before each MusicBrainz request
 * to respect the API rate limit.
 */
export const backfillMusicBrainzData = inngest.createFunction(
  {
    id: "backfill-musicbrainz-data",
    // Only one execution at a time so concurrent jobs don't violate MusicBrainz rate limits
    concurrency: { limit: 1 },
    triggers: [
      eventType("release-group/musicbrainz.backfill", {
        schema: staticSchema<MusicBrainzBackfillEventData>(),
      }),
    ],
  },
  async ({ event, step }) => {
    // Wait before each request to stay within MusicBrainz's 1 req/sec rate limit
    await step.sleep("throttle", "3 seconds");

    const mbid = await step.run("fetch-musicbrainz", () =>
      getReleaseGroup({
        title: event.data.spotifyTitle,
        artistName: event.data.spotifyArtistName,
        upc: event.data.upc,
      }),
    );

    if (!mbid) {
      return { status: "not-found" };
    }

    await step.run("update-release-group", async () => {
      const supabase = createServiceClient();

      const { error } = await supabase
        .from("release_groups")
        .update({ mb_group_id: mbid })
        .eq("id", event.data.releaseGroupId);

      if (error) {
        throw new Error(`Failed to update release group: ${error.message}`);
      }
    });

    return { status: "success", mbid };
  },
);
