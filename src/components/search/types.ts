import type { SearchResultItem } from "@/hooks/useSearchQueryState";
import type { SearchResponseDTO } from "@/lib/types";

export type SearchBarVariant = "compact" | "hero";

export type SearchDisplayState =
  | {
      // No query exists yet, so the UI should stay in its pre-search state.
      kind: "idle";
    }
  | {
      // A query exists, but debounce has not settled, so the next request has not started.
      kind: "waiting";
    }
  | {
      // Debounce has settled and the UI is now waiting for the latest result payload.
      kind: "loading";
    }
  | {
      // The request failed and the UI should explain that recovery requires another attempt.
      kind: "error";
      message: string;
    }
  | {
      // The request succeeded, but there was nothing useful to show for that query.
      kind: "empty";
    }
  | {
      // The request succeeded and the UI has concrete artist or album choices to render.
      kind: "results";
      results: SearchResponseDTO;
    };

export interface SearchBarProps {
  placeholder?: string;
  variant?: SearchBarVariant;
}

export interface SearchInteractionProps {
  clearSelectionError: () => void;
  displayState: SearchDisplayState;
  handleResultSelect: (
    item: SearchResultItem,
    options?: {
      onSuccess?: () => void;
    },
  ) => Promise<void>;
  placeholder: string;
  searchValue: string;
  selectionError: string | null;
  setSearchValue: (value: string) => void;
  variant: SearchBarVariant;
}

export type DesktopSearchProps = SearchInteractionProps;

export interface MobileSearchDialogProps extends SearchInteractionProps {
  clearSearch: () => void;
}
