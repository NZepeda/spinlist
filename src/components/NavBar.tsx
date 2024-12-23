import { Button } from "./core/button";

import { Disc3 } from "lucide-react";

import Link from "next/link";

/**
 * Displays the login and sign up buttons when the user is not logged in.
 * When the user is logged in, it displays the user's profile picture and name, along with a search bar in the middle to search for albums.
 */
export const NavBar = () => {
  return (
    <header className="px-4 lg:px-6 h-14 flex items-center">
      <Link className="flex items-center justify-center" href="#">
        <Disc3 className="h-6 w-6" />
        <span className="ml-2 text-lg font-bold">spinlist</span>
      </Link>
      <nav className="ml-auto flex items-center gap-4 sm:gap-6">
        <Button variant="ghost" asChild>
          <Link href="/login">Log In</Link>
        </Button>
        <Button asChild>
          <Link href="#">Sign Up</Link>
        </Button>
      </nav>
    </header>
  );
};
