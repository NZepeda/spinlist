"use client";

import { Search } from "lucide-react";
import { Button } from "@/shared/ui/button";
import type { SearchBarVariant } from "@/features/search/types";

interface SearchDialogButtonProps {
  onOpen: () => void;
  placeholder: string;
  variant: SearchBarVariant;
}

/**
 * Renders the mobile affordance that opens the full-screen search dialog.
 *
 * @param props - The current placeholder, variant, and open callback.
 * @returns The button that opens the mobile search dialog.
 */
export function SearchDialogButton(props: SearchDialogButtonProps) {
  const { onOpen, placeholder, variant } = props;

  if (variant === "hero") {
    return (
      <button
        type="button"
        aria-label="Open search"
        className="flex w-full items-center gap-3 rounded-[1.75rem] border border-border/70 bg-surface/95 p-2 text-left shadow-[0_20px_40px_var(--brand-shadow-soft)] backdrop-blur md:hidden"
        onClick={onOpen}
      >
        <div className="flex w-full items-center gap-3 rounded-[1.2rem] border border-border/70 bg-background px-4 py-5">
          <Search className="h-5 w-5 text-muted-foreground" />
          <span className="truncate text-base text-muted-foreground">
            {placeholder}
          </span>
        </div>
      </button>
    );
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      aria-label="Open search"
      className="md:hidden"
      onClick={onOpen}
    >
      <Search className="h-5 w-5" />
    </Button>
  );
}
