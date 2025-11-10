"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  useMemo,
  useCallback,
} from "react";
import type { User } from "@/types/user";
import { createClient } from "@/utils/supabase/client";
import { AuthUser } from "@supabase/supabase-js";
import { logoutAction } from "@/app/actions/auth";

interface UserContextType {
  user: User | null;
  authUser: AuthUser | null;
  isLoading: boolean;
  getProfile: (userId: string) => Promise<User | null>;
  logout: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const supabase = createClient();

  const getProfile = useCallback(
    async (userId: string) => {
      try {
        setIsLoading(true);
        const { data, error, status } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", userId)
          .single();

        if (error && status !== 406) {
          console.log("Error fetching profile:", error);
          throw error;
        }
        return data;
      } catch (error) {
        console.error("Error fetching profile:", error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [supabase]
  );

  const logout = useCallback(async () => {
    await logoutAction();
    setUser(null);
    setAuthUser(null);
  }, []);

  // Profile fetch fonksiyonu
  const fetchUserProfile = useCallback(
    async (userId: string) => {
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", userId)
          .single();

        if (error && error.code !== "PGRST116") {
          console.error("Error fetching profile:", error);
          return null;
        }

        return data as User;
      } catch (error) {
        console.error("Error fetching profile:", error);
        return null;
      }
    },
    [supabase]
  );

  useEffect(() => {
    // İlk yüklemede session'ı kontrol et
    const fetchUser = async () => {
      setIsLoading(true);
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user) {
        setAuthUser(session.user);
        const userData = await fetchUserProfile(session.user.id);
        setUser(userData);
      } else {
        setUser(null);
        setAuthUser(null);
      }
      setIsLoading(false);
    };

    fetchUser();

    // Auth state değişikliklerini dinle
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {

      if (session?.user) {
        setAuthUser(session.user);
        const userData = await fetchUserProfile(session.user.id);
        setUser(userData);
      } else {
        setAuthUser(null);
        setUser(null);
      }
    });

    // Custom event listener (profil güncellemesi için)
    const handleAuthChange = async () => {

      // Session'ı yeniden çek
      const {
        data: { session },
      } = await supabase.auth.getSession();


      if (session?.user) {
        setAuthUser(session.user);
        // Profile'ı da yeniden çek
        const userData = await fetchUserProfile(session.user.id);
        setUser(userData);
      } else {
        setAuthUser(null);
        setUser(null);
      }
    };

    window.addEventListener("auth-state-change", handleAuthChange);

    return () => {
      subscription.unsubscribe();
      window.removeEventListener("auth-state-change", handleAuthChange);
    };
  }, [supabase, fetchUserProfile]);

  const value = useMemo(
    () => ({ user, authUser, isLoading, getProfile, logout }),
    [user, authUser, isLoading, getProfile, logout]
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within UserProvider");
  }
  return context;
}