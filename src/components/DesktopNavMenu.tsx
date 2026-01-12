"use client";

import Link from "next/link";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui-core/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui-core/dropdown-menu";
import { useAuth } from "@/hooks/useAuth";

/**
 * Displays nav bar menu for desktop viewports.
 * Only visible in medium and larger viewports.
 * Shows login/signup buttons when not authenticated,
 * or username dropdown with logout when authenticated.
 */
export function DesktopNavMenu() {
  const { user, profile, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Failed to logout:", error);
    }
  };

  if (user && profile) {
    return (
      <div className="hidden md:flex items-center space-x-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              {profile.username}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  }

  return (
    <div className="hidden md:flex items-center space-x-2">
      <Button variant="ghost" size="sm">
        <Link href={"/login"}>Log in</Link>
      </Button>
      <Button size="sm">
        <Link href={"/signup"}>Sign up</Link>
      </Button>
    </div>
  );
}
