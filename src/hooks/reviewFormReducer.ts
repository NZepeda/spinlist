export interface ReviewFormState {
  rating: number;
  reviewText: string;
  favoriteTrackId: string;
  errors: {
    rating?: string;
    reviewText?: string;
    general?: string;
  };
}

type ReviewFormAction =
  | { type: "SET_RATING"; payload: number }
  | { type: "SET_REVIEW_TEXT"; payload: string }
  | { type: "SET_FAVORITE_TRACK"; payload: string }
  | {
      type: "SET_ERROR";
      field: keyof ReviewFormState["errors"];
      message: string;
    }
  | { type: "SET_ERRORS"; payload: ReviewFormState["errors"] }
  | { type: "CLEAR_ERRORS" }
  | { type: "RESET" }
  | {
      type: "INITIALIZE";
      payload: { rating: number; reviewText: string; favoriteTrackId: string };
    };

export const reviewFormInitialState: ReviewFormState = {
  rating: 0,
  reviewText: "",
  favoriteTrackId: "",
  errors: {},
};

/**
 * State reducer for managing the review form state.
 */
export function reviewFormReducer(
  state: ReviewFormState,
  action: ReviewFormAction
): ReviewFormState {
  switch (action.type) {
    case "SET_RATING":
      return {
        ...state,
        rating: action.payload,
        errors: { ...state.errors, rating: undefined },
      };
    case "SET_REVIEW_TEXT":
      return {
        ...state,
        reviewText: action.payload,
        errors: { ...state.errors, reviewText: undefined },
      };
    case "SET_FAVORITE_TRACK":
      return {
        ...state,
        favoriteTrackId: action.payload,
      };
    case "SET_ERROR":
      return {
        ...state,
        errors: { ...state.errors, [action.field]: action.message },
      };
    case "SET_ERRORS":
      return {
        ...state,
        errors: action.payload,
      };
    case "CLEAR_ERRORS":
      return { ...state, errors: {} };
    case "RESET":
      return reviewFormInitialState;
    case "INITIALIZE":
      return {
        ...state,
        rating: action.payload.rating,
        reviewText: action.payload.reviewText,
        favoriteTrackId: action.payload.favoriteTrackId,
        errors: {},
      };
    default:
      return state;
  }
}
