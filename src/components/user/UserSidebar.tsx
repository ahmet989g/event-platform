"use client";

import Link from "next/link";
import { LogoutButton } from "../layout/LogoutButton";
import { LuTicket } from "react-icons/lu";
import { FaRegUser, FaRegHeart } from "react-icons/fa";
import { useUser } from "@/contexts/UserContext";

const UserSidebar = () => {
  const { user, isLoading } = useUser();

  if (isLoading) {
    return (
      <aside className="w-1/6 border-r pr-4">
        <div className="mb-8 flex items-center">
          <div className="mr-2 h-10 w-10 animate-pulse rounded-full bg-gray-300 dark:bg-gray-700" />
          <div className="h-6 w-32 animate-pulse rounded bg-gray-300 dark:bg-gray-700" />
        </div>
        <nav className="flex flex-col space-y-5">
          <div className="h-6 w-full animate-pulse rounded bg-gray-300 dark:bg-gray-700" />
          <div className="h-6 w-full animate-pulse rounded bg-gray-300 dark:bg-gray-700" />
          <div className="h-6 w-full animate-pulse rounded bg-gray-300 dark:bg-gray-700" />
        </nav>
      </aside>
    );
  }

  return (
    <aside className="w-1/6 border-r pr-4">
      {user && (
        <div className="mb-8 flex items-center">
          <span className="mr-2 flex h-10 w-10 items-center justify-center rounded-full bg-gray-500 text-lg font-bold">
            {user?.first_name?.charAt(0) || user?.email?.charAt(0)}
          </span>
          <h2 className="text-lg font-semibold">
            {user.first_name && user.last_name
              ? `${user.first_name} ${user.last_name}`
              : user.email}
          </h2>
        </div>
      )}
      <nav className="flex flex-col space-y-5">
        <Link
          href={"/biletlerim"}
          className="color-primary flex items-center gap-3 font-medium hover:underline"
        >
          <LuTicket size={26} />
          Biletlerim
        </Link>
        <Link
          href={"/profilim"}
          className="color-primary flex items-center gap-3 font-medium hover:underline"
        >
          <FaRegUser size={26} />
          Profil Bilgilerim
        </Link>
        <Link
          href={"/favorilerim"}
          className="color-primary flex items-center gap-3 font-medium hover:underline"
        >
          <FaRegHeart size={26} />
          Favorilerim
        </Link>
        <LogoutButton
          className="color-primary flex cursor-pointer items-center gap-3 text-left font-medium hover:underline"
          buttonSize={26}
        />
      </nav>
    </aside>
  );
};

export default UserSidebar;