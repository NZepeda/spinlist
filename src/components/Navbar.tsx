"use client";

import Link from "next/link";
import { SearchBar } from "@/components/SearchBar";
import { Logo } from "./Logo";
import { DesktopNavMenu } from "./DesktopNavMenu";
import { MobileNavMenu } from "./MobileNavMenu";

/**
 * Navbar component that includes a logo, search bar and the authentication buttons.
 */
export function Navbar() {
  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center space-x-2">
          <Logo />
        </Link>

        {/* Search Bar */}
        <div className="flex-1 mx-8 max-w-md">
          <SearchBar />
        </div>

        <DesktopNavMenu />
        <MobileNavMenu />
      </div>
    </nav>
  );
}
