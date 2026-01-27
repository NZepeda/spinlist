-- Add tracks column to albums table to store track listing as JSON
ALTER TABLE albums ADD COLUMN tracks JSONB;
