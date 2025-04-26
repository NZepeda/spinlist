-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum for rating values
CREATE TYPE rating_value AS ENUM ('0.5', '1.0', '1.5', '2.0', '2.5', '3.0', '3.5', '4.0', '4.5', '5.0');

-- Users table (extends Supabase auth.users)
CREATE TABLE profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    full_name TEXT,
    bio TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Albums table
CREATE TABLE albums (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    spotify_id TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    artist TEXT NOT NULL,
    artist_id TEXT NOT NULL,
    cover_url TEXT,
    release_date DATE,
    spotify_updated_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Reviews table
CREATE TABLE reviews (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    album_id UUID REFERENCES albums(id) ON DELETE CASCADE NOT NULL,
    rating rating_value NOT NULL,
    review_text TEXT,
    favorite_track TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(user_id, album_id)
);

-- Top albums table
CREATE TABLE top_albums (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    album_id UUID REFERENCES albums(id) ON DELETE CASCADE NOT NULL,
    position INTEGER NOT NULL CHECK (position BETWEEN 1 AND 8),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(user_id, position)
);

-- Follows table
CREATE TABLE follows (
    follower_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    following_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    PRIMARY KEY (follower_id, following_id),
    CHECK (follower_id != following_id)
);

-- Create indexes for better query performance
CREATE INDEX idx_albums_spotify_id ON albums(spotify_id);
CREATE INDEX idx_reviews_user_id ON reviews(user_id);
CREATE INDEX idx_reviews_album_id ON reviews(album_id);
CREATE INDEX idx_top_albums_user_id ON top_albums(user_id);
CREATE INDEX idx_follows_follower_id ON follows(follower_id);
CREATE INDEX idx_follows_following_id ON follows(following_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_albums_updated_at
    BEFORE UPDATE ON albums
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reviews_updated_at
    BEFORE UPDATE ON reviews
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_top_albums_updated_at
    BEFORE UPDATE ON top_albums
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create RLS policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE albums ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE top_albums ENABLE ROW LEVEL SECURITY;
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone"
    ON profiles FOR SELECT
    USING (true);

CREATE POLICY "Users can update their own profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = id);

-- Albums policies
CREATE POLICY "Albums are viewable by everyone"
    ON albums FOR SELECT
    USING (true);

CREATE POLICY "Albums can be inserted by authenticated users"
    ON albums FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

-- Reviews policies
CREATE POLICY "Reviews are viewable by everyone"
    ON reviews FOR SELECT
    USING (true);

CREATE POLICY "Users can insert their own reviews"
    ON reviews FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reviews"
    ON reviews FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reviews"
    ON reviews FOR DELETE
    USING (auth.uid() = user_id);

-- Top albums policies
CREATE POLICY "Top albums are viewable by everyone"
    ON top_albums FOR SELECT
    USING (true);

CREATE POLICY "Users can manage their own top albums"
    ON top_albums FOR ALL
    USING (auth.uid() = user_id);

-- Follows policies
CREATE POLICY "Follows are viewable by everyone"
    ON follows FOR SELECT
    USING (true);

CREATE POLICY "Users can follow others"
    ON follows FOR INSERT
    WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Users can unfollow others"
    ON follows FOR DELETE
    USING (auth.uid() = follower_id); 