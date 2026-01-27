drop policy "Authenticated users can create album slugs" on "public"."album_slugs";

drop policy "Authenticated users can create albums" on "public"."albums";

drop policy "Authenticated users can create artist slugs" on "public"."artist_slugs";

drop policy "Authenticated users can create artists" on "public"."artists";

drop policy "Authenticated users can update artists" on "public"."artists";


  create policy "Anyone can create album slugs"
  on "public"."album_slugs"
  as permissive
  for insert
  to public
with check (true);



  create policy "Anyone can update album slugs"
  on "public"."album_slugs"
  as permissive
  for update
  to public
using (true);



  create policy "Anyone can create albums"
  on "public"."albums"
  as permissive
  for insert
  to public
with check (true);



  create policy "Anyone can update albums"
  on "public"."albums"
  as permissive
  for update
  to public
using (true);



  create policy "Anyone can create artist slugs"
  on "public"."artist_slugs"
  as permissive
  for insert
  to public
with check (true);



  create policy "Anyone can update artist slugs"
  on "public"."artist_slugs"
  as permissive
  for update
  to public
using (true);



  create policy "Anyone can create artists"
  on "public"."artists"
  as permissive
  for insert
  to public
with check (true);



  create policy "Anyone can update artists"
  on "public"."artists"
  as permissive
  for update
  to public
using (true);



