import { getRequestId } from "@/app/api/getRequestId";
import { getSpotifyErrorMetadata } from "@/server/spotify/getSpotifyErrorMetadata";
import { getOrCreateAlbumSlug } from "@/server/slugs/getOrCreateAlbumSlug";
import { getOrCreateArtistSlug } from "@/server/slugs/getOrCreateArtistSlug";
import { captureServerException } from "@/monitoring/captureServerException";
import { logWorkflow } from "@/server/logging/logWorkflow";
import { createClient } from "@/server/supabase/server";
import { NextRequest, NextResponse } from "next/server";

interface SlugResponseBody {
  eventId?: string;
  requestId: string;
  slug?: string;
}

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

    const responseBody: SlugResponseBody = {
      requestId,
    };

    return NextResponse.json(
      {
        ...responseBody,
        error: "Missing parameters",
      },
      { status: 400 },
    );
  }

  const supabase = await createClient();

  try {
    if (type === "album") {
      const slug = await getOrCreateAlbumSlug(supabase, spotifyId);

      return NextResponse.json({
        requestId,
        slug,
      });
    }

    if (type === "artist") {
      const slug = await getOrCreateArtistSlug(supabase, spotifyId);

      return NextResponse.json({
        requestId,
        slug,
      });
    }
  } catch (error: unknown) {
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
      },
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
    },
    { status: 400 },
  );
}
