import { Disc3 } from "lucide-react";

import Link from "next/link";
import { createServerClient } from "@/lib/auth/server";
import { LoggedInNavBar } from "./LoggedInNavbar";
import { LoggedOutNavBar } from "./LoggedOutNavBar";

/**
 * Displays the login and sign up buttons when the user is not logged in.
 * When the user is logged in, it displays the user's profile picture and name, along with a search bar in the middle to search for albums.
 */
export default async function NavBar() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <nav className="px-4 lg:px-6 h-14 flex items-center">
      <Link className="flex items-center justify-center" href="/">
        <Disc3 className="h-[32px] w-[32px]" />
        <span className="hidden lg:block ml-2 text-lg font-bold">spinlist</span>
      </Link>
      <div className="flex-grow">
        {user ? <LoggedInNavBar /> : <LoggedOutNavBar />}
      </div>
    </nav>
  );
}
