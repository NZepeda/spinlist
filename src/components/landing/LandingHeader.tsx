import { Button } from "@/components/ui-core/button";
import { Logo } from "@/components/Logo";

interface LandingHeaderProps {
  /**
   * Callback invoked when the CTA button is clicked.
   * Typically used to scroll to the email signup form.
   */
  onCtaClick: () => void;
}

/**
 * Header component for the landing page.
 * Displays the Spinlist logo and a call-to-action button that triggers the provided callback.
 */
export const LandingHeader = ({ onCtaClick }: LandingHeaderProps) => {
  return (
    <header className="absolute top-0 left-0 right-0 z-50">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Logo variant="landing" />
        <Button
          size="sm"
          type="button"
          onClick={onCtaClick}
          className="rounded-full bg-foreground text-background hover:bg-foreground/90"
        >
          Join waitlist
        </Button>
      </div>
    </header>
  );
};
