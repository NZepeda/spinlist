import Link from "next/link";
import { Button } from "@/components/ui-core/button";

/**
 * Displays nav bar menu for desktop viewports.
 * Only visible in medium and larger viewports.
 */
export function DesktopNavMenu() {
  return (
    <div className="hidden md:flex items-center space-x-2">
      <Button variant="ghost" size="sm">
        <Link href={"/login"}>Log in</Link>
      </Button>
      <Button size="sm" onClick={() => console.log("Sign up clicked")}>
        <Link href={"/signup"}>Sign up</Link>
      </Button>
    </div>
  );
}
