import { getOrCreateAlbumSlug } from "@/lib/slugs/getOrCreateAlbumSlug";
import { getOrCreateArtistSlug } from "@/lib/slugs/getOrCreateArtistSlug";
import { logServerError } from "@/lib/logging/serverLogger";
import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

interface SlugResponseBody {
  requestId: string;
  slug?: string;
}

/**
 * Reuses an upstream request identifier when available so one failing lookup can
 * be correlated across platform logs and API responses.
 *
 * @param request - The incoming route handler request.
 * @returns A stable request identifier for this slug lookup.
 */
function getRequestId(request: NextRequest): string {
  const forwardedRequestId =
    request.headers.get("x-request-id") ?? request.headers.get("x-vercel-id");

  if (forwardedRequestId) {
    return forwardedRequestId;
  }

  return crypto.randomUUID();
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
    logServerError({
      context: {
        method: request.method,
        path: request.nextUrl.pathname,
        requestId,
        spotifyId,
        type,
      },
      error,
      event: "slug_lookup_failed",
    });

    return NextResponse.json(
      {
        error: "Failed to retrieve slug",
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
