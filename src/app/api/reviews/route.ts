import { NextRequest, NextResponse } from "next/server";
import { SupabaseClient } from "@supabase/supabase-js";
import { isActiveProfile } from "@/features/auth/isActiveProfile";
import { getRequestId } from "@/app/api/getRequestId";
import { captureServerException } from "@/monitoring/captureServerException";
import { startSpan } from "@/monitoring/startSpan";
import type { Database } from "@/server/database";
import { mapAlbumRowToAlbum } from "@/server/database/mappers/mapAlbumRowToAlbum";
import { logWorkflow } from "@/server/logging/logWorkflow";
import { getSupabaseErrorMetadata } from "@/server/supabase/getSupabaseErrorMetadata";
import { SupabaseDependencyError } from "@/server/supabase/SupabaseDependencyError";
import { createClient } from "@/server/supabase/server";
import type { AlbumRow } from "@/server/database";
import type {
  ReviewErrorResponse,
  ReviewRequestBody,
  ReviewSuccessResponse,
} from "@/shared/types/api/reviews";

interface SupabaseErrorLike {
  code?: string | null;
  message: string;
}

type ReviewWorkflowOperation = "create" | "delete" | "save" | "update";

/**
 * Normalizes optional favorite-track input so blank form values do not become invalid foreign keys.
 */
function normalizeFavoriteTrackId(favoriteTrackId?: string): string | null {
  const trimmedFavoriteTrackId = favoriteTrackId?.trim();

  if (!trimmedFavoriteTrackId) {
    return null;
  }

  return trimmedFavoriteTrackId;
}

/**
 * Validates review input early so malformed payloads stay out of the monitored write path.
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
 * Enforces album ownership for favorite tracks so review writes cannot reference unrelated songs.
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
 * Reuses one pending-verification response so expected participation gates stay consistent and quiet.
 */
function createEmailConfirmationRequiredResponse() {
  const response: ReviewErrorResponse = {
    code: "EMAIL_CONFIRMATION_REQUIRED",
    message: "Please confirm your email before logging albums.",
  };

  return NextResponse.json(response, { status: 403 });
}

/**
 * Reuses one error response shape so request correlation survives every review-route failure path.
 *
 * @param params - The review route error payload.
 * @returns A JSON error response for the route handler.
 */
function createReviewErrorResponse(params: {
  code: ReviewErrorResponse["code"];
  eventId?: string;
  message: string;
  requestId: string;
  status: number;
}): Response {
  const response: ReviewErrorResponse = {
    code: params.code,
    eventId: params.eventId,
    message: params.message,
    requestId: params.requestId,
  };

  return NextResponse.json(response, { status: params.status });
}

/**
 * Records the lifecycle of review workflows without logging review text or other sensitive inputs.
 *
 * @param params - The workflow details.
 */
function logReviewWorkflow(params: {
  context?: Record<string, boolean | number | string | null | undefined>;
  event: string;
  operation: ReviewWorkflowOperation;
  reason?: string;
  stage: "rejected" | "started" | "succeeded";
}): void {
  logWorkflow({
    context: {
      ...params.context,
      operation: params.operation,
      reason: params.reason,
    },
    event: params.event,
    stage: params.stage,
    workflow: "reviews",
  });
}

/**
 * Wraps backend service failures so monitoring can distinguish Supabase issues from expected review outcomes.
 *
 * @param params - The backend failure details.
 * @returns A typed dependency error for hosted monitoring.
 */
function createSupabaseDependencyError(params: {
  error: SupabaseErrorLike;
  operation: string;
  resource: string;
}): SupabaseDependencyError {
  return new SupabaseDependencyError({
    cause: params.error,
    code: params.error.code ?? undefined,
    message: `${params.operation} failed: ${params.error.message}`,
    operation: params.operation,
    resource: params.resource,
  });
}

