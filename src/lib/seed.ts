// scripts/seed.ts
import { createClient } from "@supabase/supabase-js";
import { faker } from "@faker-js/faker";
import dotenv from "dotenv";
import { Database } from "./types/supabase.types";

dotenv.config({ path: "./.env.local" });

type AuthUser = {
  id: string;
  email: string;
};

type Profile = Database["public"]["Tables"]["profiles"]["Row"];
type Album = Database["public"]["Tables"]["albums"]["Row"];
type Review = Database["public"]["Tables"]["reviews"]["Row"];
type TopAlbum = Database["public"]["Tables"]["top_albums"]["Row"];
type Follow = Database["public"]["Tables"]["follows"]["Row"];

console.log(
  "process.env.NEXT_PUBLIC_SUPABASE_URL",
  process.env.NEXT_PUBLIC_SUPABASE_URL
);
console.log(
  "process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY",
  process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY
);

// Initialize Supabase client with service_role key to bypass RLS
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY!, // Use service_role key instead of anon key
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

// Sample album IDs from various genres/eras for diverse test data
const SPOTIFY_ALBUM_IDS = [
  // Classic Rock
  "1DFixLWuPkv3KT3TnV35m3", // Adele - 21
  "6trNtQUgC8cgbWcqoMYkOR", // Ghost - Impera
  "2fenSS68JI1h4Fo296JfGr", // Taylor Swift - 1989
  "6dVIqQ8qmQ5GBnJ9shOYGE", // Kendrick Lamar - good kid, m.A.A.d city
  "7dxKtc08dYeRVHt3p9CZJn", // Neutral Milk Hotel - In The Aeroplane Over The Sea
  "2widuo17g5CEC66IbzveRu", // Radiohead - In Rainbows
  "4LH4d3cOWNNsVw41Gqt2kv", // The Strokes - Room on Fire
  "392p3shh2jkxUxY2VHvlH8", // Daft Punk - Random Access Memories
  "6mm1Skz3JE6AXneya9Nyiv", // Arcade Fire - Funeral
  "6400dnyeDyD2mIFHfkwHXN", // Portishead - Dummy
  "1UQh3Ue7q3h4b8lQc4Wk5i", // The Beatles - Abbey Road
  "3WrFJ7ztbogyGnTHbHJFl2", // Pink Floyd - The Dark Side of the Moon
  "2noRn2Aes5aoNVsU6iWThc", // Fleetwood Mac - Rumours
  "6QaVfG1pHYl1z15ZxkvVDW", // David Bowie - The Rise and Fall of Ziggy Stardust
  "3Yf40DNOZp2ZJwQ6GgNCjP", // Prince - Purple Rain
  // Modern Pop/Hip-Hop
  "5MS3MvWHJ3lOZPLiMxzOU6", // Bad Bunny - Un Verano Sin Ti
  "3RQQmkQEvNCY4prGKE6oc5", // Drake - Views
  "0JGOiO34nwfUdDrD612dOp", // Olivia Rodrigo - GUTS
  "151w1FgRZfnKZA9FEcg9Z3", // The Weeknd - Starboy
  "4otkd9As6YaxxEkIjXPiZ6", // Beyoncé - Renaissance
  // Indie/Alternative
  "6KT8x5oqZJl9CcnM66hddo", // Mitski - Laurel Hell
  "0bCAjiUamIFqKJsekOYuRw", // Beach House - Depression Cherry
  "0Cuqhgy8vm96JEkBY3polk", // Arctic Monkeys - AM
  "0xcRiU6kptfZXHCH48Yg3E", // Lorde - Melodrama
  "2Ek1q2haOnxVqhvVKqMvJe", // Vampire Weekend - Modern Vampires of the City
  // Electronic/Dance
  "2noRn2Aes5aoNVsU6iWThc", // Rüfüs Du Sol - Surrender
  "2vinEFq5mCfvXzQzRG47ON", // Disclosure - Settle
  "7H7UxuxjGSJuV7LcCFUxTD", // Odesza - The Last Goodbye
  "6PWXKiakqhI17mTYM4y6oY", // Jamie xx - In Colour
  "2uEf3r9i2bnxwJQsxQ0xQ7", // Bonobo - Migration
];

