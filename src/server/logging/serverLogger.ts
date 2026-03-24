type LogValue = boolean | number | string | null;

export interface LogContext {
  [key: string]: LogValue | undefined;
}

interface SerializedError {
  digest?: string;
  message: string;
  name: string;
  stack?: string;
  thrownValue?: string;
}

interface ServerErrorLogEntry {
  context?: Record<string, LogValue>;
  error: SerializedError;
  event: string;
  level: "error";
  service: "spinlist-web";
  timestamp: string;
}

interface LogServerErrorParams {
  context?: LogContext;
  error: unknown;
  event: string;
}

/**
 * Converts thrown values into a stable string so logs stay readable even when the code throws something other than an Error instance.
 *
 * @param value - The thrown value that needs to be serialized.
 * @returns A best-effort string representation of the thrown value.
 */
function serializeThrownValue(value: unknown): string {
  if (typeof value === "string") {
    return value;
  }

  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

/**
 * Shapes unknown thrown values into a consistent error payload for structured logs.
 *
 * @param error - The thrown value captured at the logging boundary.
 * @returns A normalized error object that is safe to serialize.
 */
function serializeError(error: unknown): SerializedError {
  if (error instanceof Error) {
    const errorWithDigest = error as Error & { digest?: string };

    return {
      digest: errorWithDigest.digest,
      message: errorWithDigest.message,
      name: errorWithDigest.name,
      stack: errorWithDigest.stack,
    };
  }

  return {
    message: "A non-Error value was thrown.",
    name: "NonErrorThrown",
    thrownValue: serializeThrownValue(error),
  };
}

/**
 * Removes undefined context entries so production logs do not contain noisy empty fields.
 *
 * @param context - The structured metadata captured alongside an error.
 * @returns A dense context object or undefined when no fields were provided.
 */
function sanitizeContext(
  context?: LogContext,
): Record<string, LogValue> | undefined {
  if (!context) {
    return undefined;
  }

  const sanitizedContext = Object.fromEntries(
    Object.entries(context).filter(([, value]) => value !== undefined),
  ) as Record<string, LogValue>;

  if (Object.keys(sanitizedContext).length === 0) {
    return undefined;
  }

  return sanitizedContext;
}

/**
 * Emits a structured server-side error log that can be indexed by the hosting platform.
 *
 * @param params - The event name, error, and request-scoped metadata for the failure.
 */
export function logServerError({
  context,
  error,
  event,
}: LogServerErrorParams): void {
  const logEntry: ServerErrorLogEntry = {
    context: sanitizeContext(context),
    error: serializeError(error),
    event,
    level: "error",
    service: "spinlist-web",
    timestamp: new Date().toISOString(),
  };

  console.error(JSON.stringify(logEntry));
}
