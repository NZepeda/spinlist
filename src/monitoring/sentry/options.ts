import type { BrowserOptions, EdgeOptions, NodeOptions } from "@sentry/nextjs";

const DEFAULT_MAX_BREADCRUMBS = 50;
const PRODUCTION_TRACE_SAMPLE_RATE = 0.05;
const PREVIEW_TRACE_SAMPLE_RATE = 0.01;
const ZERO_SAMPLE_RATE = 0;

/**
 * Reads the public DSN so browser and server runtimes can share the same
 * destination without duplicating configuration.
 *
 * @returns The public Sentry DSN when configured.
 */
function getPublicDsn(): string | undefined {
  return process.env.NEXT_PUBLIC_SENTRY_DSN;
}

/**
 * Reads the server DSN and falls back to the public DSN because Sentry DSNs are
 * safe to expose and the project only needs a single destination.
 *
 * @returns The best available DSN for server-side telemetry.
 */
function getServerDsn(): string | undefined {
  return process.env.SENTRY_DSN ?? getPublicDsn();
}

/**
 * Allows local telemetry only when developers explicitly opt into it so normal
 * development work does not pollute the hosted monitoring project.
 *
 * @returns Whether local observability is explicitly enabled.
 */
function isLocalTelemetryEnabled(): boolean {
  return process.env.NEXT_PUBLIC_ENABLE_LOCAL_OBSERVABILITY === "true";
}

/**
 * Normalizes the deployment environment into stable Sentry environment names so
 * preview traffic is visible without being confused with production or local usage.
 *
 * @returns The environment name to attach to Sentry events.
 */
export function getObservabilityEnvironment(): string {
  const configuredEnvironment = process.env.SENTRY_ENVIRONMENT?.trim();

  if (configuredEnvironment) {
    return configuredEnvironment;
  }

  if (process.env.VERCEL_ENV === "production") {
    return "production";
  }

  if (process.env.VERCEL_ENV === "preview") {
    return "preview";
  }

  if (process.env.NODE_ENV === "production") {
    return "production";
  }

  return "development";
}

/**
 * Limits baseline tracing so the initial rollout stays useful without consuming
 * free-tier quota too aggressively before route-specific tuning exists.
 *
 * @returns The default trace sample rate for the current environment.
 */
function getTraceSampleRate(): number {
  const environment = getObservabilityEnvironment();

  if (environment === "production") {
    return PRODUCTION_TRACE_SAMPLE_RATE;
  }

  if (environment === "preview") {
    return PREVIEW_TRACE_SAMPLE_RATE;
  }

  return ZERO_SAMPLE_RATE;
}

/**
 * Determines whether the browser should initialize observability at all.
 */
export function isClientObservabilityEnabled(): boolean {
  const dsn = getPublicDsn();

  console.log({ dsn });

  if (!dsn) {
    return false;
  }

  const environment = getObservabilityEnvironment();

  if (environment === "development") {
    return isLocalTelemetryEnabled();
  }

  return true;
}

/**
 * Determines whether the server runtime should initialize observability at all.
 *
 * @returns Whether server-side telemetry should be enabled.
 */
export function isServerObservabilityEnabled(): boolean {
  const dsn = getServerDsn();

  if (!dsn) {
    return false;
  }

  const environment = getObservabilityEnvironment();

  if (environment === "development") {
    return isLocalTelemetryEnabled();
  }

  return true;
}

/**
 * Creates the shared browser configuration so client failures arrive with stable
 * environment metadata while replay remains limited to error sessions only.
 *
 * @returns The browser Sentry options for Spinlist.
 */
export function createBrowserSentryOptions(): BrowserOptions {
  return {
    attachStacktrace: true,
    dsn: getPublicDsn(),
    enabled: isClientObservabilityEnabled(),
    environment: getObservabilityEnvironment(),
    maxBreadcrumbs: DEFAULT_MAX_BREADCRUMBS,
    replaysOnErrorSampleRate: 1,
    replaysSessionSampleRate: 0,
    sendDefaultPii: false,
    tracesSampleRate: getTraceSampleRate(),
  };
}

/**
 * Creates the shared Node.js runtime configuration so server failures use the
 * same environment and sampling defaults as the browser.
 *
 * @returns The Node.js Sentry options for Spinlist.
 */
export function createNodeSentryOptions(): NodeOptions {
  return {
    attachStacktrace: true,
    dsn: getServerDsn(),
    enabled: isServerObservabilityEnabled(),
    environment: getObservabilityEnvironment(),
    maxBreadcrumbs: DEFAULT_MAX_BREADCRUMBS,
    sendDefaultPii: false,
    tracesSampleRate: getTraceSampleRate(),
  };
}

/**
 * Creates the shared Edge runtime configuration so any future Edge handlers use
 * the same observability boundaries as the Node.js runtime.
 *
 * @returns The Edge runtime Sentry options.
 */
export function createEdgeSentryOptions(): EdgeOptions {
  return {
    attachStacktrace: true,
    dsn: getServerDsn(),
    enabled: isServerObservabilityEnabled(),
    environment: getObservabilityEnvironment(),
    maxBreadcrumbs: DEFAULT_MAX_BREADCRUMBS,
    sendDefaultPii: false,
    tracesSampleRate: getTraceSampleRate(),
  };
}
