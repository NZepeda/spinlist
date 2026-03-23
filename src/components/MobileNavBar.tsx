"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, Search } from "lucide-react";
import { SearchBar } from "@/components/SearchBar";
import { Button } from "@/components/ui-core/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui-core/dialog";
import { Logo } from "./Logo";
import { MobileNavMenu } from "./MobileNavMenu";

type ActiveMobileSurface = "menu" | "search" | null;

/**
 * Mobile navbar surface that owns search and menu overlays for small screens.
 */
export function MobileNavBar() {
  const [activeMobileSurface, setActiveMobileSurface] =
    useState<ActiveMobileSurface>(null);

  const isMobileMenuOpen = activeMobileSurface === "menu";
  const isMobileSearchOpen = activeMobileSurface === "search";

  return (
    <div className="flex h-[var(--header-height)] items-center justify-between gap-3 md:hidden">
      <Link href="/" className="flex min-w-0 items-center space-x-2">
        <Logo />
      </Link>

      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          aria-label="Open search"
          onClick={() => {
            setActiveMobileSurface("search");
          }}
        >
          <Search className="h-5 w-5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Open menu"
          onClick={() => {
            setActiveMobileSurface("menu");
          }}
        >
          <Menu className="h-5 w-5" />
        </Button>
      </div>

      <MobileNavMenu
        open={isMobileMenuOpen}
        onOpenChange={(open) => {
          setActiveMobileSurface(open ? "menu" : null);
        }}
      />
      <Dialog
        open={isMobileSearchOpen}
        onOpenChange={(open) => {
          setActiveMobileSurface(open ? "search" : null);
        }}
      >
        <DialogContent
          presentation="full-screen"
          className="grid-rows-[auto_minmax(0,1fr)] md:hidden"
          showCloseButton
        >
          <DialogHeader className="text-left">
            <DialogTitle>Search Spinlist</DialogTitle>
            <DialogDescription>
              Search albums and artists, then jump straight into the music.
            </DialogDescription>
          </DialogHeader>
          <SearchBar
            autoFocus
            onSelectionComplete={() => {
              setActiveMobileSurface(null);
            }}
            placeholder="Search for an album or artist"
            variant="sheet"
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
