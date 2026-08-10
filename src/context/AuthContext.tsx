"use client";

import * as React from "react";
const { createContext, useContext, useState, useEffect } = React;
import { authClient, useSession } from "../lib/auth/client";

export interface UserProfile {
  id: string;
  name: string | null;
  email: string;
  role: string | null;
  isAdmin: boolean;
  phone?: string | null;
  location?: string | null;
  avatar?: string | null;
  bio?: string | null;
  specialties?: string[];
}

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  login: (email: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  register: (data: Partial<UserProfile> & { password?: string }) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data: session, isPending } = useSession();
  const [profile, setProfile] = useState<{
    role: string | null;
    isAdmin: boolean;
    phone: string | null;
    location: string | null;
    avatar: string | null;
    bio: string | null;
    specialties?: string[];
  }>({ role: null, isAdmin: false, phone: null, location: null, avatar: null, bio: null, specialties: [] });

  useEffect(() => {
    if (!session?.user?.id) return;
    (async () => {
      try {
        const res = await fetch(`/api/user?userId=${session.user.id}`);
        if (!res.ok) {
          console.warn(`[Auth] fetchProfile returned ${res.status}: ${res.statusText}`);
          return;
        }
        const data = await res.json();
        if (data?.user) {
          setProfile({
            role: data.user.role || null,
            isAdmin: data.user.isAdmin ?? false,
            phone: data.user.phone || null,
            location: data.user.location || null,
            avatar: data.user.avatar || null,
            bio: data.user.bio || null,
            specialties: data.user.specialties || [],
          });
        }
      } catch (err) {
        console.warn("[Auth] fetchProfile error:", err);
      }
    })();
  }, [session?.user?.id]);

  const user: UserProfile | null = session?.user
    ? {
        id: session.user.id,
        name: session.user.name ?? null,
        email: session.user.email,
        role: profile.role,
        isAdmin: profile.isAdmin,
        phone: profile.phone,
        location: profile.location,
        avatar: profile.avatar,
        bio: profile.bio,
        specialties: profile.specialties,
      }
    : null;

  const login = async (email: string, password?: string) => {
    try {
      const { error } = (await authClient.signIn.email({
        email,
        password: password ?? "",
      }) as unknown) as { error?: { message?: string } };
      if (error) {
        return { success: false, error: error.message || "Login failed" };
      }
      return { success: true };
    } catch (err: any) {
      console.error("[Auth] Login error:", err);
      return { success: false, error: err?.message || "Login failed" };
    }
  };

  const register = async (data: Partial<UserProfile> & { password?: string }) => {
    try {
      const { error } = (await authClient.signUp.email({
        email: data.email!,
        password: data.password ?? "",
        name: data.name ?? "",
      }) as unknown) as { error?: { message?: string } };
      if (error) {
        return { success: false, error: error.message || "Registration failed" };
      }
      return { success: true };
    } catch (err: any) {
      console.error("[Auth] Registration error:", err);
      return { success: false, error: err?.message || "Registration failed" };
    }
  };

  const logout = async () => {
    await authClient.signOut();
  };

  const updateProfile = (data: Partial<UserProfile>) => {
    if (!user?.id) return;
    fetch("/api/user/profile?userId=" + user.id, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }).catch(console.error);
  };

  const refreshProfile = async () => {
    if (!session?.user?.id) return;
    try {
      const res = await fetch(`/api/user?userId=${session.user.id}`);
      if (!res.ok) return;
      const data = await res.json();
      if (data?.user) {
        setProfile({
          role: data.user.role || null,
          isAdmin: data.user.isAdmin ?? false,
          phone: data.user.phone || null,
          location: data.user.location || null,
          avatar: data.user.avatar || null,
          bio: data.user.bio || null,
          specialties: data.user.specialties || [],
        });
      }
    } catch { console.error("Failed to fetch user profile"); }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading: isPending,
        login,
        register,
        logout,
        updateProfile,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
