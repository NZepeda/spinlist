"use client";

import { Button } from "@/components/core/button";
import Link from "next/link";
import { SpotifySearch } from "../SpotifySearch";

export const LoggedOutNavBar = () => {
  return (
    <div className="ml-auto flex justify-center items-center">
      <SpotifySearch />
      <div>
        <Button variant="ghost" asChild>
          <Link href="/login">Log In</Link>
        </Button>
        <Button asChild>
          <Link href="/signup">Sign Up</Link>
        </Button>
      </div>
    </div>
  );
};
