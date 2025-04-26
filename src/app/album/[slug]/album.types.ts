export interface Album {
  id: string;
  spotify_id: string;
  title: string;
  artist: string;
  artist_id: string;
  cover_url: string | null;
  release_date: string;
  tracks: {
    id: string;
    name: string;
    duration_ms: number;
    track_number: number;
  }[];
  avg_rating: number | null;
  total_reviews: number;
  spotify_updated_at: Date;
}
