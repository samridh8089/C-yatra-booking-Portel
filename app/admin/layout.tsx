import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { AdminHeader } from "@/components/AdminHeader";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  // Route protection: Must be authenticated administrator
  if (!session || session.role !== "admin") {
    redirect("/admin/login");
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <AdminHeader />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
      <footer className="py-6 border-t border-slate-200 text-center text-xs text-slate-400">
        C-Yatra Secure Administration &bull; Role-Based Access Control Active
      </footer>
    </div>
  );
}
