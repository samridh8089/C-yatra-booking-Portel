import { getCategories } from "@/lib/db";
import { CategoriesManager } from "./CategoriesManager";

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  const categories = await getCategories(true);

  return <CategoriesManager initialCategories={categories} />;
}
