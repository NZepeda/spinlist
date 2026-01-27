-- Create artists table for storing artist metadata
-- Required for artist_slugs foreign key relationship

CREATE TABLE artists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  spotify_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_synced_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for spotify_id lookups (fetching artist by Spotify ID)
CREATE INDEX idx_artists_spotify_id ON artists(spotify_id);

-- Enable Row Level Security
ALTER TABLE artists ENABLE ROW LEVEL SECURITY;

-- Anyone can view artists
CREATE POLICY "Artists are viewable by everyone"
  ON artists FOR SELECT
  USING (true);

-- Authenticated users can create artists (needed for slug creation)
CREATE POLICY "Authenticated users can create artists"
  ON artists FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Authenticated users can update artists (for syncing data)
CREATE POLICY "Authenticated users can update artists"
  ON artists FOR UPDATE
  USING (auth.role() = 'authenticated');
