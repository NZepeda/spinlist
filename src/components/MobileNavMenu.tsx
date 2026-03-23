"use client";

import Link from "next/link";
import { LogOut, User } from "lucide-react";
import { Button } from "@/components/ui-core/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui-core/dialog";
import { useAuth } from "@/hooks/useAuth";

interface MobileNavMenuProps {
  onOpenChange: (open: boolean) => void;
  open: boolean;
}

interface LoggedInMobileNavMenuProps {
  onLogout: () => Promise<void>;
  onOpenChange: (open: boolean) => void;
  username: string;
}

/**
 * Mobile nav menu content for authenticated listeners.
 * Uses full-width actions so account management stays easy to reach on narrow screens.
 */
function LoggedInMobileNavMenu(props: LoggedInMobileNavMenuProps) {
  const { onLogout, onOpenChange, username } = props;

  const handleLogout = async () => {
    try {
      await onLogout();
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to logout:", error);
    }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-[1.35rem] border border-border/70 bg-background/80 p-4">
        <div className="flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-full border border-border/70 bg-surface-elevated">
            <User className="h-5 w-5 text-muted-foreground" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Signed in as</p>
            <p className="font-medium text-foreground">@{username}</p>
          </div>
        </div>
      </div>
      <Button
        type="button"
        variant="outline"
        className="w-full justify-start rounded-[1.35rem]"
        onClick={() => {
          void handleLogout();
        }}
      >
        <LogOut className="h-4 w-4" />
        Log out
      </Button>
    </div>
  );
}

/**
 * Mobile nav menu content for signed-out listeners.
 * Uses full-width actions so authentication flows read as primary destinations.
 */
function LoggedOutMobileNavMenu({
  onOpenChange,
}: Pick<MobileNavMenuProps, "onOpenChange">) {
  return (
    <div className="space-y-3">
      <Button variant="outline" className="w-full rounded-[1.35rem]" asChild>
        <Link
          href="/login"
          onClick={() => {
            onOpenChange(false);
          }}
        >
          Log in
        </Link>
      </Button>
      <Button className="w-full rounded-[1.35rem]" asChild>
        <Link
          href="/signup"
          onClick={() => {
            onOpenChange(false);
          }}
        >
          Sign up
        </Link>
      </Button>
    </div>
  );
}

/**
 * Displays the mobile navigation sheet that owns account actions on small screens.
 */
export function MobileNavMenu(props: MobileNavMenuProps) {
  const { open, onOpenChange } = props;
  const { user, profile, logout } = useAuth();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        presentation="bottom-sheet"
        className="md:hidden"
        showCloseButton
      >
        <DialogHeader className="text-left">
          <DialogTitle>{user ? "Account" : "Welcome to Spinlist"}</DialogTitle>
          <DialogDescription>
            {user
              ? "Manage your listening account and session."
              : "Log in or create an account to start building your listening journal."}
          </DialogDescription>
        </DialogHeader>
        {user && profile ? (
          <LoggedInMobileNavMenu
            username={profile.username}
            onLogout={logout}
            onOpenChange={onOpenChange}
          />
        ) : (
          <LoggedOutMobileNavMenu onOpenChange={onOpenChange} />
        )}
      </DialogContent>
    </Dialog>
  );
}
