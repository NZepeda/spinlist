"use client";

import {
  QueryClient,
  QueryClientProvider as TanstackQueryProvider,
} from "@tanstack/react-query";
import { useState } from "react";

/**
 * Provides React Query context to its children with the default configuration.
 * Default configuration:
 * - staleTime: 1 minute
 * - gcTime: 10 minutes
 */
export function QueryClientProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            gcTime: 10 * 60 * 1000, // 10 minutes
          },
        },
      })
  );

  return (
    <TanstackQueryProvider client={queryClient}>
      {children}
    </TanstackQueryProvider>
  );
}
