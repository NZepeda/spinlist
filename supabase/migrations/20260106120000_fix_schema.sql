-- Drop existing triggers on auth.users if they exist
DO $$
BEGIN
  DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- Drop existing incomplete tables if they exist (CASCADE will drop dependent triggers)
DROP TABLE IF EXISTS reviews CASCADE;
DROP TABLE IF EXISTS albums CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- Drop existing functions if they exist
DROP FUNCTION IF EXISTS handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS update_album_stats() CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- PROFILES TABLE
-- =============================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================
-- ALBUMS TABLE
-- =============================================
CREATE TABLE albums (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  spotify_id TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  artist TEXT NOT NULL,
  release_date DATE,
  cover_url TEXT,
  avg_rating DECIMAL(3,2) DEFAULT 0 CHECK (avg_rating >= 0 AND avg_rating <= 5),
  review_count INT DEFAULT 0 CHECK (review_count >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_synced_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================
-- REVIEWS TABLE
-- =============================================
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  album_id UUID NOT NULL REFERENCES albums(id) ON DELETE CASCADE,
  rating DECIMAL(2,1) NOT NULL CHECK (rating >= 1.0 AND rating <= 5.0),
  review_text TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, album_id)
);

-- =============================================
-- INDEXES
-- =============================================
CREATE INDEX idx_reviews_album_id ON reviews(album_id);
CREATE INDEX idx_reviews_user_id ON reviews(user_id);
CREATE INDEX idx_reviews_created_at ON reviews(created_at DESC);
CREATE INDEX idx_albums_avg_rating ON albums(avg_rating DESC);
CREATE INDEX idx_albums_review_count ON albums(review_count DESC);
CREATE INDEX idx_albums_spotify_id ON albums(spotify_id);

-- =============================================
-- FUNCTIONS & TRIGGERS
-- =============================================

-- Function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to profiles
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Apply updated_at trigger to reviews
CREATE TRIGGER update_reviews_updated_at
  BEFORE UPDATE ON reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to recalculate album avg_rating and review_count
CREATE OR REPLACE FUNCTION update_album_stats()
RETURNS TRIGGER AS $$
DECLARE
  album_uuid UUID;
BEGIN
  -- Determine which album to update
  IF TG_OP = 'DELETE' THEN
    album_uuid := OLD.album_id;
  ELSE
    album_uuid := NEW.album_id;
  END IF;

  -- Update album stats
  UPDATE albums
  SET
    avg_rating = COALESCE((
      SELECT ROUND(AVG(rating)::numeric, 2)
      FROM reviews
      WHERE album_id = album_uuid
    ), 0),
    review_count = (
      SELECT COUNT(*)
      FROM reviews
      WHERE album_id = album_uuid
    )
  WHERE id = album_uuid;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger to update album stats when reviews change
CREATE TRIGGER update_album_stats_on_review_change
  AFTER INSERT OR UPDATE OR DELETE ON reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_album_stats();

-- Function to auto-create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, username, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', 'user_' || substr(NEW.id::text, 1, 8)),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile when auth.users row is created
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE albums ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Profiles: Public read, users can update their own
CREATE POLICY "Profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Albums: Public read, authenticated users can create (for caching Spotify data)
CREATE POLICY "Albums are viewable by everyone"
  ON albums FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create albums"
  ON albums FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Reviews: Public read, users can CRUD their own
CREATE POLICY "Reviews are viewable by everyone"
  ON reviews FOR SELECT
  USING (true);

CREATE POLICY "Users can create their own reviews"
  ON reviews FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reviews"
  ON reviews FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reviews"
  ON reviews FOR DELETE
  USING (auth.uid() = user_id);
