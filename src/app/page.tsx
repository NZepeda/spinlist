import { SearchBar } from "@/components/SearchBar";

/**
 * Home page that keeps the first impression centered on search.
 */
export default function Home() {
  return (
    <main className="relative overflow-hidden bg-background text-foreground">
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background-warm to-background" />
      <div className="absolute -top-32 left-10 h-[380px] w-[380px] rounded-full bg-[radial-gradient(circle_at_top,var(--brand-aura-strong),transparent)] blur-2xl" />
      <div className="absolute -top-20 right-0 h-[420px] w-[420px] rounded-full bg-[radial-gradient(circle_at_top,var(--brand-aura-medium),transparent)] blur-2xl" />
      <div className="absolute bottom-0 left-0 h-[520px] w-[520px] rounded-full bg-[radial-gradient(circle_at_center,var(--brand-aura-soft),transparent)] blur-3xl" />

      <section className="relative mx-auto grid max-w-6xl gap-12 px-6 pb-24 pt-18 md:min-h-[calc(100vh-5rem)] md:grid-cols-[minmax(0,1.15fr)_320px] md:items-center md:pt-24">
        <div className="max-w-3xl">
          <p className="text-sm uppercase tracking-[0.3em] text-foreground-muted">
            Your music, remembered
          </p>
          <h1 className="mt-4 text-4xl font-black tracking-tight text-foreground sm:text-6xl">
            Find the album.
            <span className="block text-brand">Log the feeling.</span>
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-foreground-muted">
            Search for any album or artist, jump straight into the discography,
            and start building your listening journal.
          </p>
          <div className="mt-8">
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
      </section>
    </main>
  );
}
