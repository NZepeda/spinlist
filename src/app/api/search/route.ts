import { NextRequest, NextResponse } from "next/server";
import { getRequestId } from "@/app/api/getRequestId";
import { captureServerException } from "@/monitoring/captureServerException";
import { logWorkflow } from "@/server/logging/logWorkflow";
import { getSpotifyErrorMetadata } from "@/server/spotify/getSpotifyErrorMetadata";
import { mapSpotifySearchResponseToSearchResponseDTO } from "@/server/spotify/mapSpotifySearchResponseToSearchResponseDto";
import { searchSpotify } from "@/server/spotify/searchSpotify";
import type { SearchErrorResponseBody } from "@/shared/types/api/search";

/**
 * Hits Spotify API to retrieve search results.
 * @param request - The incoming search request.
 * @returns Search results or a request-correlated error response.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q");
  const requestId = getRequestId(request);
  const path = request.nextUrl.pathname;

  if (!query) {
    logWorkflow({
      context: {
        method: request.method,
        path,
        reason: "missing_query",
        requestId,
      },
      event: "search_request",
      stage: "rejected",
      workflow: "search",
    });

    const responseBody: SearchErrorResponseBody = {
      error: "Missing query parameter",
      requestId,
    };

    return NextResponse.json(responseBody, { status: 400 });
  }

  try {
    logWorkflow({
      context: {
        method: request.method,
        path,
        queryLength: query.length,
        requestId,
      },
      event: "search_request",
      stage: "started",
      workflow: "search",
    });

    const spotifySearchResponse = await searchSpotify(query);
    const responseDTO = mapSpotifySearchResponseToSearchResponseDTO(
      spotifySearchResponse,
    );

    logWorkflow({
      context: {
        method: request.method,
        path,
        queryLength: query.length,
        requestId,
        query,
      },
      event: "search_request",
      stage: "succeeded",
      workflow: "search",
    });

    return NextResponse.json(responseDTO);
  } catch (error) {
    const spotifyErrorMetadata = getSpotifyErrorMetadata(error);
    const eventId = captureServerException({
      context: {
        method: request.method,
        path,
        queryLength: query.length,
        requestId,
        ...spotifyErrorMetadata.context,
      },
      error,
      event: "search_request_failed",
      tags: {
        route: path,
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
