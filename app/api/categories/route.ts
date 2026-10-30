import { NextResponse } from "next/server";
import { getCategories, createCategory } from "@/lib/db";
import { categorySchema } from "@/lib/validations";
import { getSession } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const includeInactive = searchParams.get("includeInactive") === "true";

    const categories = await getCategories(includeInactive);
    return NextResponse.json(categories);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to fetch categories" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized: Administrator role required" }, { status: 403 });
    }

    const body = await req.json();
    const validation = categorySchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: validation.error.errors[0]?.message || "Invalid input" }, { status: 400 });
    }

    const newCategory = await createCategory({
      name: validation.data.name,
      slug: validation.data.slug || validation.data.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      icon: validation.data.icon,
      sort_order: validation.data.sort_order,
      is_active: validation.data.is_active,
    });

    return NextResponse.json(newCategory, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to create category" }, { status: 500 });
  }
}
