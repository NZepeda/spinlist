drop policy "Profiles are viewable by everyone" on "public"."profiles";


  create policy "Active profiles are viewable by everyone"
  on "public"."profiles"
  as permissive
  for select
  to public
using (((status = 'active'::text) OR (auth.uid() = id)));



