interface LogoProps {
  /**
   * The visual variant of the logo.
   * - `"default"` uses the app's primary theme colors
   * - `"landing"` uses hardcoded landing page colors (orange #D96A20 with cream text)
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
    ? "bg-[#D96A20] text-[#F5F1E6]"
    : "bg-primary text-primary-foreground";

  const textClasses = isLanding ? "text-[#0A0A0A]" : "";

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
