/** Shape of a release returned by the MusicBrainz release search endpoint. */
type MusicBrainzRelease = {
  id: string;
  "release-group": {
    id: string;
  };
};

/** Shape of the MusicBrainz release search response. */
type MusicBrainzReleaseSearchResponse = {
  releases: MusicBrainzRelease[];
};

/** Shape of a release group returned by the MusicBrainz release-group search endpoint. */
type MusicBrainzReleaseGroup = {
  id: string;
  title: string;
};

/** Shape of the MusicBrainz release-group search response. */
type MusicBrainzReleaseGroupSearchResponse = {
  "release-groups": MusicBrainzReleaseGroup[];
};

const MUSICBRAINZ_API_BASE = "https://musicbrainz.org/ws/2";

/** Required by MusicBrainz API policy: https://musicbrainz.org/doc/MusicBrainz_API/Rate_Limiting */
const USER_AGENT = "spinlist/1.0 (nestordzepeda@gmail.com)";

/**
 * Searches MusicBrainz releases by UPC barcode and returns the release group MBID.
 */
async function lookupByUpc(upc: string): Promise<string | null> {
  const url = `${MUSICBRAINZ_API_BASE}/release/?query=barcode:${encodeURIComponent(upc)}&fmt=json`;

  const response = await fetch(url, {
    headers: { "User-Agent": USER_AGENT },
  });

  if (!response.ok) {
    return null;
  }

  const data = (await response.json()) as MusicBrainzReleaseSearchResponse;
  const firstRelease = data.releases?.[0];

  return firstRelease?.["release-group"]?.id ?? null;
}

/**
 * Searches MusicBrainz release groups by title and artist name and returns the top MBID.
 */
async function lookupByTitleAndArtist(
  title: string,
  artistName: string,
): Promise<string | null> {
  const query = `release:${encodeURIComponent(title)}+artist:${encodeURIComponent(artistName)}`;
  const url = `${MUSICBRAINZ_API_BASE}/release-group/?query=${query}&fmt=json`;

  const response = await fetch(url, {
    headers: { "User-Agent": USER_AGENT },
  });

  if (!response.ok) {
    return null;
  }

  const data = (await response.json()) as MusicBrainzReleaseGroupSearchResponse;
  const firstGroup = data["release-groups"]?.[0];

  return firstGroup?.id ?? null;
}

/**
 * Looks up the MusicBrainz release group MBID for a given album.
 *
 * Searches by UPC barcode first (most precise), falling back to title and artist name.
 * Returns null if no match is found.
 *
 * @param title - The album title from Spotify
 * @param artistName - The primary artist name from Spotify
 * @param upc - The Universal Product Code from Spotify, if available
 */
export async function getReleaseGroup({
  title,
  artistName,
  upc,
}: {
  title: string;
  artistName: string;
  upc: string | null;
}): Promise<string | null> {
  if (upc) {
    // mbid - MusicBrainz ID
    const mbid = await lookupByUpc(upc);
    if (mbid) {
      return mbid;
    }
  }

  return lookupByTitleAndArtist(title, artistName);
}