/**
 * Reports actionable review-route failures so write-path issues can be correlated across logs and Sentry.
 *
 * @param params - The route failure details.
 * @returns The created Sentry event identifier when available.
 */
function captureReviewFailure(params: {
  context: Record<string, boolean | number | string | null | undefined>;
  error: unknown;
  event: string;
  path: string;
}): string | undefined {
  const supabaseErrorMetadata = getSupabaseErrorMetadata(params.error);

  return captureServerException({
    context: {
      ...params.context,
      ...supabaseErrorMetadata.context,
    },
    error: params.error,
    event: params.event,
    tags: {
      route: params.path,
      ...supabaseErrorMetadata.tags,
    },
  });
}

/**
 * Separates profile-gate behavior from backend lookup failures so only real dependency problems create monitoring issues.
 */
async function ensureActiveProfile(
  supabase: SupabaseClient<Database>,
  userId: string,
): Promise<Response | SupabaseDependencyError | null> {
  const { data: profile, error: profileError } = await startSpan(
    {
      name: "supabase.user.read",
      op: "db.supabase",
    },
    async () =>
      await supabase
        .from("users")
        .select("status")
        .eq("id", userId)
        .maybeSingle(),
  );

  if (profileError) {
    return createSupabaseDependencyError({
      error: profileError,
      operation: "supabase.user.read",
      resource: "users",
    });
  }

  if (!isActiveProfile(profile)) {
    return createEmailConfirmationRequiredResponse();
  }

  return null;
}

/**
 * Keeps review creation and updates inside one monitored boundary so write failures share the same correlation and dependency rules.
 */
