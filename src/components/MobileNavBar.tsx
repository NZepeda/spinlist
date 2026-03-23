"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu } from "lucide-react";
import { SearchBar } from "@/components/SearchBar";
import { Button } from "@/components/ui-core/button";
import { Logo } from "./Logo";
import { MobileNavMenu } from "./MobileNavMenu";

/**
 * Mobile navbar surface that keeps search self-contained while the menu remains navbar-owned.
 */
export function MobileNavBar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="flex h-[var(--header-height)] items-center justify-between gap-3 md:hidden">
      <Link href="/" className="flex min-w-0 items-center space-x-2">
        <Logo />
      </Link>

      <div className="flex items-center gap-1">
        <SearchBar />
        <Button
          variant="ghost"
          size="icon"
          aria-label="Open menu"
          onClick={() => {
            setIsMobileMenuOpen(true);
          }}
        >
          <Menu className="h-5 w-5" />
        </Button>
      </div>

      <MobileNavMenu
        open={isMobileMenuOpen}
        onOpenChange={(open) => {
          setIsMobileMenuOpen(open);
        }}
      />
    </div>
  );
}
