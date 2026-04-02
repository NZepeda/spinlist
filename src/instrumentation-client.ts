import * as Sentry from "@sentry/nextjs";
import {
  createBrowserSentryOptions,
  isClientObservabilityEnabled,
} from "@/monitoring/sentry/options";

if (isClientObservabilityEnabled()) {
  Sentry.init(createBrowserSentryOptions());
}

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
