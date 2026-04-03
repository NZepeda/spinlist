import { getRequestId } from "@/app/api/getRequestId";
import { getSpotifyErrorMetadata } from "@/server/spotify/getSpotifyErrorMetadata";
import { getOrCreateAlbumSlug } from "@/server/slugs/getOrCreateAlbumSlug";
import { getOrCreateArtistSlug } from "@/server/slugs/getOrCreateArtistSlug";
import { captureServerException } from "@/monitoring/captureServerException";
import { createClient } from "@/server/supabase/server";
import { NextRequest, NextResponse } from "next/server";

interface SlugResponseBody {
  eventId?: string;
  requestId: string;
  slug?: string;
}

/**
 * Retrieves the slug for the requested type.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const spotifyId = searchParams.get("spotifyId");
  const type = searchParams.get("type");
  const requestId = getRequestId(request);

  if (spotifyId === null || type === null) {
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
        path: request.nextUrl.pathname,
        requestId,
        spotifyId,
        type,
        ...spotifyErrorMetadata.context,
      },
      error,
      event: "slug_lookup_failed",
      tags: {
        route: request.nextUrl.pathname,
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

  return NextResponse.json(
    {
      error: "Invalid type requested",
      requestId,
    },
    { status: 400 },
  );
}