// Generate more diverse review texts
const REVIEW_TEXTS = [
  "An absolute masterpiece that keeps getting better with each listen. The production quality is outstanding, and every track feels essential to the overall experience.",
  "While not perfect, it shows incredible artistry and vision. There are moments of pure genius scattered throughout.",
  "A groundbreaking release that changed how I think about music. The experimental nature might not be for everyone, but it's undeniably innovative.",
  "The production quality alone makes this worth multiple listens. Every sonic detail feels intentional and carefully crafted.",
  "A bit overrated in my opinion, but still has its moments. Some tracks really shine while others feel like filler.",
  "Not my usual genre, but I can appreciate the craftsmanship. The technical skill on display is impressive.",
  "The lyrics really speak to me on a personal level. Each song tells a story that resonates deeply.",
  "The instrumentation is phenomenal, but the vocals could be stronger. Still, it's a solid addition to their discography.",
  "A perfect blend of nostalgia and innovation. It pays homage to the classics while pushing boundaries.",
  "This album grows on you with each listen. Initially underwhelming, but the complexity reveals itself over time.",
  "A cultural reset that will influence artists for years to come. Every track is a potential hit.",
  "The cohesiveness of the album is remarkable. The way each song flows into the next creates a journey.",
  "While ambitious, it sometimes gets lost in its own complexity. Still, the high points are truly spectacular.",
  "The emotional depth in this album is unmatched. You can feel the artist's vulnerability in every track.",
  "A solid effort that plays it safe but executes well. Nothing groundbreaking, but thoroughly enjoyable.",
  "The sonic landscape created here is immersive and captivating. It's best experienced with good headphones.",
  "An interesting experiment that doesn't quite stick the landing. Points for creativity though.",
  "The production value elevates otherwise simple songs into something special.",
  "A career-defining album that showcases the artist's evolution. The maturity in songwriting is evident.",
  "While not their best work, it's a grower that reveals new details with each listen.",
];

// Create test users
const createTestUsers = async () => {
  const users: AuthUser[] = [];
  const profiles: Profile[] = [];

  for (let i = 0; i < 20; i++) {
    const email = faker.internet.email();
    const username = faker.internet.userName();
    const password = faker.internet.password();

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username,
          },
        },
      });

      if (authError) {
        console.error("Error creating user:", authError);
        continue;
      }

      if (authData.user && authData.user.email) {
        users.push({
          id: authData.user.id,
          email: authData.user.email,
        });

        // Create profile for the user
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .insert({
            id: authData.user.id,
            username,
            full_name: faker.person.fullName(),
            bio: faker.lorem.paragraph(),
            avatar_url: faker.image.avatar(),
          })
          .select()
          .single();

        if (profileError) {
          console.error("Error creating profile:", profileError);
          continue;
        }

        if (profileData) {
          profiles.push(profileData);
        }
      }
    } catch (error) {
      console.error("Unexpected error creating user:", error);
    }
  }

  return { users, profiles };
};

// Generate reviews with more variety
const generateReview = () => {
  const ratings = [
    "0.5",
    "1.0",
    "1.5",
    "2.0",
    "2.5",
    "3.0",
    "3.5",
    "4.0",
    "4.5",
    "5.0",
  ];

  return {
    rating: ratings[Math.floor(Math.random() * ratings.length)],
    review_text: REVIEW_TEXTS[Math.floor(Math.random() * REVIEW_TEXTS.length)],
    favorite_track: faker.music.songName(),
  };
};

