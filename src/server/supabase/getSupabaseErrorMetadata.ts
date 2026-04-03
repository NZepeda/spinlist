import { SupabaseDependencyError } from "@/server/supabase/SupabaseDependencyError";

/**
 * Translates Supabase dependency failures into safe route-level metadata so monitored errors highlight the failing backend operation.
 *
 * @param error - The error thrown by Supabase-backed code.
 * @returns Safe context and tags derived from the Supabase error when available.
 */
export function getSupabaseErrorMetadata(error: unknown): {
  context?: Record<string, string | null>;
  tags?: Record<string, string>;
} {
  if (!(error instanceof SupabaseDependencyError)) {
    return {};
  }

  return {
    context: {
      supabaseCode: error.code ?? null,
      supabaseOperation: error.operation,
      supabaseResource: error.resource,
    },
    tags: {
      dependency: error.dependency,
      supabaseOperation: error.operation,
    },
  };
}
