import { getOrCreateAlbumSlug } from "@/lib/slugs/getOrCreateAlbumSlug";
import { getOrCreateArtistSlug } from "@/lib/slugs/getOrCreateArtistSlug";
import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

/**
 * Retrieves the slug for the requested type.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const spotifyId = searchParams.get("spotifyId");
  const type = searchParams.get("type");

  if (!spotifyId || !type) {
    return NextResponse.json({
      error: "Missing parameters",
    });
  }

  const supabase = await createClient();

  if (type === "album") {
    const slug = await getOrCreateAlbumSlug(supabase, spotifyId);

    return NextResponse.json({
      status: 200,
      slug,
    });
  } else if (type === "artist") {
    const slug = await getOrCreateArtistSlug(supabase, spotifyId);

    return NextResponse.json({
      status: 200,
      slug,
    });
  }

  return NextResponse.json({
    status: 500,
    message: "Invalid type requested",
  });
}
