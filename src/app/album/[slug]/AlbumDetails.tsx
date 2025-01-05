"use client";

import { getAlbum } from "@/lib/actions/getAlbum";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import Image from "next/image";
import { StarRating } from "@/components/ui/StarRating";
import TrackList from "./TrackList";
// import { useState } from "react";
// import Image from "next/image";
// import { Star, User } from "lucide-react";
// import ReviewForm from "./ReviewForm";
// import TrackList from "./TrackList";
// import { StarRating } from "@/components/ui/StarRating";

// type Album = {
//   id: string;
//   title: string;
//   artist: string;
//   releaseDate: string;
//   artwork: string;
//   tracks: string[];
// };

// type Review = {
//   id: string;
//   userId: string;
//   username: string;
//   rating: number;
//   content: string;
// };

// type StarRating = {
//   [key: number]: number;
// };

export const AlbumDetails = () => {
  const params = useParams<{ slug: string }>();
  const albumId = params.slug;

  const { data: album, isLoading } = useQuery({
    queryKey: ["album"],
    queryFn: () => getAlbum(albumId),
  });

  console.log("album", album);

  // const handleFavoriteTrackSelect = (track: string) => {
  //   setFavoriteTrack(track);
  //   // In a real app, you'd send this to your API to update the user's favorite track
  //   console.log(`Favorite track set to: ${track}`);
  // };

  //const album = await getAlbum(albumId);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-8 p-8 rounded-lg">
      <div className="flex flex-col md:flex-row gap-8">
        <div className="w-full md:w-1/3">
          <Image
            src={album.images[0].url}
            alt={`${album.title} artwork`}
            width={300}
            height={300}
            className="rounded-lg shadow-lg"
          />
        </div>
        <div className="w-full md:w-2/3 space-y-4">
          <h1>{album.title}</h1>
          <p className="text-xl">{album.artist}</p>
          <p>{album.releaseDate}</p>
          {/* <div className="flex items-center space-x-2">
            <StarRating rating={4} />
            <span className="text-2xl font-bold">
              {(
                reviews.reduce((acc, review) => acc + review.rating, 0) /
                reviews.length
              ).toFixed(1)}
            </span>
            <span>({reviews.length} reviews)</span>
          </div> */}
        </div>
      </div>

      {/* <TrackList
        tracks={album.tracks}
        isLoggedIn={isLoggedIn}
        favoriteTrack={favoriteTrack}
        onFavoriteSelect={handleFavoriteTrackSelect}
      /> */}

      <div className="space-y-4">
        <h2>Reviews</h2>
        <div className="grid grid-cols-2 gap-4">
          {/* {Object.entries(starRatings).map(([star, count]) => (
            <div key={star} className="flex items-center space-x-2">
              <span>
                {star} star{parseInt(star) !== 1 ? "s" : ""}
              </span>
              <div className="flex-grow bg-gray-700 rounded-full h-2.5">
                <div
                  className="bg-yellow-500 h-2.5 rounded-full"
                  style={{ width: `${(count / reviews.length) * 100}%` }}
                ></div>
              </div>
              <span>{count}</span>
            </div>
          ))} */}
        </div>
      </div>

      {/* {isLoggedIn && (
        <ReviewForm
          albumId={albumId}
          onReviewSubmit={(newReview) => setReviews([...reviews, newReview])}
        />
      )} */}

      {/* <div className="space-y-4">
        {reviews.map((review) => (
          <div key={review.id} className="p-4 rounded-lg shadow-md">
            <div className="flex items-center space-x-2 mb-2">
              <User className="w-6 h-6" />
              <span className="font-semibold">{review.username}</span>
              <div className="flex">
                <StarRating rating={1} />
              </div>
            </div>
            <p>{review.content}</p>
          </div>
        ))}
      </div> */}
    </div>
  );
};
