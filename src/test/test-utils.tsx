import { ReactElement, ReactNode } from "react";
import { render, renderHook, RenderOptions } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

function createTestQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  });
}

function TestProviders({ children }: { children: ReactNode }) {
  const queryClient = createTestQueryClient();

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

function customRender(
  ui: ReactElement,
  options?: Omit<RenderOptions, "wrapper">,
) {
  return render(ui, { wrapper: TestProviders, ...options });
}

function customRenderHook<Result, Props>(
  hook: (props: Props) => Result,
  options?: Omit<RenderOptions, "wrapper">,
) {
  return renderHook(hook, { wrapper: TestProviders, ...options });
}

export { customRender as render, customRenderHook as renderHook };
