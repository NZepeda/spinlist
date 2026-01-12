"use client";

import Link from "next/link";
import { Menu, LogOut, User } from "lucide-react";
import { Button } from "@/components/ui-core/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui-core/dropdown-menu";
import { useAuth } from "@/hooks/useAuth";

/**
 * Displays a hamburger menu for mobile viewports.
 * Provides a dropdown menu that is only visible on small screens.
 * Shows login/signup options when not authenticated,
 * or username and logout when authenticated.
 */
export function MobileNavMenu() {
  const { user, profile, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Failed to logout:", error);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {user && profile ? (
          <>
            <DropdownMenuItem disabled>
              <User className="mr-2 h-4 w-4" />
              {profile.username}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Log out
            </DropdownMenuItem>
          </>
        ) : (
          <>
            <DropdownMenuItem>
              <Link href={"/login"}>Log in</Link>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Link href={"/signup"}>Sign up</Link>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
