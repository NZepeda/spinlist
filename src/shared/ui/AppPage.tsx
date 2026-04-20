import type { ComponentProps } from "react";

import { cn } from "@/shared/utils/cn";

/**
 * Wraps page content in the shared outer spacing used across user-facing routes.
 */
export function AppPage({
  children,
  className,
  ...props
}: ComponentProps<"div">) {
  return (
    <main
      data-slot="app-page"
      className={cn("app-shell app-section", className)}
      {...props}
    >
      {children}
    </main>
  );
}
