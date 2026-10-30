import { createClient } from "@supabase/supabase-js";

async function bootstrap() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    console.error("Error: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required in environment.");
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const ownerEmail = process.env.OWNER_EMAIL || "owner@c-yatra.com";
  const ownerPassword = process.env.OWNER_PASSWORD || "Owner@CYatra2026!";

  const adminEmail = process.env.ADMIN_EMAIL || "admin@c-yatra.com";
  const adminPassword = process.env.ADMIN_PASSWORD || "Admin@CYatra2026!";

  console.log("--- Provisioning C-Yatra Users in Supabase ---");

  // 1. Provision Owner
  const { data: ownerUser, error: ownerErr } = await supabase.auth.admin.createUser({
    email: ownerEmail,
    password: ownerPassword,
    email_confirm: true,
    user_metadata: { full_name: "Samridh Tomar" },
  });

  if (ownerErr && !ownerErr.message.includes("already registered")) {
    console.error("Owner creation error:", ownerErr.message);
  } else {
    const ownerId = ownerUser?.user?.id;
    if (ownerId) {
      await supabase.from("profiles").upsert({
        id: ownerId,
        email: ownerEmail,
        full_name: "Samridh Tomar",
        role: "owner",
        updated_at: new Date().toISOString(),
      });
      console.log(`✓ Owner account provisioned: ${ownerEmail}`);
    }
  }

  // 2. Provision Administrator
  const { data: adminUser, error: adminErr } = await supabase.auth.admin.createUser({
    email: adminEmail,
    password: adminPassword,
    email_confirm: true,
    user_metadata: { full_name: "C-Yatra Administrator" },
  });

  if (adminErr && !adminErr.message.includes("already registered")) {
    console.error("Admin creation error:", adminErr.message);
  } else {
    const adminId = adminUser?.user?.id;
    if (adminId) {
      await supabase.from("profiles").upsert({
        id: adminId,
        email: adminEmail,
        full_name: "C-Yatra Administrator",
        role: "admin",
        updated_at: new Date().toISOString(),
      });
      console.log(`✓ Administrator account provisioned: ${adminEmail}`);
    }
  }

  console.log("User provisioning completed successfully.");
}

bootstrap().catch((err) => {
  console.error(err);
  process.exit(1);
});
