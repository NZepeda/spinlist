import { describe, it, expect } from "vitest";
import {
  reviewFormReducer,
  reviewFormInitialState,
  ReviewFormState,
} from "./reviewFormReducer";

describe("reviewFormReducer", () => {
  it("returns the initial state by default", () => {
    const state = reviewFormReducer(reviewFormInitialState, {
      type: "RESET",
    });
    expect(state).toEqual(reviewFormInitialState);
  });

  describe("SET_RATING", () => {
    it("updates the rating", () => {
      const state = reviewFormReducer(reviewFormInitialState, {
        type: "SET_RATING",
        payload: 4,
      });
      expect(state.rating).toBe(4);
    });

    it("clears the rating error when setting a rating", () => {
      const stateWithError: ReviewFormState = {
        ...reviewFormInitialState,
        errors: { rating: "Please select a rating" },
      };
      const state = reviewFormReducer(stateWithError, {
        type: "SET_RATING",
        payload: 3,
      });
      expect(state.errors.rating).toBeUndefined();
    });
  });

  describe("SET_REVIEW_TEXT", () => {
    it("updates the review text", () => {
      const state = reviewFormReducer(reviewFormInitialState, {
        type: "SET_REVIEW_TEXT",
        payload: "Great album!",
      });
      expect(state.reviewText).toBe("Great album!");
    });

    it("clears the reviewText error", () => {
      const stateWithError: ReviewFormState = {
        ...reviewFormInitialState,
        errors: { reviewText: "Too long" },
      };
      const state = reviewFormReducer(stateWithError, {
        type: "SET_REVIEW_TEXT",
        payload: "Short text",
      });
      expect(state.errors.reviewText).toBeUndefined();
    });
  });

  describe("SET_FAVORITE_TRACK", () => {
    it("updates the favorite track ID", () => {
      const state = reviewFormReducer(reviewFormInitialState, {
        type: "SET_FAVORITE_TRACK",
        payload: "track-123",
      });
      expect(state.favoriteTrackId).toBe("track-123");
    });
  });

  describe("SET_ERROR", () => {
    it("sets a specific error field", () => {
      const state = reviewFormReducer(reviewFormInitialState, {
        type: "SET_ERROR",
        field: "rating",
        message: "Rating is required",
      });
      expect(state.errors.rating).toBe("Rating is required");
    });

    it("preserves existing errors when adding a new one", () => {
      const stateWithError: ReviewFormState = {
        ...reviewFormInitialState,
        errors: { rating: "Rating is required" },
      };
      const state = reviewFormReducer(stateWithError, {
        type: "SET_ERROR",
        field: "general",
        message: "Something went wrong",
      });
      expect(state.errors.rating).toBe("Rating is required");
      expect(state.errors.general).toBe("Something went wrong");
    });
  });

  describe("SET_ERRORS", () => {
    it("replaces all errors", () => {
      const state = reviewFormReducer(reviewFormInitialState, {
        type: "SET_ERRORS",
        payload: { rating: "Bad rating", reviewText: "Too long" },
      });
      expect(state.errors).toEqual({
        rating: "Bad rating",
        reviewText: "Too long",
      });
    });
  });

  describe("CLEAR_ERRORS", () => {
    it("clears all errors", () => {
      const stateWithErrors: ReviewFormState = {
        ...reviewFormInitialState,
        errors: { rating: "Bad", general: "Error" },
      };
      const state = reviewFormReducer(stateWithErrors, {
        type: "CLEAR_ERRORS",
      });
      expect(state.errors).toEqual({});
    });
  });

  describe("RESET", () => {
    it("resets to initial state", () => {
      const modifiedState: ReviewFormState = {
        rating: 4,
        reviewText: "Great album",
        favoriteTrackId: "track-1",
        errors: { general: "Error" },
      };
      const state = reviewFormReducer(modifiedState, { type: "RESET" });
      expect(state).toEqual(reviewFormInitialState);
    });
  });

  describe("INITIALIZE", () => {
    it("initializes with provided values and clear errors", () => {
      const stateWithErrors: ReviewFormState = {
        ...reviewFormInitialState,
        errors: { general: "Old error" },
      };
      const state = reviewFormReducer(stateWithErrors, {
        type: "INITIALIZE",
        payload: {
          rating: 3.5,
          reviewText: "Good album",
          favoriteTrackId: "track-5",
        },
      });
      expect(state.rating).toBe(3.5);
      expect(state.reviewText).toBe("Good album");
      expect(state.favoriteTrackId).toBe("track-5");
      expect(state.errors).toEqual({});
    });
  });
});
