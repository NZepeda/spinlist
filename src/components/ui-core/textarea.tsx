import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * Styled multi-line text input component with auto-sizing, focus states, and validation styling.
 * Includes built-in accessibility features and responsive text sizing.
 *
 * @param className - Additional CSS classes to apply
 * @param rows - Initial number of visible text lines (optional, auto-sizes by default)
 *
 * @example
 * ```tsx
 * // Basic textarea
 * <Textarea placeholder="Enter your message" />
 *
 * // Textarea with validation error
 * <Textarea aria-invalid={!!errors.message} placeholder="Write your review..." />
 *
 * // Disabled textarea
 * <Textarea disabled placeholder="Cannot edit" />
 *
 * // With max length
 * <Textarea maxLength={2000} placeholder="Limited to 2000 characters" />
 * ```
 */
function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 flex field-sizing-content min-h-16 w-full rounded-md border bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
