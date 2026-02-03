"use client";

import { useRef, useState, useTransition } from "react";
import { validate as validateEmail } from "email-validator";
import { Button } from "@/components/ui-core/button";
import { Input } from "@/components/ui-core/input";
import { joinWaitlist } from "@/lib/actions/joinWaitlist";

type FormStatus = "idle" | "success" | "error";

export const LandingPage = () => {
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState<string | null>(null);
  const [formStatus, setFormStatus] = useState<FormStatus>("idle");
  const [isPending, startTransition] = useTransition();
  const emailInputRef = useRef<HTMLInputElement | null>(null);

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
    <main className="relative overflow-hidden bg-[#F5F1E6] text-[#0A0A0A]">
      {/* Translucent orb in the background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#F5F1E6] via-[#F2EADB] to-[#F5F1E6]" />
      <div className="absolute -top-32 left-10 h-[380px] w-[380px] rounded-full bg-[radial-gradient(circle_at_top,_rgba(217,106,32,0.2),_rgba(217,106,32,0))] blur-2xl" />
      <div className="absolute -top-24 right-0 h-[420px] w-[420px] rounded-full bg-[radial-gradient(circle_at_top,_rgba(217,106,32,0.16),_rgba(217,106,32,0))] blur-2xl" />
      <div className="absolute bottom-0 left-0 h-[520px] w-[520px] rounded-full bg-[radial-gradient(circle_at_center,_rgba(217,106,32,0.12),_rgba(217,106,32,0))] blur-3xl" />

      <section className="relative mx-auto flex min-h-[80vh] max-w-6xl flex-col justify-center px-6 pb-8 pt-20 md:pt-28">
        <div className="grid items-center gap-12 md:grid-cols-[minmax(0,1fr)_320px]">
          <div className="max-w-3xl">
            <p className="text-sm uppercase tracking-[0.3em] text-[#5A5247]">
              Your music, remembered
            </p>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight text-[#0A0A0A] sm:text-6xl">
              The home for obsessive listeners and intentional reviews.
            </h1>
            <p className="mt-6 text-lg text-[#5A5247]">
              Spinlist turns every album into a story worth sharing. Build a
              living shelf of your listens, share your favorites, and discover
              what's resonating with music lovers everywhere.
            </p>
            {formStatus === "success" ? (
              <div className="mt-8 rounded-full border border-[#22C55E]/30 bg-[#22C55E]/10 px-6 py-3">
                <p className="text-sm font-medium text-[#166534]">
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
                    className="h-11 rounded-full border-[#0A0A0A]/20 bg-white/80 text-[#0A0A0A] placeholder:text-[#5A5247] disabled:opacity-50"
                  />
                  {emailError && (
                    <p className="mt-2 text-xs text-[#B91C1C]">{emailError}</p>
                  )}
                </div>
                <Button
                  size="lg"
                  type="submit"
                  disabled={isPending}
                  className="h-11 rounded-full bg-[#D96A20] text-[#0A0A0A] shadow-[0_12px_30px_rgba(217,106,32,0.25)] hover:bg-[#F28C28] disabled:opacity-50"
                >
                  {isPending ? "Joining..." : "Join the waitlist"}
                </Button>
              </form>
            )}
          </div>
          <div className="relative mx-auto hidden h-[320px] w-[320px] items-center justify-center md:flex">
            <div className="relative h-[260px] w-[260px] rounded-full border border-[#0A0A0A]/20 bg-[#0A0A0A] shadow-[0_24px_60px_rgba(10,10,10,0.25)]">
              <div className="absolute inset-6 rounded-full border border-[#F5F1E6]/10" />
              <div className="absolute inset-12 rounded-full border border-[#F5F1E6]/10" />
              <div className="absolute inset-20 rounded-full border border-[#F5F1E6]/10" />
              <div className="absolute inset-[88px] rounded-full bg-[#D96A20] shadow-[0_6px_20px_rgba(217,106,32,0.35)]" />
              <div className="absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#F5F1E6]" />
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
            className="rounded-2xl border border-[#0A0A0A]/15 bg-white/70 p-6 text-[#0A0A0A] shadow-[0_20px_60px_rgba(10,10,10,0.12)] backdrop-blur"
          >
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full border border-[#0A0A0A]/15 bg-[#F5F1E6] text-lg">
                {feature.icon}
              </span>
              <h3 className="text-xl font-semibold">{feature.title}</h3>
            </div>
            <p className="mt-3 text-sm text-[#5A5247]">{feature.copy}</p>
          </div>
        ))}
      </section>

      <section className="relative mx-auto flex max-w-6xl flex-col gap-8 px-6 pb-24 md:flex-row md:items-center">
        <div className="flex-1 rounded-3xl border border-[#0A0A0A]/15 bg-white/80 p-8 text-[#0A0A0A]">
          <p className="text-sm uppercase tracking-[0.2em] text-[#5A5247]">
            How it works
          </p>
          <h2 className="mt-4 text-3xl font-semibold">
            Build a music journal that does the remembering.
          </h2>
          <p className="mt-4 text-[#5A5247]">
            Add albums in seconds, tag what resonated, and let your shelves
            evolve into a personal archive you actually want to revisit.
          </p>
        </div>
        <div className="flex-1 space-y-4 text-[#0A0A0A]">
          {[
            "Search any album and capture the moment it hits.",
            "Rate with nuance and leave notes that age well.",
            "Share a shelf when you want the room to listen.",
          ].map((step, index) => (
            <div
              key={step}
              className="flex items-start gap-4 rounded-2xl border border-[#0A0A0A]/15 bg-white/75 p-6"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[#0A0A0A]/20 text-sm font-semibold text-[#D96A20]">
                0{index + 1}
              </div>
              <p className="text-sm text-[#5A5247]">{step}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="relative mx-auto max-w-6xl px-6 pb-28">
        <div className="rounded-3xl border border-[#0A0A0A]/20 bg-gradient-to-br from-[#D96A20]/20 via-white/80 to-[#F5F1E6] p-10 text-[#0A0A0A]">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-3xl font-semibold">
                Be the first to shape the community.
              </h2>
              <p className="mt-3 text-sm text-[#5A5247]">
                Early members get priority access, product input, and the best
                discovery circles.
              </p>
            </div>
            <Button
              size="lg"
              type="button"
              className="bg-[#0A0A0A] text-[#F5F1E6] hover:bg-black"
              onClick={() => {
                emailInputRef.current?.scrollIntoView({
                  behavior: "smooth",
                  block: "center",
                });
                requestAnimationFrame(() => {
                  emailInputRef.current?.focus();
                });
              }}
            >
              Join the waitlist
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
};
