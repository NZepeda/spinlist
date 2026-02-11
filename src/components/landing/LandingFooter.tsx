import { Logo } from "@/components/Logo";

/**
 * Footer component for the landing page.
 * Displays the Spinlist logo, copyright notice, and navigation links.
 *
 * @example
 * <LandingFooter />
 */
export const LandingFooter = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative border-t border-border bg-background">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-6 py-8 md:flex-row md:justify-between">
        <div className="flex flex-col items-center gap-4 md:flex-row md:gap-6">
          <Logo variant="landing" showText={false} />
          <p className="text-sm text-foreground-muted">
            &copy; {currentYear} Spinlist. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};
