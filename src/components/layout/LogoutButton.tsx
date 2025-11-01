"use client";

import { useUser } from "@/contexts/UserContext";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { BiLogOut } from 'react-icons/bi';

export function LogoutButton({ className, buttonSize = 24 }: { className?: string, buttonSize?: number }) {
  const router = useRouter();
  const { logout } = useUser();



  const handleLogout = async () => {
    await logout();
    toast.success("Çıkış yapıldı!");
    router.push("/");
  };

  return (
    <button
      className={`` + (className ? ` ${className}` : "rounded-lg px-4 py-2 text-sm cursor-pointer font-medium flex items-center gap-1.5 text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800")}
      onClick={handleLogout}
    >
      <BiLogOut size={buttonSize} />
      Çıkış
    </button>
  );
}
