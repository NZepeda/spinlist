interface LogoProps {
  /**
   * The visual variant of the logo.
   * - `"default"` uses the app's primary theme colors
   * - `"landing"` uses brand design tokens (brand orange with background text)
   * @default "default"
   */
  variant?: "default" | "landing";
  /**
   * Whether to show the "Spinlist" text alongside the icon.
   * When true, text is hidden on mobile and shown on sm+ breakpoints.
   * @default true
   */
  showText?: boolean;
  /**
   * Additional CSS classes to apply to the wrapper element.
   */
  className?: string;
}

/**
 * Renders the Spinlist logo with an icon and optional text.
 *
 * @example
 * // Default usage in the main app
 * <Logo />
 *
 * @example
 * // Landing page variant without text
 * <Logo variant="landing" showText={false} />
 */
export const Logo = ({
  variant = "default",
  showText = true,
  className = "",
}: LogoProps) => {
  const isLanding = variant === "landing";

  const iconClasses = isLanding
    ? "bg-brand text-background"
    : "bg-primary text-primary-foreground";

  const textClasses = isLanding ? "text-foreground" : "";

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div
        className={`h-8 w-8 rounded-full flex items-center justify-center ${iconClasses}`}
      >
        <span className="font-bold text-sm">S</span>
      </div>
      {showText && (
        <span className={`hidden font-bold sm:inline-block ${textClasses}`}>
          Spinlist
        </span>
      )}
    </div>
  );
};
