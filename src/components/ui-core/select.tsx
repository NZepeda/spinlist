import * as React from "react";
import { ChevronDownIcon } from "lucide-react";

import { cn } from "@/lib/cn";

/**
 * A HTML select component with consistent styling and visual enhancements.
 * Provides a dropdown chevron indicator and supports small and default sizes.
 * Use for simple dropdown selections where browser behavior is preferred.
 *
 * @example
 * ```tsx
 * <Select value={value} onChange={(e) => setValue(e.target.value)}>
 *   <SelectOption value="">Select an option</SelectOption>
 *   <SelectOption value="1">Option 1</SelectOption>
 * </Select>
 * ```
 */
function Select({
  className,
  size = "default",
  ...props
}: Omit<React.ComponentProps<"select">, "size"> & { size?: "sm" | "default" }) {
  return (
    <div
      className="group/select relative w-fit has-[select:disabled]:opacity-50"
      data-slot="select-wrapper"
    >
      <select
        data-slot="select"
        data-size={size}
        className={cn(
          "border-input placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 dark:hover:bg-input/50 h-9 w-full min-w-0 appearance-none rounded-md border bg-transparent px-3 py-2 pr-9 text-sm shadow-xs transition-[color,box-shadow] outline-none disabled:pointer-events-none disabled:cursor-not-allowed data-[size=sm]:h-8 data-[size=sm]:py-1",
          "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
          "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
          className,
        )}
        {...props}
      />
      <ChevronDownIcon
        className="text-muted-foreground pointer-events-none absolute top-1/2 right-3.5 size-4 -translate-y-1/2 opacity-50 select-none"
        aria-hidden="true"
        data-slot="select-icon"
      />
    </div>
  );
}

/**
 * An option element for use within Select.
 * Wraps the HTML option element with consistent data attributes.
 *
 * @example
 * ```tsx
 * <SelectOption value="1">Option 1</SelectOption>
 * ```
 */
function SelectOption({ ...props }: React.ComponentProps<"option">) {
  return <option data-slot="select-option" {...props} />;
}

/**
 * An optgroup element for grouping options within Select.
 * Wraps the HTML optgroup element with consistent styling.
 *
 * @example
 * ```tsx
 * <SelectOptGroup label="Group 1">
 *   <SelectOption value="1">Option 1</SelectOption>
 * </SelectOptGroup>
 * ```
 */
function SelectOptGroup({
  className,
  ...props
}: React.ComponentProps<"optgroup">) {
  return (
    <optgroup
      data-slot="select-optgroup"
      className={cn(className)}
      {...props}
    />
  );
}

export { Select, SelectOptGroup, SelectOption };
