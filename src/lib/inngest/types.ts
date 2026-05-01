/**
 * Payload type for the MusicBrainz backfill job.
 */
export type MusicBrainzBackfillEventData = {
  releaseGroupId: string;
  spotifyTitle: string;
  spotifyArtistName: string;
  upc: string | null;
};
