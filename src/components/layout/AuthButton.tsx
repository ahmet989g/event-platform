"use client";

import Link from "next/link";
import { LogoutButton } from "./LogoutButton";
import ThemeButton from "./ThemeButton";
import { useUser } from "@/contexts/UserContext";

export function AuthButton() {
  const { user, isLoading } = useUser();

  if (isLoading) {
    return (
      <div className="flex items-center gap-4">
        <ThemeButton />
        <div className="h-9 w-32 animate-pulse rounded-lg bg-gray-100 dark:bg-gray-800" />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4">
      <ThemeButton />
      {user ? (
        <div className="flex items-center gap-3">
          <Link
            href="/profilim"
            className="text-sm font-medium text-gray-700 hover:text-primary-600 dark:text-gray-300 dark:hover:text-primary-400"
          >
            {user.first_name && user.last_name
              ? `${user.first_name} ${user.last_name}`
              : user.email}
          </Link>
          <LogoutButton />
        </div>
      ) : (
        <>
          <Link
            href="/giris-yap"
            className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            Giriş Yap
          </Link>
          <Link
            href="/uye-ol"
            className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
          >
            Kayıt Ol
          </Link>
        </>
      )}
    </div>
  );
}