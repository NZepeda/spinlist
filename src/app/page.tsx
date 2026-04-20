import { SearchBar } from "@/features/search/components/SearchBar";
import { AppPage } from "@/shared/ui/AppPage";

interface HomePageProps {
  searchParams: Promise<{
    confirmed?: string;
  }>;
}

interface ConfirmationBannerProps {
  confirmed?: string;
}

/**
 * Renders the one-time confirmation success banner after activation.
 */
function ConfirmationBanner({ confirmed }: ConfirmationBannerProps) {
  if (confirmed !== "1") {
    return null;
  }

  return (
    <div className="mb-6 max-w-2xl rounded-[1.4rem] border border-brand/20 bg-brand/10 px-5 py-4 text-sm leading-6 text-foreground shadow-[0_12px_30px_var(--brand-shadow-soft)]">
      Thank you for confirming your email! Feel free to begin logging your
      listening journey.
    </div>
  );
}

/**
 * Home page that keeps the first impression centered on search.
 */
export default async function Home({ searchParams }: HomePageProps) {
  const resolvedSearchParams = await searchParams;

  return (
    <AppPage className="relative grid gap-10 md:min-h-[calc(100dvh-var(--header-height))] md:grid-cols-[minmax(0,1.15fr)_320px] md:items-center">
      <div className="max-w-3xl">
        <ConfirmationBanner confirmed={resolvedSearchParams.confirmed} />
        <h1 className="mt-4 text-[2.5rem] font-black tracking-tight text-foreground sm:text-6xl">
          Find the album.
          <span className="block text-brand">Log the feeling.</span>
        </h1>
        <p className="mt-5 max-w-2xl text-base text-foreground-muted md:text-lg">
          Search for any album or artist, jump straight into the discography,
          and start building your listening journal.
        </p>
        <div className="mt-7">
          <SearchBar
            placeholder="Search for an album or artist"
            variant="hero"
          />
        </div>
      </div>

      <div className="relative mx-auto hidden h-[320px] w-[320px] items-center justify-center md:flex">
        <div className="relative h-[260px] w-[260px] rounded-full border border-foreground/20 bg-foreground shadow-[0_24px_60px_var(--brand-shadow-strong)]">
          <div className="absolute inset-6 rounded-full border border-background/10" />
          <div className="absolute inset-12 rounded-full border border-background/10" />
          <div className="absolute inset-20 rounded-full border border-background/10" />
          <div className="absolute inset-[88px] rounded-full bg-brand shadow-[0_6px_20px_var(--brand-shadow)]" />
          <div className="absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-background" />
        </div>
        <div className="absolute -bottom-2 -left-4 rounded-2xl border border-border/70 bg-surface/95 px-4 py-3 shadow-[0_20px_40px_var(--brand-shadow-soft)]">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Start here
          </p>
          <p className="mt-2 text-sm font-medium text-foreground">
            Search first, then let the records pull you deeper.
          </p>
        </div>
      </div>
    </AppPage>
  );
}
