"use client";

import { useState } from "react";
import { Button } from "@/components/core/button";
import { Textarea } from "@/components/core/textarea";
import { StarRating } from "@/components/ui/StarRating";

type ReviewFormProps = {
  albumId: string;
  onReviewSubmit: (review: {
    id: string;
    userId: string;
    username: string;
    rating: number;
    content: string;
  }) => void;
};

export default function ReviewForm({ onReviewSubmit }: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [content, setContent] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, you'd send this to your API
    const newReview = {
      id: Date.now().toString(),
      userId: "currentUser",
      username: "Current User",
      rating,
      content,
    };
    onReviewSubmit(newReview);
    setRating(0);
    setContent("");
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 p-6 rounded-lg shadow-md"
    >
      <h3 className="text-xl font-bold">Write a Review</h3>
      <div className="flex items-center space-x-2">
        <StarRating rating={3} onRatingChange={setRating} />
      </div>
      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Write your review here..."
        rows={4}
        className="w-full p-2 border rounded-md"
      />
      <Button type="submit" disabled={rating === 0 || content.trim() === ""}>
        Submit Review
      </Button>
    </form>
  );
}
