"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SearchBar } from "@/components/SearchBar";

/**
 * Navbar component that includes a logo, search bar and the authentication buttons.
 */
export function Navbar() {
  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2">
          <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">S</span>
          </div>
          <span className="hidden font-bold sm:inline-block">SpinList</span>
        </Link>

        {/* Search Bar */}
        <div className="flex-1 mx-8 max-w-md">
          <SearchBar />
        </div>

        {/* Auth Buttons */}
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => console.log("Login clicked")}
          >
            Log in
          </Button>
          <Button size="sm" onClick={() => console.log("Sign up clicked")}>
            Sign up
          </Button>
        </div>
      </div>
    </nav>
  );
}
