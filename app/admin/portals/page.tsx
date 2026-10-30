import { getCategories, getPortals } from "@/lib/db";
import { PortalsManager } from "./PortalsManager";

export const dynamic = "force-dynamic";

export default async function AdminPortalsPage() {
  const [categories, portals] = await Promise.all([
    getCategories(true),
    getPortals({ includeInactive: true }),
  ]);

  return <PortalsManager initialPortals={portals} categories={categories} />;
}
