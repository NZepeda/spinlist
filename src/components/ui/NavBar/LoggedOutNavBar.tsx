"use client";

import Link from "next/link";
import { SpotifySearch } from "../SpotifySearch";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/core/button";

const DesktopNavbarActions = () => {
  return (
    <div className="hidden lg:block">
      <Button variant="ghost" asChild>
        <Link href="/login">Log In</Link>
      </Button>
      <Button asChild>
        <Link href="/signup">Sign Up</Link>
      </Button>
    </div>
  );
};

const MobileNavbarActions = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  return (
    <div className="lg:hidden">
      <Button
        variant="ghost"
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        aria-expanded={isMenuOpen}
        aria-controls="mobile-menu"
        aria-label="Main menu"
        className="px-0 [&_svg]:size-7"
        size="icon"
      >
        {isMenuOpen ? <X /> : <Menu />}
      </Button>
      {isMenuOpen && (
        <div
          id="mobile-menu"
          role="menu"
          aria-orientation="vertical"
          aria-labelledby="menu-button"
          className="absolute right-4 top-16 w-48 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5"
        >
          <div className="py-1 flex flex-col">
            <Link
              href="/login"
              className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              onClick={() => setIsMenuOpen(false)}
              role="menuitem"
            >
              Log In
            </Link>
            <Link
              href="/signup"
              className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              onClick={() => setIsMenuOpen(false)}
              role="menuitem"
            >
              Sign Up
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export const LoggedOutNavBar = () => {
  return (
    <div className="ml-auto flex justify-center items-center">
      <SpotifySearch />
      <DesktopNavbarActions />
      <MobileNavbarActions />
    </div>
  );
};
