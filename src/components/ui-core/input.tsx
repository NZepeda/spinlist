import * as React from "react";

import { cn } from "@/lib/cn";

/**
 * Styled text input component with focus states, validation styling, and file upload support.
 * Includes built-in accessibility features and responsive text sizing.
 *
 * @param type - HTML input type (text, email, password, file, etc.)
 * @param className - Additional CSS classes to apply
 *
 * @example
 * ```tsx
 * // Basic text input
 * <Input type="text" placeholder="Enter your name" />
 *
 * // Email input with validation
 * <Input type="email" aria-invalid={!!errors.email} />
 *
 * // Password field
 * <Input type="password" placeholder="Password" />
 *
 * // File upload
 * <Input type="file" accept="image/*" />
 * ```
 */
function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
        "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