// Fetch and store albums from Spotify
const fetchAndStoreAlbums = async () => {
  const albums = [];
  for (const spotifyId of SPOTIFY_ALBUM_IDS) {
    try {
      const response = await fetch(
        `https://api.spotify.com/v1/albums/${spotifyId}`,
        {
          headers: {
            Authorization: `Bearer BQBL7RAQXkHF5LVGxDWiTV5WUNQLRsrAr0HaeGCYvRGuA6CJQ8Fc9gFJ5ROfF8e6SHj-5pM8D-AWToHcj5Q7-eIeFdc0RuFJYUxsLK_okFW7VKlGhnK8Z3U_nTEPkpVkwLg1CkEYSKs`,
          },
        }
      );

      if (!response.ok) {
        console.error(
          `Failed to fetch album ${spotifyId}:`,
          response.statusText
        );
        continue;
      }

      const albumData = await response.json();
      const album = {
        spotify_id: albumData.id,
        title: albumData.name,
        artist: albumData.artists[0].name,
        artist_id: albumData.artists[0].id,
        cover_url: albumData.images[0]?.url,
        release_date: albumData.release_date,
        spotify_updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from("albums")
        .upsert(album)
        .select();
      if (error) {
        console.error("Error storing album:", error);
        continue;
      }

      if (data) {
        albums.push(data[0]);
      }
    } catch (error) {
      console.error("Error fetching album:", error);
    }
  }
  return albums;
};

// Create reviews for users
const createReviews = async (
  users: AuthUser[],
  profiles: Profile[],
  albums: Album[]
) => {
  const reviews: Review[] = [];
  for (const user of users) {
    // Each user reviews 5-10 random albums
    const numReviews = Math.floor(Math.random() * 6) + 5;
    const userAlbums = [...albums]
      .sort(() => 0.5 - Math.random())
      .slice(0, numReviews);

    for (const album of userAlbums) {
      const review = generateReview();
      const { data, error } = await supabase.from("reviews").upsert({
        user_id: user.id,
        album_id: album.id,
        ...review,
      });

      if (error) {
        console.error("Error creating review:", error);
        continue;
      }

      if (data) {
        reviews.push(data[0]);
      }
    }
  }
  return reviews;
};

// Create top albums for users
const createTopAlbums = async (
  users: AuthUser[],
  profiles: Profile[],
  albums: Album[]
) => {
  const topAlbums: TopAlbum[] = [];
  for (const user of users) {
    // Each user gets 5-8 top albums
    const numTopAlbums = Math.floor(Math.random() * 4) + 5;
    const userTopAlbums = [...albums]
      .sort(() => 0.5 - Math.random())
      .slice(0, numTopAlbums);

    for (let i = 0; i < userTopAlbums.length; i++) {
      const { data, error } = await supabase.from("top_albums").upsert({
        user_id: user.id,
        album_id: userTopAlbums[i].id,
        position: i + 1,
      });

      if (error) {
        console.error("Error creating top album:", error);
        continue;
      }

      if (data) {
        topAlbums.push(data[0]);
      }
    }
  }
  return topAlbums;
};

// Create follows between users with more connections
const createFollows = async (profiles: Profile[]) => {
  const follows: Follow[] = [];
  for (const profile of profiles) {
    // Each user follows 5-10 other random users
    const numFollows = Math.floor(Math.random() * 6) + 5;
    const potentialFollows = profiles
      .filter((p) => p.id !== profile.id)
      .sort(() => 0.5 - Math.random())
      .slice(0, numFollows);

    for (const follow of potentialFollows) {
      const { data, error } = await supabase.from("follows").upsert({
        follower_id: profile.id,
        following_id: follow.id,
      });

      if (error) {
        console.error("Error creating follow:", error);
        continue;
      }

      if (data) {
        follows.push(data[0]);
      }
    }
  }
  return follows;
};

// Main seed function
async function seed() {
  try {
    console.log("🌱 Starting database seed...");

    // 1. Create test users
    console.log("Creating test users...");
    const { users, profiles } = await createTestUsers();
    console.log(`Created ${users.length} users`);

    // 2. Fetch and store albums
    console.log("Fetching and storing albums...");
    const albums = await fetchAndStoreAlbums();
    console.log(`Stored ${albums.length} albums`);

    // 3. Create reviews
    console.log("Creating reviews...");
    const reviews = await createReviews(users, profiles, albums);
    console.log(`Created ${reviews.length} reviews`);

    // 4. Create top albums
    console.log("Creating top albums...");
    const topAlbums = await createTopAlbums(users, profiles, albums);
    console.log(`Created ${topAlbums.length} top album entries`);

    // 5. Create follows
    console.log("Creating follows...");
    const follows = await createFollows(profiles);
    console.log(`Created ${follows.length} follows`);

    console.log("✅ Seed completed successfully!");
  } catch (error) {
    console.error("Seed failed:", error);
  }
}

// Run the seed function
seed();
