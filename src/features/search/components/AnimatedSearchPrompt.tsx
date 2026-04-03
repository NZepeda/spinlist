import type { HTMLAttributes } from "react";
import { TypeAnimation } from "react-type-animation";
import { cn } from "@/shared/utils/cn";

const SEARCH_SUGGESTIONS = [
  '"Bad Bunny"',
  '"GNX"',
  '"Abbey Road"',
  '"Never Enough"',
  '"Taylor Swift"',
  '"Tame Impala Deadbeat"',
  '"Paramore Riot!"',
] as const;

type AnimatedSearchPromptProps = HTMLAttributes<HTMLDivElement>;

/**
 * Displays some text with a type/delete/type animation.
 * Inspired by Depop's search field animation.
 */
export function AnimatedSearchPrompt(props: AnimatedSearchPromptProps) {
  const { className, ...divProps } = props;

  return (
    <div
      aria-hidden="true"
      className={cn(
        "pointer-events-none flex w-full min-w-0 items-center overflow-hidden whitespace-nowrap text-muted-foreground",
        className,
      )}
      {...divProps}
    >
      <span className="shrink-0 pr-1">Search for </span>
      <TypeAnimation
        wrapper={"span"}
        className="block min-w-0 flex-1 overflow-hidden text-ellipsis whitespace-nowrap"
        speed={10}
        deletionSpeed={80}
        repeat={Infinity}
        sequence={SEARCH_SUGGESTIONS.flatMap((suggestion) => {
          return [suggestion, 800];
        })}
        cursor={false}
      />
    </div>
  );
}
