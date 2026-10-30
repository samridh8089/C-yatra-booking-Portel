import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getCategories, getPortals } from "@/lib/db";
import { OwnerDashboard } from "@/components/OwnerDashboard";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  // Fetch active categories & active portals from database
  const categories = await getCategories(false);
  const portals = await getPortals({ includeInactive: false });

  return (
    <OwnerDashboard
      categories={categories}
      portals={portals}
      user={session}
    />
  );
}
