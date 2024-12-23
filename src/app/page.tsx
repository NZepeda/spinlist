import { Star, TrendingUp, Users } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/core/button";
import { Input } from "@/components/core/input";
import { NavBar } from "@/components/NavBar";
const HeroSection = () => {
  return (
    <section className="w-full flex justify-center py-12 md:py-24 lg:py-32 xl:py-48">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center space-y-4 text-center">
          <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
              Discover, Rate, and Share Your Favorite Albums
            </h1>
            <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
              Join the community of music enthusiasts. Track your listening
              journey, rate albums, and connect with like-minded fans.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

const JoinSection = () => {
  return (
    <section className="w-full flex justify-center py-12 md:py-24 lg:py-32">
      <div className="container px-4 md:px-6 w-full">
        <div className="flex flex-col items-center space-y-4 text-center">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
              Join Spinlist Today
            </h2>
            <p className="max-w-[600px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
              Start your musical journey. Rate albums, discover new music, and
              connect with other fans.
            </p>
          </div>
          <div className="w-full max-w-sm space-y-2">
            <form className="flex space-x-2">
              <Input
                className="max-w-lg flex-1"
                placeholder="Enter your email"
                type="email"
              />
              <Button type="submit">Sign Up</Button>
            </form>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              By signing up, you agree to our{""}
              <Link className="underline underline-offset-2" href="#">
                Terms & Conditions
              </Link>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

const FeaturesSection = () => {
  return (
    <section className="w-full flex justify-center py-12 md:py-24 lg:py-32 bg-gray-100 dark:bg-gray-800">
      <div className="container px-4 md:px-6">
        <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl text-center mb-12">
          Features
        </h2>
        <div className="grid gap-10 sm:grid-cols-2 md:grid-cols-3">
          <div className="flex flex-col items-center space-y-2 border-gray-800 p-4 rounded-lg">
            <Star className="h-10 w-10 mb-2" />
            <h3 className="text-xl font-bold">Rate Albums</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
              Share your thoughts and rate albums on a five-star scale.
            </p>
          </div>
          <div className="flex flex-col items-center space-y-2 border-gray-800 p-4 rounded-lg">
            <TrendingUp className="h-10 w-10 mb-2" />
            <h3 className="text-xl font-bold">Track Your Listening</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
              {
                "Keep a record of the albums you've listened to and want to hear."
              }
            </p>
          </div>
          <div className="flex flex-col items-center space-y-2 border-gray-800 p-4 rounded-lg">
            <Users className="h-10 w-10 mb-2" />
            <h3 className="text-xl font-bold">Connect with Fans</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
              Follow other users and discover new music through their ratings.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <NavBar />
      <div className="flex-1 w-full">
        <HeroSection />
        <FeaturesSection />
        <JoinSection />
      </div>
    </div>
  );
}
