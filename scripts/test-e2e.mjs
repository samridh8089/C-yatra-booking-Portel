const BASE_URL = "http://localhost:3000";

async function runTests() {
  console.log("=================================================");
  console.log("   C-YATRA END-TO-END VERIFICATION SUITE         ");
  console.log("=================================================\n");

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`[PASS] ${message}`);
      passed++;
    } else {
      console.error(`[FAIL] ${message}`);
      failed++;
    }
  }

  // 1. Unauthenticated access redirect
  console.log("\n--- TEST 1: Unauthenticated Route Protection ---");
  const dashRes = await fetch(`${BASE_URL}/dashboard`, { redirect: "manual" });
  assert(
    dashRes.status === 307 || dashRes.status === 302,
    `Unauthenticated /dashboard access redirects to login (Status: ${dashRes.status})`
  );
  assert(
    dashRes.headers.get("location")?.includes("/login"),
    `Redirect location is /login (Location: ${dashRes.headers.get("location")})`
  );

  const adminRes = await fetch(`${BASE_URL}/admin/portals`, { redirect: "manual" });
  assert(
    adminRes.status === 307 || adminRes.status === 302,
    `Unauthenticated /admin/portals access redirects to admin login (Status: ${adminRes.status})`
  );

  // 2. Owner Login
  console.log("\n--- TEST 2: Owner Authentication ---");
  const ownerLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: "owner@c-yatra.com",
      password: "Owner@CYatra2026!",
      requiredRole: "owner",
    }),
  });
  const ownerLoginData = await ownerLoginRes.json();
  assert(ownerLoginRes.status === 200, "Owner login returns 200 OK");
  assert(ownerLoginData.user?.role === "owner", "Owner user role verified as 'owner'");

  const ownerCookie = ownerLoginRes.headers.get("set-cookie");
  assert(Boolean(ownerCookie), "Owner session cookie set properly");

  // 3. Owner Access to Dashboard
  console.log("\n--- TEST 3: Owner Dashboard Access ---");
  const ownerDashRes = await fetch(`${BASE_URL}/dashboard`, {
    headers: { Cookie: ownerCookie },
  });
  const ownerDashHtml = await ownerDashRes.text();
  assert(ownerDashRes.status === 200, "Owner accesses /dashboard with 200 OK");
  assert(
    ownerDashHtml.includes("All Your Travel Portals") && ownerDashHtml.includes("in One Place"),
    "Dashboard contains exact heading 'All Your Travel Portals in One Place'"
  );
  assert(
    ownerDashHtml.includes("c-yatra-logo.png"),
    "Dashboard renders original C-Yatra brand asset"
  );

  // 4. Owner Blocked from Admin Mutations
  console.log("\n--- TEST 4: Role-Based Access Control (Owner blocked from Admin mutations) ---");
  const unauthorizedCatPost = await fetch(`${BASE_URL}/api/categories`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: ownerCookie },
    body: JSON.stringify({ name: "Hacked Category", icon: "Plane" }),
  });
  assert(
    unauthorizedCatPost.status === 403,
    `Owner mutation to /api/categories is blocked with 403 Forbidden (Status: ${unauthorizedCatPost.status})`
  );

  const unauthorizedPortalPost = await fetch(`${BASE_URL}/api/portals`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: ownerCookie },
    body: JSON.stringify({
      name: "Hacked Portal",
      category_id: "cat-flight",
      website_url: "https://hacked.com",
    }),
  });
  assert(
    unauthorizedPortalPost.status === 403,
    `Owner mutation to /api/portals is blocked with 403 Forbidden (Status: ${unauthorizedPortalPost.status})`
  );

  // 5. Admin Login
  console.log("\n--- TEST 5: Admin Authentication ---");
  const adminLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: "admin@c-yatra.com",
      password: "Admin@CYatra2026!",
      requiredRole: "admin",
    }),
  });
  const adminLoginData = await adminLoginRes.json();
  assert(adminLoginRes.status === 200, "Admin login returns 200 OK");
  assert(adminLoginData.user?.role === "admin", "Admin user role verified as 'admin'");

  const adminCookie = adminLoginRes.headers.get("set-cookie");
  assert(Boolean(adminCookie), "Admin session cookie set properly");

  // 6. Admin Access to Admin Portals & Categories
  console.log("\n--- TEST 6: Admin Management Pages Access ---");
  const adminPortalsRes = await fetch(`${BASE_URL}/admin/portals`, {
    headers: { Cookie: adminCookie },
  });
  assert(adminPortalsRes.status === 200, "Admin accesses /admin/portals with 200 OK");

  const adminCatsRes = await fetch(`${BASE_URL}/admin/categories`, {
    headers: { Cookie: adminCookie },
  });
  assert(adminCatsRes.status === 200, "Admin accesses /admin/categories with 200 OK");

  // 7. Verification of all 11 Categories and 65 Portals
  console.log("\n--- TEST 7: Seed Data Verification (11 Categories, 65 Portals) ---");
  const catListRes = await fetch(`${BASE_URL}/api/categories?includeInactive=true`);
  const catListData = await catListRes.json();
  assert(catListData.length >= 11, `All 11 default categories present (Found: ${catListData.length})`);

  const expectedCategories = [
    "Flight",
    "Fix Departure",
    "Hotel",
    "Online Cab",
    "Villa",
    "Home Stay",
    "Bus",
    "Train",
    "Visa",
    "Insurance",
    "Tour Packages",
  ];
  for (const catName of expectedCategories) {
    const found = catListData.some((c) => c.name.toLowerCase() === catName.toLowerCase());
    assert(found, `Category '${catName}' exists in database`);
  }

  const portalListRes = await fetch(`${BASE_URL}/api/portals?includeInactive=true`);
  const portalListData = await portalListRes.json();
  assert(portalListData.length >= 65, `All 65 default portals present in database (Found: ${portalListData.length})`);

  // 8. Admin Category CRUD
  console.log("\n--- TEST 8: Dynamic Category CRUD by Admin ---");
  const newCatRes = await fetch(`${BASE_URL}/api/categories`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: adminCookie },
    body: JSON.stringify({
      name: "Luxury Cruise",
      icon: "Compass",
      sort_order: 12,
      is_active: true,
    }),
  });
  const newCatData = await newCatRes.json();
  assert(newCatRes.status === 201, `Admin creates new category 'Luxury Cruise' (Status: ${newCatRes.status})`);
  assert(Boolean(newCatData.id), `New category created with ID: ${newCatData.id}`);

  // Update category
  const updateCatRes = await fetch(`${BASE_URL}/api/categories/${newCatData.id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", Cookie: adminCookie },
    body: JSON.stringify({ name: "Luxury Cruises & Ferries" }),
  });
  assert(updateCatRes.status === 200, "Admin updates category name successfully");

  // 9. Admin Portal CRUD
  console.log("\n--- TEST 9: Dynamic Portal CRUD by Admin ---");
  const newPortalRes = await fetch(`${BASE_URL}/api/portals`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: adminCookie },
    body: JSON.stringify({
      name: "Royal Caribbean Portal",
      category_id: newCatData.id,
      website_url: "https://www.royalcaribbean.com/",
      logo_url: "https://www.google.com/s2/favicons?domain=royalcaribbean.com&sz=128",
      description: "Worldwide luxury cruises & packages",
      sort_order: 1,
      is_active: true,
    }),
  });
  const newPortalData = await newPortalRes.json();
  assert(newPortalRes.status === 201, `Admin adds new portal under category (Status: ${newPortalRes.status})`);

  // Safe URL validation test
  const invalidUrlRes = await fetch(`${BASE_URL}/api/portals`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: adminCookie },
    body: JSON.stringify({
      name: "Unsafe Portal",
      category_id: newCatData.id,
      website_url: "javascript:alert(1)",
    }),
  });
  assert(invalidUrlRes.status === 400, "Unsafe URL schemes (javascript:) are blocked by validation");

  // Clean up test portal & category
  const deletePortalRes = await fetch(`${BASE_URL}/api/portals/${newPortalData.id}`, {
    method: "DELETE",
    headers: { Cookie: adminCookie },
  });
  assert(deletePortalRes.status === 200, "Admin deletes portal successfully");

  const deleteCatRes = await fetch(`${BASE_URL}/api/categories/${newCatData.id}`, {
    method: "DELETE",
    headers: { Cookie: adminCookie },
  });
  assert(deleteCatRes.status === 200, "Admin deletes category successfully");

  // 10. Logout Verification
  console.log("\n--- TEST 10: Session Logout ---");
  const logoutRes = await fetch(`${BASE_URL}/api/auth/logout`, {
    method: "POST",
    headers: { Cookie: adminCookie },
  });
  assert(logoutRes.status === 200, "Logout endpoint returns 200 OK");

  console.log("\n=================================================");
  console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log("=================================================\n");

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error(err);
  process.exit(1);
});
