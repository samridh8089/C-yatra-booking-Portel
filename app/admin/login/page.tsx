import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { LoginForm } from "@/components/LoginForm";

export default async function AdminLoginPage() {
  const session = await getSession();

  if (session && session.role === "admin") {
    redirect("/admin/portals");
  }

  return <LoginForm mode="admin" />;
}
