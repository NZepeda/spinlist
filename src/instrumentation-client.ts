import * as Sentry from "@sentry/nextjs";
import { createBrowserSentryOptions } from "@/monitoring/sentry/createBrowserSentryOptions";
import { isClientObservabilityEnabled } from "@/monitoring/sentry/isClientObservabilityEnabled";

if (isClientObservabilityEnabled()) {
  Sentry.init(createBrowserSentryOptions());
}

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
