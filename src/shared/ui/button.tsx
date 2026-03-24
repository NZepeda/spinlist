import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/shared/utils/cn";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-xs hover:bg-primary/90",
        destructive:
          "bg-destructive text-white shadow-xs hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50",
        secondary:
          "bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80",
        ghost:
          "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
        link: "text-primary underline-offset-4 hover:underline",
        brand:
          "bg-brand text-brand-foreground shadow-[0_12px_30px_var(--brand-shadow)] hover:bg-brand-hover",
      },
      size: {
        default: "min-h-11 px-4 py-2.5 md:min-h-10 has-[>svg]:px-3",
        sm: "min-h-10 rounded-md gap-1.5 px-3 py-2 md:min-h-8 has-[>svg]:px-2.5",
        lg: "min-h-12 rounded-md px-6 py-3 text-base md:min-h-11 md:text-sm has-[>svg]:px-4",
        icon: "size-11 md:size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

/**
 * Button component with multiple variants and sizes.
 * Supports rendering as a different element using the `asChild` prop via Radix UI Slot.
 *
 * @param variant - Visual style: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link" | "brand"
 * @param size - Button size: "default" | "sm" | "lg" | "icon"
 * @param asChild - If true, renders the child element as the button instead of a `<button>` tag
 *
 * @example
 * ```tsx
 * // Standard button
 * <Button variant="default" size="lg">Click me</Button>
 *
 * // Destructive action
 * <Button variant="destructive">Delete</Button>
 *
 * // Brand CTA with orange glow
 * <Button variant="brand" size="lg">Join the waitlist</Button>
 *
 * // Render as a link
 * <Button asChild>
 *   <Link href="/home">Go Home</Link>
 * </Button>
 *
 * // Icon button
 * <Button variant="ghost" size="icon">
 *   <SearchIcon />
 * </Button>
 * ```
 */
function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
