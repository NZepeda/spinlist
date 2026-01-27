/**
 * Renders the Spinlist logo.
 */
export const Logo = () => {
  return (
    <>
      <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
        <span className="text-primary-foreground font-bold text-sm">S</span>
      </div>
      <span className="hidden font-bold sm:inline-block">Spinlist</span>
    </>
  );
};
