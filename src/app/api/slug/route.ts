import { getRequestId } from "@/app/api/getRequestId";
import { ArtistSyncHardFailureError } from "@/server/artists/errors";
import { getSpotifyErrorMetadata } from "@/server/spotify/getSpotifyErrorMetadata";
import { getOrCreateAlbumSlug } from "@/server/slugs/getOrCreateAlbumSlug";
import { getOrCreateArtistSlug } from "@/server/slugs/getOrCreateArtistSlug";
import { captureServerException } from "@/monitoring/captureServerException";
import { logWorkflow } from "@/server/logging/logWorkflow";
import { createClient } from "@/server/supabase/server";
import type {
  ArtistSlugFailureResponse,
  ArtistSlugSuccessResponse,
  SlugErrorResponseBody,
  SlugSuccessResponse,
} from "@/shared/types";
import { NextRequest, NextResponse } from "next/server";

/**
 * Retrieves the slug for the requested entity (artist | album).
 */
export async function POST(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const spotifyId = searchParams.get("spotifyId");
  const type = searchParams.get("type");
  const requestId = getRequestId(request);
  const path = request.nextUrl.pathname;

  if (spotifyId === null || type === null) {
    logWorkflow({
      context: {
        hasSpotifyId: Boolean(spotifyId),
        method: request.method,
        path,
        requestId,
        type,
      },
      event: "slug_lookup",
      stage: "rejected",
      workflow: "slug_lookup",
    });

    return NextResponse.json(
      {
        error: "Missing parameters",
        requestId,
      },
      { status: 400 },
    );
  }

  const supabase = await createClient();

  try {
    if (type === "album") {
      const slug = await getOrCreateAlbumSlug(supabase, spotifyId);

      const responseBody: SlugSuccessResponse = {
        requestId,
        slug,
      };

      return NextResponse.json(responseBody);
    }

    if (type === "artist") {
      const artistSlugResult = await getOrCreateArtistSlug(supabase, spotifyId, {
        path,
        requestId,
      });

      const responseBody: ArtistSlugSuccessResponse = {
        requestId,
        slug: artistSlugResult.slug,
        syncStatus: artistSlugResult.syncStatus,
      };

      return NextResponse.json(responseBody);
    }
  } catch (error: unknown) {
    if (type === "artist" && error instanceof ArtistSyncHardFailureError) {
      const spotifyErrorMetadata = getSpotifyErrorMetadata(error);
      const eventId = captureServerException({
        context: {
          method: request.method,
          path,
          requestId,
          spotifyId,
          type,
          ...spotifyErrorMetadata.context,
        },
        error,
        event: "artist_slug_sync_failed",
        tags: {
          route: path,
          ...spotifyErrorMetadata.tags,
        },
      });

      const responseBody: ArtistSlugFailureResponse = {
        code: "ARTIST_SYNC_FAILED",
        error: "Failed to synchronize artist.",
        eventId,
        requestId,
      };

      return NextResponse.json(responseBody, { status: 500 });
    }

    const spotifyErrorMetadata = getSpotifyErrorMetadata(error);
    const eventId = captureServerException({
      context: {
        method: request.method,
        path,
        requestId,
        spotifyId,
        type,
        ...spotifyErrorMetadata.context,
      },
      error,
      event: "slug_lookup_failed",
      tags: {
        route: path,
        ...spotifyErrorMetadata.tags,
      },
    });

    return NextResponse.json(
      {
        error: "Failed to retrieve slug",
        eventId,
        requestId,
      } satisfies SlugErrorResponseBody,
      { status: 500 },
    );
  }

  logWorkflow({
    context: {
      method: request.method,
      path,
      reason: "invalid_type",
      requestId,
      spotifyId,
      type,
    },
    event: "slug_lookup",
    stage: "rejected",
    workflow: "slug_lookup",
  });

  return NextResponse.json(
    {
      error: "Invalid type requested",
      requestId,
    } satisfies SlugErrorResponseBody,
    { status: 400 },
  );
}
