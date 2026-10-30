import fs from "fs";
import path from "path";
import { Category, Portal } from "@/types";
import { INITIAL_CATEGORIES, INITIAL_PORTALS } from "@/lib/seedData";
import { createServerSupabaseClient } from "@/lib/supabase/server";

const DATA_DIR = path.join(process.cwd(), "data");
const DB_FILE = path.join(DATA_DIR, "db.json");

interface LocalDatabase {
  categories: Category[];
  portals: Portal[];
}

function ensureLocalDb(): LocalDatabase {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (!fs.existsSync(DB_FILE)) {
    const initialDb: LocalDatabase = {
      categories: INITIAL_CATEGORIES,
      portals: INITIAL_PORTALS,
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(initialDb, null, 2), "utf-8");
    return initialDb;
  }

  try {
    const content = fs.readFileSync(DB_FILE, "utf-8");
    return JSON.parse(content);
  } catch (err) {
    const initialDb: LocalDatabase = {
      categories: INITIAL_CATEGORIES,
      portals: INITIAL_PORTALS,
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(initialDb, null, 2), "utf-8");
    return initialDb;
  }
}

function saveLocalDb(data: LocalDatabase): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf-8");
}

// ----------------------------------------------------
// CATEGORIES DATA ACCESS
// ----------------------------------------------------

export async function getCategories(includeInactive = false): Promise<Category[]> {
  const supabase = createServerSupabaseClient();
  if (supabase) {
    let query = supabase.from("categories").select("*, portals(count)").order("sort_order", { ascending: true });
    if (!includeInactive) {
      query = query.eq("is_active", true);
    }
    const { data, error } = await query;
    if (!error && data) {
      return data.map((item: any) => ({
        ...item,
        portal_count: item.portals?.[0]?.count ?? 0,
      }));
    }
  }

  // Fallback to local persistent DB
  const db = ensureLocalDb();
  let list = [...db.categories];
  if (!includeInactive) {
    list = list.filter((c) => c.is_active);
  }
  list.sort((a, b) => a.sort_order - b.sort_order);

  // Calculate portal counts
  return list.map((cat) => ({
    ...cat,
    portal_count: db.portals.filter((p) => p.category_id === cat.id).length,
  }));
}

export async function getCategoryById(id: string): Promise<Category | null> {
  const supabase = createServerSupabaseClient();
  if (supabase) {
    const { data, error } = await supabase.from("categories").select("*").eq("id", id).single();
    if (!error && data) return data;
  }

  const db = ensureLocalDb();
  return db.categories.find((c) => c.id === id) || null;
}