export async function POST(request: NextRequest) {
  const requestId = getRequestId(request);
  const path = new URL(request.url).pathname;
  let requestBody: unknown;

  try {
    requestBody = await request.json();
  } catch {
    logReviewWorkflow({
      context: {
        method: request.method,
        path,
        requestId,
      },
      event: "review_mutation",
      operation: "save",
      reason: "invalid_json",
      stage: "rejected",
    });

    return createReviewErrorResponse({
      code: "INVALID_REQUEST",
      message: "The review payload is invalid.",
      requestId,
      status: 400,
    });
  }

  const parsedBody = validateRequestBody(requestBody);

  if (parsedBody === null) {
    logReviewWorkflow({
      context: {
        method: request.method,
        path,
        requestId,
      },
      event: "review_mutation",
      operation: "save",
      reason: "invalid_payload",
      stage: "rejected",
    });

    return createReviewErrorResponse({
      code: "INVALID_REQUEST",
      message: "The review payload is invalid.",
      requestId,
      status: 400,
    });
  }

  const favoriteTrackId = normalizeFavoriteTrackId(parsedBody.favoriteTrackId);
  const reviewText = parsedBody.reviewText?.trim() ?? null;
  const operation: ReviewWorkflowOperation = parsedBody.existingReviewId
    ? "update"
    : "create";

  logReviewWorkflow({
    context: {
      albumId: parsedBody.albumId,
      existingReviewId: parsedBody.existingReviewId ?? null,
      hasFavoriteTrack: favoriteTrackId !== null,
      hasReviewText: reviewText !== null,
      method: request.method,
      path,
      requestId,
    },
    event: "review_mutation",
    operation,
    stage: "started",
  });

  const supabase = await createClient();
  const userResult = await startSpan(
    {
      name: "supabase.auth.get_user",
      op: "db.supabase",
    },
    async () => await supabase.auth.getUser(),
  );
  const user = userResult.data.user;

  if (userResult.error) {
    const userError = createSupabaseDependencyError({
      error: userResult.error,
      operation: "supabase.auth.get_user",
      resource: "auth.users",
    });
    const eventId = captureReviewFailure({
      context: {
        albumId: parsedBody.albumId,
        existingReviewId: parsedBody.existingReviewId ?? null,
        method: request.method,
        path,
        requestId,
      },
      error: userError,
      event: "review_user_lookup_failed",
      path,
    });

    return createReviewErrorResponse({
      code: "SAVE_FAILED",
      eventId,
      message: "The review could not be saved.",
      requestId,
      status: 500,
    });
  }

  if (user === null) {
    logReviewWorkflow({
      context: {
        albumId: parsedBody.albumId,
        existingReviewId: parsedBody.existingReviewId ?? null,
        method: request.method,
        path,
        requestId,
      },
      event: "review_mutation",
      operation,
      reason: "unauthorized",
      stage: "rejected",
    });

    return createReviewErrorResponse({
      code: "UNAUTHORIZED",
      message: "You must be logged in to save a review.",
      requestId,
      status: 401,
    });
  }

  const activeProfileRequirement = await ensureActiveProfile(supabase, user.id);

  if (activeProfileRequirement instanceof SupabaseDependencyError) {
    const eventId = captureReviewFailure({
      context: {
        albumId: parsedBody.albumId,
        existingReviewId: parsedBody.existingReviewId ?? null,
        method: request.method,
        path,
        requestId,
        userId: user.id,
      },
      error: activeProfileRequirement,
      event: "review_profile_lookup_failed",
      path,
    });

    return createReviewErrorResponse({
      code: "SAVE_FAILED",
      eventId,
      message: "The review could not be saved.",
      requestId,
      status: 500,
    });
  }

  if (activeProfileRequirement) {
    logReviewWorkflow({
      context: {
        albumId: parsedBody.albumId,
        existingReviewId: parsedBody.existingReviewId ?? null,
        method: request.method,
        path,
        requestId,
        userId: user.id,
      },
      event: "review_mutation",
      operation,
      reason: "email_confirmation_required",
      stage: "rejected",
    });

    return activeProfileRequirement;
  }

  const { data: album, error: albumError } = await startSpan(
    {
      name: "supabase.album.read",
      op: "db.supabase",
    },
    async () =>
      await supabase
        .from("albums")
        .select("*")
        .eq("id", parsedBody.albumId)
        .single(),
  );

  if (albumError) {
    const dependencyError = createSupabaseDependencyError({
      error: albumError,
      operation: "supabase.album.read",
      resource: "albums",
    });
    const eventId = captureReviewFailure({
      context: {
        albumId: parsedBody.albumId,
        existingReviewId: parsedBody.existingReviewId ?? null,
        method: request.method,
        path,
        requestId,
        userId: user.id,
      },
      error: dependencyError,
      event: "review_album_lookup_failed",
      path,
    });

    return createReviewErrorResponse({
      code: "SAVE_FAILED",
      eventId,
      message: "The review could not be saved.",
      requestId,
      status: 500,
    });
  }

  if (album === null) {
    logReviewWorkflow({
      context: {
        albumId: parsedBody.albumId,
        existingReviewId: parsedBody.existingReviewId ?? null,
        method: request.method,
        path,
        requestId,
        userId: user.id,
      },
      event: "review_mutation",
      operation,
      reason: "album_not_found",
      stage: "rejected",
    });

    return createReviewErrorResponse({
      code: "ALBUM_NOT_FOUND",
      message: "The album could not be found.",
      requestId,
      status: 404,
    });
  }

  if (!isFavoriteTrackValid(album, favoriteTrackId)) {
    logReviewWorkflow({
      context: {
        albumId: parsedBody.albumId,
        existingReviewId: parsedBody.existingReviewId ?? null,
        method: request.method,
        path,
        requestId,
        userId: user.id,
      },
      event: "review_mutation",
      operation,
      reason: "invalid_favorite_track",
      stage: "rejected",
    });

    return createReviewErrorResponse({
      code: "INVALID_FAVORITE_TRACK",
      message: "The selected favorite song does not belong to this album.",
      requestId,
      status: 400,
    });
  }

  const reviewPayload = {
    album_id: parsedBody.albumId,
    favorite_track_id: favoriteTrackId,
    rating: parsedBody.rating,
    review_text: reviewText,
    user_id: user.id,
  };

  if (parsedBody.existingReviewId) {
    const { data: updatedReview, error: updateError } = await startSpan(
      {
        name: "supabase.review.update",
        op: "db.supabase",
      },
      async () =>
        await supabase
          .from("reviews")
          .update({
            favorite_track_id: reviewPayload.favorite_track_id,
            rating: reviewPayload.rating,
            review_text: reviewPayload.review_text,
            updated_at: new Date().toISOString(),
          })
          // The type assertion is safe here because it is checked above.
          .eq("id", parsedBody.existingReviewId!)
          .eq("user_id", user.id)
          .select("*")
          .single(),
    );

    if (updateError || updatedReview === null) {
      const dependencyError =
        updateError !== null
          ? createSupabaseDependencyError({
              error: updateError,
              operation: "supabase.review.update",
              resource: "reviews",
            })
          : new SupabaseDependencyError({
              message: "supabase.review.update failed: missing updated review",
              operation: "supabase.review.update",
              resource: "reviews",
            });
      const eventId = captureReviewFailure({
        context: {
          albumId: parsedBody.albumId,
          existingReviewId: parsedBody.existingReviewId,
          method: request.method,
          path,
          requestId,
          userId: user.id,
        },
        error: dependencyError,
        event: "review_update_failed",
        path,
      });

      return createReviewErrorResponse({
        code: "SAVE_FAILED",
        message: "The review could not be saved.",
        eventId,
        requestId,
        status: 500,
      });
    }

    const successResponse: ReviewSuccessResponse = {
      ok: true,
      review: updatedReview,
    };

    logReviewWorkflow({
      context: {
        albumId: parsedBody.albumId,
        method: request.method,
        path,
        requestId,
        reviewId: updatedReview.id,
        userId: user.id,
      },
      event: "review_mutation",
      operation,
      stage: "succeeded",
    });

    return NextResponse.json(successResponse, { status: 200 });
  }

  const { data: insertedReview, error: insertError } = await startSpan(
    {
      name: "supabase.review.insert",
      op: "db.supabase",
    },
    async () =>
      await supabase.from("reviews").insert(reviewPayload).select("*").single(),
  );

  if (insertError || insertedReview === null) {
    const dependencyError =
      insertError !== null
        ? createSupabaseDependencyError({
            error: insertError,
            operation: "supabase.review.insert",
            resource: "reviews",
          })
        : new SupabaseDependencyError({
            message: "supabase.review.insert failed: missing inserted review",
            operation: "supabase.review.insert",
            resource: "reviews",
          });
    const eventId = captureReviewFailure({
      context: {
        albumId: parsedBody.albumId,
        method: request.method,
        path,
        requestId,
        userId: user.id,
      },
      error: dependencyError,
      event: "review_insert_failed",
      path,
    });

    return createReviewErrorResponse({
      code: "SAVE_FAILED",
      message: "The review could not be saved.",
      eventId,
      requestId,
      status: 500,
    });
  }

  const successResponse: ReviewSuccessResponse = {
    ok: true,
    review: insertedReview,
  };

  logReviewWorkflow({
    context: {
      albumId: parsedBody.albumId,
      method: request.method,
      path,
      requestId,
      reviewId: insertedReview.id,
      userId: user.id,
    },
    event: "review_mutation",
    operation,
    stage: "succeeded",
  });

  return NextResponse.json(successResponse, { status: 200 });
}

