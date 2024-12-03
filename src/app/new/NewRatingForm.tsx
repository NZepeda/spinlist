"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { Button } from "@/components/ui/button";

const formSchema = z.object({
  albumId: z.string().min(1, "Please select an album"),
  rating: z.number().min(0.5).max(5).step(0.5),
  review: z.string().optional(),
  favoriteTrack: z.string().optional(),
  leastFavoriteTrack: z.string().optional(),
});

export default function NewRatingForm() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      albumId: "",
      rating: 0,
      review: "",
      favoriteTrack: "",
      leastFavoriteTrack: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    // TODO: Implement the API call to submit the rating
    console.log(values);
    // Reset form and selected album after submission
    form.reset();
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
      <Button type="submit">Submit Rating</Button>
    </form>
  );
}
