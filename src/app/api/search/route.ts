import { NextRequest, NextResponse } from "next/server";
import { getRequestId } from "@/app/api/getRequestId";
import { captureServerException } from "@/monitoring/captureServerException";
import { getSpotifyErrorMetadata } from "@/server/spotify/getSpotifyErrorMetadata";
import { mapSpotifySearchResponseToSearchResponseDTO } from "@/server/spotify/mapSpotifySearchResponseToSearchResponseDto";
import { searchSpotify } from "@/server/spotify/searchSpotify";

export interface SearchErrorResponseBody {
  error: string;
  eventId?: string;
  requestId: string;
}

/**
 * Hits Spotify API to retrieve search results.
 * @param request - The incoming search request.
 * @returns Search results or a request-correlated error response.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q");
  const requestId = getRequestId(request);

  if (!query) {
    const responseBody: SearchErrorResponseBody = {
      error: "Missing query parameter",
      requestId,
    };

    return NextResponse.json(responseBody, { status: 400 });
  }

  try {
    const searchData = await searchSpotify(query);
    const responseDTO = mapSpotifySearchResponseToSearchResponseDTO(searchData);

    return NextResponse.json(responseDTO);
  } catch (error) {
    const spotifyErrorMetadata = getSpotifyErrorMetadata(error);
    const eventId = captureServerException({
      context: {
        method: request.method,
        path: request.nextUrl.pathname,
        query,
        requestId,
        ...spotifyErrorMetadata.context,
      },
      error,
      event: "search_request_failed",
      tags: {
        route: request.nextUrl.pathname,
        ...spotifyErrorMetadata.tags,
      },
    });

    const responseBody: SearchErrorResponseBody = {
      error: "Failed to search",
      eventId,
      requestId,
    };

    return NextResponse.json(responseBody, { status: 500 });
  }
}
