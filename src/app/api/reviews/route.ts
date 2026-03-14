import { NextResponse } from "next/server";
import { mapAlbumRowToAlbum } from "@/lib/mappers/db/mapAlbumRowToAlbum";
import { createClient } from "@/lib/supabase/server";
import type { AlbumRow } from "@/lib/types/db";

interface ReviewRequestBody {
  albumId: string;
  rating: number;
  reviewText?: string;
  favoriteTrackId?: string;
  existingReviewId?: string;
}

interface ReviewErrorResponse {
  code:
    | "INVALID_REQUEST"
    | "UNAUTHORIZED"
    | "ALBUM_NOT_FOUND"
    | "INVALID_FAVORITE_TRACK"
    | "SAVE_FAILED";
  message: string;
}

interface ReviewSuccessResponse {
  ok: true;
}

/**
 * Returns a normalized favorite track id or null if none was selected.
 */
function normalizeFavoriteTrackId(favoriteTrackId?: string): string | null {
  const trimmedFavoriteTrackId = favoriteTrackId?.trim();

  if (!trimmedFavoriteTrackId) {
    return null;
  }

  return trimmedFavoriteTrackId;
}

/**
 * Validates the request body for review writes.
 */
function validateRequestBody(body: unknown): ReviewRequestBody | null {
  if (body === null || typeof body !== "object" || Array.isArray(body)) {
    return null;
  }

  const candidate = body as Record<string, unknown>;

  if (typeof candidate.albumId !== "string") {
    return null;
  }

  if (
    typeof candidate.rating !== "number" ||
    !Number.isFinite(candidate.rating)
  ) {
    return null;
  }

  if (
    candidate.reviewText !== undefined &&
    candidate.reviewText !== null &&
    typeof candidate.reviewText !== "string"
  ) {
    return null;
  }

  if (
    candidate.favoriteTrackId !== undefined &&
    candidate.favoriteTrackId !== null &&
    typeof candidate.favoriteTrackId !== "string"
  ) {
    return null;
  }

  if (
    candidate.existingReviewId !== undefined &&
    candidate.existingReviewId !== null &&
    typeof candidate.existingReviewId !== "string"
  ) {
    return null;
  }

  return {
    albumId: candidate.albumId,
    rating: candidate.rating,
    reviewText:
      typeof candidate.reviewText === "string"
        ? candidate.reviewText
        : undefined,
    favoriteTrackId:
      typeof candidate.favoriteTrackId === "string"
        ? candidate.favoriteTrackId
        : undefined,
    existingReviewId:
      typeof candidate.existingReviewId === "string"
        ? candidate.existingReviewId
        : undefined,
  };
}

/**
 * Verifies that the selected favorite track belongs to the album.
 */
function isFavoriteTrackValid(
  album: AlbumRow,
  favoriteTrackId: string | null,
): boolean {
  if (favoriteTrackId === null) {
    return true;
  }

  const validTrackIds = new Set(
    mapAlbumRowToAlbum(album).tracks.map((track) => track.id),
  );

  return validTrackIds.has(favoriteTrackId);
}

/**
 * Writes a review to the server.
 */
export async function POST(request: Request) {
  let requestBody: unknown;

  try {
    requestBody = await request.json();
  } catch {
    const response: ReviewErrorResponse = {
      code: "INVALID_REQUEST",
      message: "The review payload is invalid.",
    };

    return NextResponse.json(response, { status: 400 });
  }

  const parsedBody = validateRequestBody(requestBody);

  if (parsedBody === null) {
    const response: ReviewErrorResponse = {
      code: "INVALID_REQUEST",
      message: "The review payload is invalid.",
    };

    return NextResponse.json(response, { status: 400 });
  }

  const favoriteTrackId = normalizeFavoriteTrackId(parsedBody.favoriteTrackId);
  const reviewText = parsedBody.reviewText?.trim() ?? null;
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || user === null) {
    const response: ReviewErrorResponse = {
      code: "UNAUTHORIZED",
      message: "You must be logged in to save a review.",
    };

    return NextResponse.json(response, { status: 401 });
  }

  const { data: album, error: albumError } = await supabase
    .from("albums")
    .select("*")
    .eq("id", parsedBody.albumId)
    .single();

  if (albumError || album === null) {
    const response: ReviewErrorResponse = {
      code: "ALBUM_NOT_FOUND",
      message: "The album could not be found.",
    };

    return NextResponse.json(response, { status: 404 });
  }

  if (!isFavoriteTrackValid(album, favoriteTrackId)) {
    const response: ReviewErrorResponse = {
      code: "INVALID_FAVORITE_TRACK",
      message: "The selected favorite song does not belong to this album.",
    };

    return NextResponse.json(response, { status: 400 });
  }

  const reviewPayload = {
    album_id: parsedBody.albumId,
    favorite_track_id: favoriteTrackId,
    rating: parsedBody.rating,
    review_text: reviewText,
    user_id: user.id,
  };

  if (parsedBody.existingReviewId) {
    const { error: updateError } = await supabase
      .from("reviews")
      .update({
        favorite_track_id: reviewPayload.favorite_track_id,
        rating: reviewPayload.rating,
        review_text: reviewPayload.review_text,
        updated_at: new Date().toISOString(),
      })
      .eq("id", parsedBody.existingReviewId)
      .eq("user_id", user.id);

    if (updateError) {
      const response: ReviewErrorResponse = {
        code: "SAVE_FAILED",
        message: "The review could not be saved.",
      };

      return NextResponse.json(response, { status: 500 });
    }

    const successResponse: ReviewSuccessResponse = { ok: true };

    return NextResponse.json(successResponse, { status: 200 });
  }

  const { error: insertError } = await supabase
    .from("reviews")
    .insert(reviewPayload);

  if (insertError) {
    const response: ReviewErrorResponse = {
      code: "SAVE_FAILED",
      message: "The review could not be saved.",
    };

    return NextResponse.json(response, { status: 500 });
  }

  const successResponse: ReviewSuccessResponse = { ok: true };

  return NextResponse.json(successResponse, { status: 200 });
}
