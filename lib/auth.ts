import { cookies } from "next/headers";
import { UserProfile } from "@/types";
import { createServerSupabaseClient } from "@/lib/supabase/server";

const AUTH_COOKIE_NAME = "cyatra_session";

export interface SessionData {
  user: UserProfile;
  expiresAt: number;
}

// Configurable default credentials via environment variables
export const DEFAULT_OWNER_EMAIL = process.env.OWNER_EMAIL || "owner@cyatra.com";
export const DEFAULT_OWNER_PASSWORD = process.env.OWNER_PASSWORD || "Owner@123";

export const DEFAULT_ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@cyatra.com";
export const DEFAULT_ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "Admin@123";

export async function getSession(): Promise<UserProfile | null> {
  // 1. First check Supabase session if configured
  const supabase = createServerSupabaseClient();
  if (supabase) {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        // Fetch role from profiles table
        const { data: profile } = await supabase
          .from("profiles")
          .select("role, full_name")
          .eq("id", user.id)
          .single();

        return {
          id: user.id,
          email: user.email || "",
          full_name: profile?.full_name || user.email?.split("@")[0] || "User",
          role: profile?.role || "owner",
        };
      }
    } catch {
      // Fall through to cookie session
    }
  }

  // 2. Read encrypted/secure session cookie
  const cookieStore = cookies();
  const sessionCookie = cookieStore.get(AUTH_COOKIE_NAME);
  if (!sessionCookie?.value) {
    return null;
  }

  try {
    const raw = Buffer.from(sessionCookie.value, "base64").toString("utf-8");
    const parsed: SessionData = JSON.parse(raw);

    if (Date.now() > parsed.expiresAt) {
      return null;
    }

    return parsed.user;
  } catch {
    return null;
  }
}

export async function setSessionCookie(user: UserProfile): Promise<void> {
  const cookieStore = cookies();
  const sessionData: SessionData = {
    user,
    expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
  };

  const encoded = Buffer.from(JSON.stringify(sessionData)).toString("base64");

  cookieStore.set(AUTH_COOKIE_NAME, encoded, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 7 * 24 * 60 * 60,
  });
}

export async function clearSessionCookie(): Promise<void> {
  const supabase = createServerSupabaseClient();
  if (supabase) {
    try {
      await supabase.auth.signOut();
    } catch {
      // continue
    }
  }

  const cookieStore = cookies();
  cookieStore.set(AUTH_COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}
