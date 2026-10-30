import { NextResponse } from "next/server";
import { updateCategory, deleteCategory } from "@/lib/db";
import { categorySchema } from "@/lib/validations";
import { getSession } from "@/lib/auth";

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getSession();
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized: Administrator role required" }, { status: 403 });
    }

    const { id } = params;
    const body = await req.json();

    const validation = categorySchema.partial().safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: validation.error.errors[0]?.message || "Invalid input" }, { status: 400 });
    }

    const updated = await updateCategory(id, validation.data);
    return NextResponse.json(updated);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to update category" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getSession();
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized: Administrator role required" }, { status: 403 });
    }

    const { id } = params;
    await deleteCategory(id);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to delete category" }, { status: 500 });
  }
}