/**
 * Deletes a review through the same authenticated API boundary used for review writes.
 */
export async function DELETE(request: NextRequest) {
  const requestId = getRequestId(request);
  const path = new URL(request.url).pathname;
  const { searchParams } = new URL(request.url);
  const reviewId = searchParams.get("reviewId");

  if (typeof reviewId !== "string" || reviewId.trim().length === 0) {
    logReviewWorkflow({
      context: {
        method: request.method,
        path,
        requestId,
      },
      event: "review_mutation",
      operation: "delete",
      reason: "invalid_review_id",
      stage: "rejected",
    });

    return createReviewErrorResponse({
      code: "INVALID_REQUEST",
      message: "The review payload is invalid.",
      requestId,
      status: 400,
    });
  }

  logReviewWorkflow({
    context: {
      method: request.method,
      path,
      requestId,
      reviewId,
    },
    event: "review_mutation",
    operation: "delete",
    stage: "started",
  });

  const supabase = await createClient();
  const userResult = await startSpan(
    {
      name: "supabase.auth.get_user",
      op: "db.supabase",
    },
    async () => await supabase.auth.getUser(),
  );
  const user = userResult.data.user;

  if (userResult.error) {
    const userError = createSupabaseDependencyError({
      error: userResult.error,
      operation: "supabase.auth.get_user",
      resource: "auth.users",
    });
    const eventId = captureReviewFailure({
      context: {
        method: request.method,
        path,
        requestId,
        reviewId,
      },
      error: userError,
      event: "review_delete_user_lookup_failed",
      path,
    });

    return createReviewErrorResponse({
      code: "SAVE_FAILED",
      eventId,
      message: "The review could not be deleted.",
      requestId,
      status: 500,
    });
  }

  if (user === null) {
    logReviewWorkflow({
      context: {
        method: request.method,
        path,
        requestId,
        reviewId,
      },
      event: "review_mutation",
      operation: "delete",
      reason: "unauthorized",
      stage: "rejected",
    });

    return createReviewErrorResponse({
      code: "UNAUTHORIZED",
      message: "You must be logged in to delete a review.",
      requestId,
      status: 401,
    });
  }

  const activeProfileRequirement = await ensureActiveProfile(supabase, user.id);

  if (activeProfileRequirement instanceof SupabaseDependencyError) {
    const eventId = captureReviewFailure({
      context: {
        method: request.method,
        path,
        requestId,
        reviewId,
        userId: user.id,
      },
      error: activeProfileRequirement,
      event: "review_delete_profile_lookup_failed",
      path,
    });

    return createReviewErrorResponse({
      code: "SAVE_FAILED",
      eventId,
      message: "The review could not be deleted.",
      requestId,
      status: 500,
    });
  }

  if (activeProfileRequirement) {
    logReviewWorkflow({
      context: {
        method: request.method,
        path,
        requestId,
        reviewId,
        userId: user.id,
      },
      event: "review_mutation",
      operation: "delete",
      reason: "email_confirmation_required",
      stage: "rejected",
    });

    return activeProfileRequirement;
  }

  const { error: deleteError } = await startSpan(
    {
      name: "supabase.review.delete",
      op: "db.supabase",
    },
    async () =>
      await supabase
        .from("reviews")
        .delete()
        .eq("id", reviewId)
        .eq("user_id", user.id),
  );

  if (deleteError) {
    const dependencyError = createSupabaseDependencyError({
      error: deleteError,
      operation: "supabase.review.delete",
      resource: "reviews",
    });
    const eventId = captureReviewFailure({
      context: {
        method: request.method,
        path,
        requestId,
        reviewId,
        userId: user.id,
      },
      error: dependencyError,
      event: "review_delete_failed",
      path,
    });

    return createReviewErrorResponse({
      code: "SAVE_FAILED",
      message: "The review could not be deleted.",
      eventId,
      requestId,
      status: 500,
    });
  }

  const successResponse: ReviewSuccessResponse = { ok: true };

  logReviewWorkflow({
    context: {
      method: request.method,
      path,
      requestId,
      reviewId,
      userId: user.id,
    },
    event: "review_mutation",
    operation: "delete",
    stage: "succeeded",
  });

  return NextResponse.json(successResponse, { status: 200 });
}
