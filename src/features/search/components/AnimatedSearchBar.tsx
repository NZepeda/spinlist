"use client";

import type { Ref } from "react";
import { Search } from "lucide-react";
import { CommandInput } from "@/shared/ui/command";
import { cn } from "@/shared/utils/cn";
import { AnimatedSearchPrompt } from "./AnimatedSearchPrompt";

interface AnimatedSearchBarProps {
  autoFocus?: boolean;
  className?: string;
  inputRef?: Ref<HTMLInputElement>;
  onValueChange: (value: string) => void;
  placeholder?: string;
  value: string;
}

/**
 * Shares the compact animated search input so desktop and mobile navbar search stay visually aligned.
 *
 * @param props - Input wiring and styling hooks for the shared compact search field.
 * @returns The animated search input used by the compact navbar search surfaces.
 */
export function AnimatedSearchBar(props: AnimatedSearchBarProps) {
  const {
    autoFocus = false,
    className,
    inputRef,
    onValueChange,
    placeholder,
    value,
  } = props;

  return (
    <div
      className={cn(
        "grid w-full grid-cols-[auto_minmax(0,1fr)] items-center gap-3",
        className,
      )}
    >
      <Search
        data-slot="animated-search-icon"
        className="text-muted-foreground"
      />
      <div className="grid min-w-0 items-center [grid-template-areas:'stack']">
        <AnimatedSearchPrompt
          data-slot="animated-search-prompt"
          className={cn(
            "[grid-area:stack] transition-opacity",
            value.length === 0
              ? "flex items-center opacity-100"
              : "invisible flex items-center opacity-0",
          )}
        />
        <CommandInput
          ref={inputRef}
          autoFocus={autoFocus}
          data-slot="animated-search-input"
          placeholder={placeholder}
          value={value}
          onValueChange={onValueChange}
          className="z-10 flex w-full rounded-md bg-transparent [grid-area:stack] outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
        />
      </div>
    </div>
  );
}
