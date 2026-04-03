import * as Sentry from "@sentry/nextjs";
import { sanitizeObservabilityContext } from "@/monitoring/sanitizeObservabilityContext";

type LogValue = boolean | number | string | null;
type LogLevel = "error" | "info" | "warn";

const SERVICE_NAME = "spinlist-web";

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

interface LogServerEventParams {
  context?: LogContext;
  event: string;
  level: Exclude<LogLevel, "error">;
}

interface LogServerErrorParams {
  context?: LogContext;
  error: unknown;
  event: string;
  eventId?: string;
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
  return sanitizeObservabilityContext(context);
}

/**
 * Maps the internal log level to the matching Sentry structured logger method.
 *
 * @param level - The internal log level.
 * @returns The Sentry logger function for that level.
 */
function getSentryLogMethod(
  level: LogLevel,
): (message: string, attributes?: Record<string, unknown>) => void {
  if (level === "error") {
    return Sentry.logger.error;
  }

  if (level === "warn") {
    return Sentry.logger.warn;
  }

  return Sentry.logger.info;
}

/**
 * Writes a structured log entry through Sentry so logs can be stored and queried alongside errors and traces.
 *
 * @param params - The Sentry log payload.
 */
function writeServerLog(params: {
  context?: LogContext;
  error?: unknown;
  event: string;
  eventId?: string;
  level: LogLevel;
}): void {
  const sentryLog = getSentryLogMethod(params.level);
  const serializedError =
    params.error !== undefined ? serializeError(params.error) : undefined;
  const attributes = sanitizeContext({
    ...params.context,
    errorDigest: serializedError?.digest,
    errorMessage: serializedError?.message,
    errorName: serializedError?.name,
    errorStack: serializedError?.stack,
    eventId: params.eventId,
    service: SERVICE_NAME,
    thrownValue: serializedError?.thrownValue,
  });

  sentryLog(params.event, attributes);
}

/**
 * Logs a structured server event that does not include an error payload.
 *
 * @param params - The server event metadata.
 */
function logServerEvent({
  context,
  event,
  level,
}: LogServerEventParams): void {
  writeServerLog({
    context: sanitizeContext(context),
    event,
    level,
  });
}

/**
 * Logs a structured server error.
 *
 * @param params - The server error payload.
 */
export function logServerError({
  context,
  error,
  event,
  eventId,
}: LogServerErrorParams): void {
  writeServerLog({
    context,
    error,
    event,
    eventId,
    level: "error",
  });
}

/**
 * Logs an informational server event for normal workflow progress.
 *
 * @param params - The server event metadata.
 */
export function logServerInfo(params: {
  context?: LogContext;
  event: string;
}): void {
  logServerEvent({
    context: params.context,
    event: params.event,
    level: "info",
  });
}

/**
 * Logs a warning server event for expected but important workflow rejections.
 *
 * @param params - The server event metadata.
 */
export function logServerWarning(params: {
  context?: LogContext;
  event: string;
}): void {
  logServerEvent({
    context: params.context,
    event: params.event,
    level: "warn",
  });
}
