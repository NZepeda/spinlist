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
 * Mobile nav menu content for authenticated users.
 * Shows username and logout option.
 */
function LoggedInMobileNavMenu({
  username,
  onLogout,
}: {
  username: string;
  onLogout: () => Promise<void>;
}) {
  const handleLogout = async () => {
    try {
      await onLogout();
    } catch (error) {
      console.error("Failed to logout:", error);
    }
  };

  return (
    <>
      <DropdownMenuItem disabled>
        <User className="mr-2 h-4 w-4" />
        {username}
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem onClick={void handleLogout}>
        <LogOut className="mr-2 h-4 w-4" />
        Log out
      </DropdownMenuItem>
    </>
  );
}

/**
 * Mobile nav menu content for unauthenticated users.
 * Shows login and signup options.
 */
function LoggedOutMobileNavMenu() {
  return (
    <>
      <DropdownMenuItem>
        <Link href={"/login"}>Log in</Link>
      </DropdownMenuItem>
      <DropdownMenuItem>
        <Link href={"/signup"}>Sign up</Link>
      </DropdownMenuItem>
    </>
  );
}

/**
 * Displays a hamburger menu for mobile viewports.
 * Provides a dropdown menu that is only visible on small screens.
 * Shows login/signup options when not authenticated,
 * or username and logout when authenticated.
 */
export function MobileNavMenu() {
  const { user, profile, logout } = useAuth();

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
          <LoggedInMobileNavMenu
            username={profile.username}
            onLogout={logout}
          />
        ) : (
          <LoggedOutMobileNavMenu />
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
