import type { BrowserOptions } from "@sentry/nextjs";
import { redactBreadcrumb } from "@/monitoring/sentry/redactBreadcrumb";
import { sanitizeRequestHeaders } from "@/monitoring/sentry/sanitizeRequestHeaders";
import { sanitizeTelemetryValue } from "@/monitoring/sentry/sanitizeTelemetryValue";

type BeforeSendHandler = NonNullable<BrowserOptions["beforeSend"]>;
type ObservabilityEvent = Parameters<BeforeSendHandler>[0];

/**
 * Redacts event payloads before they are sent to Sentry so user-identifying and content-bearing fields are stripped where necessary.
 *
 * @param event - The Sentry event candidate.
 * @returns The redacted event payload.
 */
export function redactEvent(
  event: ObservabilityEvent,
): ObservabilityEvent | null {
  return {
    ...event,
    breadcrumbs: event.breadcrumbs?.map(
      (breadcrumb) => redactBreadcrumb(breadcrumb) ?? breadcrumb,
    ),
    contexts:
      typeof event.contexts === "object" &&
      event.contexts !== null &&
      !Array.isArray(event.contexts)
        ? (sanitizeTelemetryValue(
            event.contexts,
          ) as ObservabilityEvent["contexts"])
        : event.contexts,
    extra:
      typeof event.extra === "object" &&
      event.extra !== null &&
      !Array.isArray(event.extra)
        ? (sanitizeTelemetryValue(event.extra) as ObservabilityEvent["extra"])
        : event.extra,
    message:
      typeof event.message === "string"
        ? (sanitizeTelemetryValue(event.message) as string)
        : event.message,
    request: event.request
      ? {
          ...event.request,
          data: sanitizeTelemetryValue(event.request.data, "body"),
          headers: sanitizeRequestHeaders(event.request.headers ?? {}),
          url:
            typeof event.request.url === "string"
              ? (sanitizeTelemetryValue(event.request.url, "url") as string)
              : event.request.url,
        }
      : event.request,
    tags:
      typeof event.tags === "object" &&
      event.tags !== null &&
      !Array.isArray(event.tags)
        ? (sanitizeTelemetryValue(event.tags) as ObservabilityEvent["tags"])
        : event.tags,
    transaction:
      typeof event.transaction === "string"
        ? (sanitizeTelemetryValue(event.transaction) as string)
        : event.transaction,
    user: redactUser(event.user),
  };
}

/**
 * Limits explicit user context to the stable internal identifier so hosted
 * monitoring stays aligned with the SDK's privacy-first defaults.
 *
 * @param user - The event user payload supplied to Sentry.
 * @returns The redacted user payload.
 */
function redactUser(
  user: ObservabilityEvent["user"],
): ObservabilityEvent["user"] | undefined {
  if (typeof user !== "object" || user === null || Array.isArray(user)) {
    return user;
  }

  if (!("id" in user)) {
    return undefined;
  }

  const { id } = user;

  if (typeof id !== "string" && typeof id !== "number") {
    return undefined;
  }

  return {
    id: String(id),
  };
}
