/**
 * Carries Spotify-specific failure metadata so upstream errors can be
 * distinguished from internal application failures at higher layers.
 */
export class SpotifyDependencyError extends Error {
  readonly dependency = "spotify";
  readonly operation: string;
  readonly resource: string;
  readonly status?: number;

  /**
   * Preserves the upstream operation context that explains which Spotify call failed.
   *
   * @param params - The Spotify failure details.
   */
  constructor(params: {
    cause?: unknown;
    message: string;
    operation: string;
    resource: string;
    status?: number;
  }) {
    super(params.message, params.cause ? { cause: params.cause } : undefined);
    this.name = "SpotifyDependencyError";
    this.operation = params.operation;
    this.resource = params.resource;
    this.status = params.status;
  }
}
