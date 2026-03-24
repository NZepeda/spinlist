"use client";

import { DesktopNavBar } from "./DesktopNavBar";
import { MobileNavBar } from "./MobileNavBar";

/**
 * Navbar component that renders dedicated desktop and mobile navbar surfaces.
 */
export function Navbar() {
  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/70 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="app-shell">
        <DesktopNavBar />
        <MobileNavBar />
      </div>
    </nav>
  );
}
