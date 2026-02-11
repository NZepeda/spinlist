"use client";

import { useRef, useState, useTransition } from "react";
import { validate as validateEmail } from "email-validator";
import { Button } from "@/components/ui-core/button";
import { Input } from "@/components/ui-core/input";
import { LandingHeader, LandingFooter } from "@/components/landing";
import { joinWaitlist } from "@/lib/actions/joinWaitlist";

type FormStatus = "idle" | "success" | "error";

export const LandingPage = () => {
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState<string | null>(null);
  const [formStatus, setFormStatus] = useState<FormStatus>("idle");
  const [isPending, startTransition] = useTransition();
  const emailInputRef = useRef<HTMLInputElement | null>(null);

  const scrollToEmailInput = () => {
    emailInputRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
    requestAnimationFrame(() => {
      emailInputRef.current?.focus();
    });
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedEmail = email.trim();

    if (!validateEmail(trimmedEmail)) {
      setEmailError("Please enter a valid email address.");
      return;
    }

    setEmailError(null);

    startTransition(async () => {
      const result = await joinWaitlist(trimmedEmail);

      if (result.success) {
        setFormStatus("success");
        setEmail("");
      } else {
        setEmailError(
          result.error ?? "Something went wrong. Please try again.",
        );
        setFormStatus("error");
      }
    });
  };

  return (
    <>
      <LandingHeader onCtaClick={scrollToEmailInput} />
      <main className="relative overflow-hidden bg-background text-foreground">
        {/* Translucent orb in the background */}
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background-warm to-background" />
        <div className="absolute -top-32 left-10 h-[380px] w-[380px] rounded-full bg-[radial-gradient(circle_at_top,_oklch(0.62_0.175_47/20%),_oklch(0.62_0.175_47/0%))] blur-2xl" />
        <div className="absolute -top-24 right-0 h-[420px] w-[420px] rounded-full bg-[radial-gradient(circle_at_top,_oklch(0.62_0.175_47/16%),_oklch(0.62_0.175_47/0%))] blur-2xl" />
        <div className="absolute bottom-0 left-0 h-[520px] w-[520px] rounded-full bg-[radial-gradient(circle_at_center,_oklch(0.62_0.175_47/12%),_oklch(0.62_0.175_47/0%))] blur-3xl" />

        <section className="relative mx-auto flex min-h-[80vh] max-w-6xl flex-col justify-center px-6 pb-8 pt-20 md:pt-28">
          <div className="grid items-center gap-12 md:grid-cols-[minmax(0,1fr)_320px]">
            <div className="max-w-3xl">
              <p className="text-sm uppercase tracking-[0.3em] text-foreground-muted">
                Your music, remembered
              </p>
              <h1 className="mt-4 text-4xl font-black tracking-tight text-foreground sm:text-6xl">
                <span className="text-brand">Spinlist</span> is the home for
                obsessive listeners and intentional reviews.
              </h1>
              <p className="mt-6 text-lg text-foreground-muted">
                Spinlist turns every album into a story worth sharing. Build a
                living shelf of your listens, share your favorites, and discover
                what's resonating with music lovers everywhere.
              </p>
              {formStatus === "success" ? (
                <div className="mt-8 rounded-full border border-success/30 bg-success/10 px-6 py-3">
                  <p className="text-sm font-medium text-success-foreground">
                    🎉 You're on the list! We'll be in touch soon.
                  </p>
                </div>
              ) : (
                <form
                  className="mt-8 flex flex-wrap items-start gap-4"
                  onSubmit={handleSubmit}
                >
                  <div className="min-w-[240px] flex-1">
                    <Input
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      ref={emailInputRef}
                      disabled={isPending}
                      onChange={(event) => {
                        setEmail(event.target.value);
                        if (emailError) {
                          setEmailError(null);
                        }
                      }}
                      aria-invalid={Boolean(emailError)}
                      className="h-11 rounded-full border-input bg-surface-elevated text-foreground placeholder:text-foreground-muted disabled:opacity-50"
                    />
                    {emailError && (
                      <p className="mt-2 text-xs text-error">
                        {emailError}
                      </p>
                    )}
                  </div>
                  <Button
                    variant="brand"
                    size="lg"
                    type="submit"
                    disabled={isPending}
                    className="h-11 rounded-full disabled:opacity-50"
                  >
                    {isPending ? "Joining..." : "Join the waitlist"}
                  </Button>
                </form>
              )}
            </div>

            {/** Vinyl record  */}
            <div className="relative mx-auto hidden h-[320px] w-[320px] items-center justify-center md:flex">
              <div className="relative h-[260px] w-[260px] rounded-full border border-foreground/20 bg-foreground shadow-[0_24px_60px_oklch(0.15_0.005_50/25%)]">
                <div className="absolute inset-6 rounded-full border border-background/10" />
                <div className="absolute inset-12 rounded-full border border-background/10" />
                <div className="absolute inset-20 rounded-full border border-background/10" />
                <div className="absolute inset-[88px] rounded-full bg-brand shadow-[0_6px_20px_oklch(0.62_0.175_47/35%)]" />
                <div className="absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-background" />
              </div>
            </div>
          </div>
        </section>

        <section
          id="features"
          className="relative mx-auto grid max-w-6xl gap-6 px-6 pb-20 pt-6 md:grid-cols-3"
        >
          {[
            {
              title: "Track your favorites",
              copy: " From guilty pleasures to all-time favorites, keep a running log of every album you spin.",
              icon: "🎧",
            },
            {
              title: "See what's spinning",
              copy: "Follow people with a vibe you trust and surface recommendations from real humans.",
              icon: "📻",
            },
            {
              title: "Your taste visualized",
              copy: "Watch your collection grow and revisit the albums that shaped your year.",
              icon: "💿",
            },
          ].map((feature) => (
            <div
              key={feature.title}
              className="rounded-2xl border border-border bg-surface p-6 text-foreground shadow-[0_20px_60px_oklch(0.15_0.005_50/12%)] backdrop-blur"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background text-lg">
                  {feature.icon}
                </span>
                <h2 className="text-xl font-black">{feature.title}</h2>
              </div>
              <p className="mt-3 text-sm text-foreground-muted">{feature.copy}</p>
            </div>
          ))}
        </section>

        <section className="relative mx-auto flex max-w-6xl flex-col gap-8 px-6 pb-24 md:flex-row md:items-center">
          <div className="flex-1 rounded-3xl border border-border bg-surface-elevated p-8 text-foreground">
            <p className="text-sm uppercase tracking-[0.2em] text-foreground-muted">
              How it works
            </p>
            <h2 className="mt-4 text-3xl font-black">
              Build a music journal that does the remembering.
            </h2>
            <p className="mt-4 text-foreground-muted">
              Add albums in seconds, tag what resonated, and let your shelves
              evolve into a personal archive you actually want to revisit.
            </p>
          </div>
          <div className="flex-1 space-y-4 text-foreground">
            {[
              "Search any album and capture the moment it hits.",
              "Rate with nuance and leave notes that age well.",
              "Share a shelf when you want the room to listen.",
            ].map((step, index) => (
              <div
                key={step}
                className="flex items-center gap-4 rounded-2xl border border-border bg-surface p-6"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full border border-input text-sm font-semibold text-brand">
                  0{index + 1}
                </div>
                <p className="text-sm text-foreground-muted">{step}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="relative mx-auto max-w-6xl px-6 pb-28">
          <div className="rounded-3xl border border-input bg-gradient-to-br from-brand/20 via-surface-elevated to-background p-10 text-foreground">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-3xl font-black">
                  Be the first to shape the community.
                </h2>
                <p className="mt-3 text-sm text-foreground-muted">
                  Early members get priority access, product input, and the best
                  discovery circles.
                </p>
              </div>
              <Button
                size="lg"
                type="button"
                className="bg-foreground text-background hover:bg-foreground/90"
                onClick={scrollToEmailInput}
              >
                Join the waitlist
              </Button>
            </div>
          </div>
        </section>
      </main>
      <LandingFooter />
    </>
  );
};
