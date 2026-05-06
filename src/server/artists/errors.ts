/**
 * Signals that an artist cannot be routed because usable local discography data is missing.
 */
export class ArtistSyncHardFailureError extends Error {
  readonly artistSpotifyId: string;

  constructor(args: {
    artistSpotifyId: string;
    cause?: unknown;
    message: string;
  }) {
    super(args.message, {
      cause: args.cause,
    });
    this.artistSpotifyId = args.artistSpotifyId;
    this.name = "ArtistSyncHardFailureError";
  }
}
