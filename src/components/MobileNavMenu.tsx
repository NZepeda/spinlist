import Link from "next/link";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui-core/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui-core/dropdown-menu";

/**
 * Displays a hamburger menu for mobile viewports.
 * Provides a dropdown menu that is only visible on small screens.
 */
export function MobileNavMenu() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => console.log("Login clicked")}>
          <Link href={"/login"}>Log in</Link>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => console.log("Sign up clicked")}>
          <Link href={"/signup"}>Sign up</Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
