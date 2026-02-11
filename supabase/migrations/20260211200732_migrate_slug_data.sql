-- Migrate existing slugs from separate slug tables to main tables
UPDATE artists a SET slug = s.slug FROM artist_slugs s WHERE a.id = s.artist_id;
UPDATE albums a SET slug = s.slug FROM album_slugs s WHERE a.id = s.album_id;
