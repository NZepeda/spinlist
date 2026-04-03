/**
 * Carries Supabase failure metadata so backend outages can be separated from application behavior in monitoring.
 */
export class SupabaseDependencyError extends Error {
  readonly dependency = "supabase";
  readonly operation: string;
  readonly resource: string;
  readonly code?: string;

  /**
   * Preserves the Supabase operation context needed to triage backend failures quickly.
   *
   * @param params - The Supabase failure details.
   */
  constructor(params: {
    cause?: unknown;
    code?: string;
    message: string;
    operation: string;
    resource: string;
  }) {
    super(params.message, params.cause ? { cause: params.cause } : undefined);
    this.name = "SupabaseDependencyError";
    this.code = params.code;
    this.operation = params.operation;
    this.resource = params.resource;
  }
}
