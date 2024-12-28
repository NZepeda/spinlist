"use client";

import { createBrowserClient } from "@/lib/auth/client";
import { LogOut } from "lucide-react";
import Image from "next/image";
import { redirect } from "next/navigation";
import { useRef, useState } from "react";
import { useOnClickOutside } from "usehooks-ts";
import { SpotifySearch } from "../SpotifySearch";

export const LoggedInNavBar = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const supabase = createBrowserClient();

  useOnClickOutside(dropdownRef, () => setIsDropdownOpen(false));

  const handleLogout = async () => {
    await supabase.auth.signOut();
    redirect("/");
  };

  return (
    <>
      <div className="flex-1 flex items-center justify-center px-2 lg:ml-6 lg:justify-end">
        <div className="max-w-lg w-full lg:max-w-xs">
          <SpotifySearch />
        </div>
      </div>
      <div className="flex items-center">
        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex text-sm border-2 border-transparent rounded-full focus:outline-none focus:border-gray-300 transition duration-150 ease-in-out"
          >
            <Image
              className="rounded-full"
              src="/placeholder-avatar.svg"
              alt="User avatar"
              width={32}
              height={32}
            />
          </button>
          {isDropdownOpen && (
            <div
              className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg"
              ref={dropdownRef}
            >
              <div className="py-1 rounded-md bg-white shadow-xs">
                <button
                  onClick={handleLogout}
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                >
                  <LogOut className="inline-block h-4 w-4 mr-2" />
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};
