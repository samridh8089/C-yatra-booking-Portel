import { NextResponse } from "next/server";
import { loginSchema } from "@/lib/validations";
import {
  setSessionCookie,
  DEFAULT_OWNER_EMAIL,
  DEFAULT_OWNER_PASSWORD,
  DEFAULT_ADMIN_EMAIL,
  DEFAULT_ADMIN_PASSWORD,
} from "@/lib/auth";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password, requiredRole } = body;

    // Validate request schema
    const validation = loginSchema.safeParse({ email, password });
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0]?.message || "Invalid input" },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();

    // 1. Check with Supabase Auth if configured
    const supabase = createServerSupabaseClient();
    if (supabase) {
      try {
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password,
        });

        if (!authError && authData.user) {
          // Resolve role from profiles table
          const { data: profile } = await supabase
            .from("profiles")
            .select("role, full_name")
            .eq("id", authData.user.id)
            .single();

          const role = profile?.role || "owner";

          if (requiredRole === "admin" && role !== "admin") {
            return NextResponse.json(
              { error: "Access Denied: You do not have administrator permissions." },
              { status: 403 }
            );
          }

          const userProfile = {
            id: authData.user.id,
            email: authData.user.email || cleanEmail,
            full_name: profile?.full_name || "Authorized User",
            role,
          };

          await setSessionCookie(userProfile);

          return NextResponse.json({ success: true, user: userProfile });
        }
      } catch {
        // Fall back to local credentials check
      }
    }

    // 2. Local Fallback Authentication
    if (requiredRole === "admin") {
      if (cleanEmail === DEFAULT_ADMIN_EMAIL.toLowerCase() && password === DEFAULT_ADMIN_PASSWORD) {
        const adminUser = {
          id: "admin-master-id",
          email: DEFAULT_ADMIN_EMAIL,
          full_name: "C-Yatra Administrator",
          role: "admin" as const,
        };
        await setSessionCookie(adminUser);
        return NextResponse.json({ success: true, user: adminUser });
      } else {
        return NextResponse.json(
          { error: "Invalid administrator credentials" },
          { status: 401 }
        );
      }
    } else {
      // Owner login
      if (
        (cleanEmail === DEFAULT_OWNER_EMAIL.toLowerCase() && password === DEFAULT_OWNER_PASSWORD) ||
        (cleanEmail === DEFAULT_ADMIN_EMAIL.toLowerCase() && password === DEFAULT_ADMIN_PASSWORD)
      ) {
        const ownerUser = {
          id: "owner-master-id",
          email: cleanEmail,
          full_name: cleanEmail === DEFAULT_ADMIN_EMAIL ? "C-Yatra Administrator" : "Samridh Tomar",
          role: (cleanEmail === DEFAULT_ADMIN_EMAIL ? "admin" : "owner") as "admin" | "owner",
        };
        await setSessionCookie(ownerUser);
        return NextResponse.json({ success: true, user: ownerUser });
      } else {
        return NextResponse.json(
          { error: "Invalid owner credentials" },
          { status: 401 }
        );
      }
    }
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Authentication error" },
      { status: 500 }
    );
  }
}
