import { LandingPage } from "./LandingPage";

function DevHome() {
  return (
    <main className="container mx-auto px-4 py-8">
      <div className="text-center py-16">
        <h1 className="text-4xl font-bold tracking-tight sm:text-6xl mb-6">
          Rate & Discover Music
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Like Letterboxd, but for albums. Search, rate, and review your
          favorite music. Discover new albums through community recommendations.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
        <div className="text-center p-6">
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <span className="text-primary font-bold">🔍</span>
          </div>
          <h3 className="font-semibold mb-2">Search Albums</h3>
          <p className="text-sm text-muted-foreground">
            Find any album using our Spotify-powered search
          </p>
        </div>

        <div className="text-center p-6">
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <span className="text-primary font-bold">⭐</span>
          </div>
          <h3 className="font-semibold mb-2">Rate & Review</h3>
          <p className="text-sm text-muted-foreground">
            Share your thoughts and rate albums on a 5-star scale
          </p>
        </div>

        <div className="text-center p-6">
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <span className="text-primary font-bold">👥</span>
          </div>
          <h3 className="font-semibold mb-2">Discover</h3>
          <p className="text-sm text-muted-foreground">
            Find new music through community recommendations
          </p>
        </div>
      </div>
    </main>
  );
}

/**
 * Displays the landing page or dev home based on the environment.
 */
export default function Home() {
  const isProduction = process.env.NODE_ENV === "production";

  return isProduction ? <LandingPage /> : <DevHome />;
}
