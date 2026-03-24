"use client";

import Link from "next/link";
import { SearchBar } from "@/features/search/components/SearchBar";
import { Logo } from "@/shared/ui/Logo";
import { DesktopNavMenu } from "@/features/navigation/components/DesktopNavMenu";

/**
 * Desktop navbar surface that keeps search inline with the primary auth actions.
 */
export function DesktopNavBar() {
  return (
    <div className="hidden h-[var(--header-height)] items-center justify-between gap-3 md:flex">
      <Link href="/" className="flex min-w-0 items-center space-x-2">
        <Logo />
      </Link>

      <div className="min-w-0 flex-1">
        <SearchBar />
      </div>

      <DesktopNavMenu />
    </div>
  );
}