export async function createCategory(input: Omit<Category, "id">): Promise<Category> {
  const slug =
    input.slug ||
    input.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

  const newCategory: Category = {
    ...input,
    id: `cat-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    slug,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const supabase = createServerSupabaseClient();
  if (supabase) {
    const { data, error } = await supabase
      .from("categories")
      .insert({
        name: newCategory.name,
        slug: newCategory.slug,
        icon: newCategory.icon,
        sort_order: newCategory.sort_order,
        is_active: newCategory.is_active,
      })
      .select()
      .single();
    if (!error && data) return data;
  }

  const db = ensureLocalDb();
  db.categories.push(newCategory);
  saveLocalDb(db);
  return newCategory;
}

export async function updateCategory(id: string, input: Partial<Category>): Promise<Category> {
  const supabase = createServerSupabaseClient();
  if (supabase) {
    const { data, error } = await supabase
      .from("categories")
      .update({
        ...input,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();
    if (!error && data) return data;
  }

  const db = ensureLocalDb();
  const index = db.categories.findIndex((c) => c.id === id);
  if (index === -1) {
    throw new Error("Category not found");
  }

  db.categories[index] = {
    ...db.categories[index],
    ...input,
    updated_at: new Date().toISOString(),
  };
  saveLocalDb(db);
  return db.categories[index];
}

export async function deleteCategory(id: string): Promise<boolean> {
  const supabase = createServerSupabaseClient();
  if (supabase) {
    const { error } = await supabase.from("categories").delete().eq("id", id);
    if (!error) return true;
  }

  const db = ensureLocalDb();
  db.categories = db.categories.filter((c) => c.id !== id);
  // Also delete portals assigned to this category (cascade)
  db.portals = db.portals.filter((p) => p.category_id !== id);
  saveLocalDb(db);
  return true;
}

// ----------------------------------------------------
// PORTALS DATA ACCESS
// ----------------------------------------------------

export async function getPortals(options?: {
  categoryId?: string;
  search?: string;
  includeInactive?: boolean;
}): Promise<Portal[]> {
  const supabase = createServerSupabaseClient();
  if (supabase) {
    let query = supabase.from("portals").select("*, category:categories(*)").order("sort_order", { ascending: true });

    if (options?.categoryId) {
      query = query.eq("category_id", options.categoryId);
    }
    if (!options?.includeInactive) {
      query = query.eq("is_active", true);
    }
    if (options?.search) {
      query = query.or(`name.ilike.%${options.search}%,description.ilike.%${options.search}%`);
    }

    const { data, error } = await query;
    if (!error && data) return data;
  }

  const db = ensureLocalDb();
  let list = [...db.portals];

  if (options?.categoryId) {
    list = list.filter((p) => p.category_id === options.categoryId);
  }
  if (!options?.includeInactive) {
    // Only show portal if portal is active AND category is active
    const activeCatIds = new Set(db.categories.filter((c) => c.is_active).map((c) => c.id));
    list = list.filter((p) => p.is_active && activeCatIds.has(p.category_id));
  }
  if (options?.search && options.search.trim() !== "") {
    const q = options.search.toLowerCase();
    list = list.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        (p.description && p.description.toLowerCase().includes(q)) ||
        p.website_url.toLowerCase().includes(q)
    );
  }

  list.sort((a, b) => a.sort_order - b.sort_order);

  // Attach category data
  return list.map((p) => ({
    ...p,
    category: db.categories.find((c) => c.id === p.category_id),
  }));
}

export async function getPortalById(id: string): Promise<Portal | null> {
  const supabase = createServerSupabaseClient();
  if (supabase) {
    const { data, error } = await supabase.from("portals").select("*, category:categories(*)").eq("id", id).single();
    if (!error && data) return data;
  }

  const db = ensureLocalDb();
  const p = db.portals.find((item) => item.id === id);
  if (!p) return null;
  return {
    ...p,
    category: db.categories.find((c) => c.id === p.category_id),
  };
}

export async function createPortal(input: Omit<Portal, "id">): Promise<Portal> {
  const newPortal: Portal = {
    ...input,
    id: `portal-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const supabase = createServerSupabaseClient();
  if (supabase) {
    const { data, error } = await supabase
      .from("portals")
      .insert({
        category_id: newPortal.category_id,
        name: newPortal.name,
        website_url: newPortal.website_url,
        logo_url: newPortal.logo_url,
        description: newPortal.description,
        internal_notes: newPortal.internal_notes,
        sort_order: newPortal.sort_order,
        is_active: newPortal.is_active,
      })
      .select()
      .single();
    if (!error && data) return data;
  }

  const db = ensureLocalDb();
  db.portals.push(newPortal);
  saveLocalDb(db);
  return newPortal;
}

export async function updatePortal(id: string, input: Partial<Portal>): Promise<Portal> {
  const supabase = createServerSupabaseClient();
  if (supabase) {
    const { data, error } = await supabase
      .from("portals")
      .update({
        ...input,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();
    if (!error && data) return data;
  }

  const db = ensureLocalDb();
  const index = db.portals.findIndex((p) => p.id === id);
  if (index === -1) {
    throw new Error("Portal not found");
  }

  db.portals[index] = {
    ...db.portals[index],
    ...input,
    updated_at: new Date().toISOString(),
  };
  saveLocalDb(db);
  return db.portals[index];
}

export async function deletePortal(id: string): Promise<boolean> {
  const supabase = createServerSupabaseClient();
  if (supabase) {
    const { error } = await supabase.from("portals").delete().eq("id", id);
    if (!error) return true;
  }

  const db = ensureLocalDb();
  db.portals = db.portals.filter((p) => p.id !== id);
  saveLocalDb(db);
  return true;
}
