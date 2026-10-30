import { NextResponse } from "next/server";
import { getPortals, createPortal } from "@/lib/db";
import { portalSchema } from "@/lib/validations";
import { getSession } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const categoryId = searchParams.get("categoryId") || undefined;
    const search = searchParams.get("search") || undefined;
    const includeInactive = searchParams.get("includeInactive") === "true";

    const portals = await getPortals({ categoryId, search, includeInactive });
    return NextResponse.json(portals);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to fetch portals" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized: Administrator role required" }, { status: 403 });
    }

    const body = await req.json();
    const validation = portalSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: validation.error.errors[0]?.message || "Invalid input" }, { status: 400 });
    }

    const newPortal = await createPortal({
      category_id: validation.data.category_id,
      name: validation.data.name,
      website_url: validation.data.website_url,
      logo_url: validation.data.logo_url || null,
      description: validation.data.description || null,
      internal_notes: validation.data.internal_notes || null,
      sort_order: validation.data.sort_order,
      is_active: validation.data.is_active,
    });

    return NextResponse.json(newPortal, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to create portal" }, { status: 500 });
  }
}
