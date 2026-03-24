import {
  renderHook as testingLibraryRenderHook,
  RenderOptions,
} from "@testing-library/react";
import { TestProviders } from "./TestProviders";

/**
 * Renders a hook with the TestProviders wrapper.
 */
export function renderHook<Result, Props>(
  hook: (props: Props) => Result,
  options?: Omit<RenderOptions, "wrapper">,
) {
  return testingLibraryRenderHook(hook, { wrapper: TestProviders, ...options });
}
