import { QueryClientProvider } from "@tanstack/react-query";
import { ReactNode } from "react";
import { createTestQueryClient } from "./createTestQueryClient";

/**
 * Providers for testing components.
 */
export function TestProviders({ children }: { children: ReactNode }) {
  const queryClient = createTestQueryClient();

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
