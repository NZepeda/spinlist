import {
  render as testingLibraryRender,
  RenderOptions,
} from "@testing-library/react";
import { ReactElement } from "react";
import { TestProviders } from "./TestProviders";

/**
 * Renders a React element with the TestProviders wrapper.
 */
export function render(
  ui: ReactElement,
  options?: Omit<RenderOptions, "wrapper">,
) {
  return testingLibraryRender(ui, { wrapper: TestProviders, ...options });
}
