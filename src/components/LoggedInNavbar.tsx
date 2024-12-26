"use client";

import { createBrowserClient } from "@/lib/auth/client";
import { LogOut, Search } from "lucide-react";
import Image from "next/image";
import { redirect } from "next/navigation";
import { useRef, useState } from "react";
import { useOnClickOutside } from "usehooks-ts";

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
          <label htmlFor="search" className="sr-only">
            Search
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              id="search"
              name="search"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary focus:border-primary sm:text-sm"
              placeholder="Search albums"
              type="search"
            />
          </div>
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
