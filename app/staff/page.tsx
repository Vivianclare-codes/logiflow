import Link from "next/link";
import { redirect } from "next/navigation";

import { ArrowLeft, LockKeyhole, UserPlus, Users } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

import CreateStaffForm from "@/components/staff/create-staff-form";
import StaffTableRow from "@/components/staff/staff-table-row";
import StaffMobileCard from "@/components/staff/staff-mobile-card";
import { MobileWorkspaceDrawer } from "@/components/layout/mobile-workspace-drawer";

function Logo() {
  return (
    <Link
      href="/"
      className="flex items-center gap-2 text-lg font-semibold tracking-tight text-slate-950"
    >
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-sm font-bold text-white">
        L
      </div>

      <span>LogiFlow</span>
    </Link>
  );
}

const navigation = [
  {
    label: "Dashboard",
    href: "/dashboard",
  },
  {
    label: "Shipments",
    href: "/shipments",
  },
  {
    label: "Customers",
    href: "/customers",
  },
  {
    label: "Drivers",
    href: "/drivers",
  },
  {
    label: "Vehicles",
    href: "/vehicles",
  },
  {
    label: "Activity",
    href: "/activity",
  },
  {
    label: "Staff",
    href: "/staff",
  },
];

function Navigation() {
  return (
    <nav className="space-y-1">
      {navigation.map((item) => {
        const isActive = item.href === "/staff";

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center rounded-xl px-3 py-2.5 text-sm font-medium transition ${
              isActive
                ? "bg-blue-600 text-white"
                : "text-slate-600 hover:bg-blue-50 hover:text-slate-950"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

function AccessDenied({
  role,
}: {
  role: string;
}) {
  const roleName =
    role === "dispatcher"
      ? "Dispatchers"
      : role === "driver"
        ? "Drivers"
        : "Your role";

  return (
    <main className="min-h-screen bg-slate-50">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-slate-200 bg-white px-5 py-6 lg:flex lg:flex-col">
        <Logo />

        <div className="mt-8 flex-1">
          <Navigation />
        </div>
      </aside>

      {/* Main workspace */}
      <div className="lg:pl-64">
        {/* Header */}
        <header className="flex h-[72px] items-center justify-between border-b border-slate-200 bg-white px-5 sm:px-8 lg:px-10">
          {/* Mobile header */}
          <div className="flex items-center gap-3 lg:hidden">
            <MobileWorkspaceDrawer activeHref="/staff" />
            <Logo />
          </div>

          {/* Desktop header */}
          <div className="hidden lg:block">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Workspace / Staff
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Staff account management
            </p>
          </div>

          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white">
            L
          </div>
        </header>

        {/* Access denied content */}
        <div className="flex min-h-[calc(100vh-72px)] items-center justify-center px-5 py-10 sm:px-8 lg:px-10">
          <div className="w-full max-w-lg">
            <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm sm:p-10">
              {/* Icon */}
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                <LockKeyhole className="h-6 w-6" />
              </div>

              {/* Heading */}
              <h1 className="mt-6 text-2xl font-semibold tracking-tight text-slate-950">
                Staff management is restricted
              </h1>

              {/* Message */}
              <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-500">
                {roleName} don&apos;t have permission to manage
                staff accounts. This area is restricted to
                administrators.
              </p>

              {/* Current role */}
              <div className="mx-auto mt-6 inline-flex items-center rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600">
                Current role:{" "}
                <span className="ml-1 capitalize text-slate-900">
                  {role}
                </span>
              </div>

              {/* Action */}
              <div className="mt-8">
                <Link
                  href="/dashboard"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to dashboard
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default async function StaffPage() {
  const supabase = await createClient();

  // --------------------------------------------------
  // 1. Verify authentication
  // --------------------------------------------------

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // --------------------------------------------------
  // 2. Get current user's profile
  // --------------------------------------------------

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("full_name, role, is_active")
    .eq("id", user.id)
    .single();

  if (profileError || !profile) {
    redirect("/dashboard");
  }

  // --------------------------------------------------
  // 3. Check account status
  // --------------------------------------------------

  if (!profile.is_active) {
    await supabase.auth.signOut();
    redirect("/login");
  }

  // --------------------------------------------------
  // 4. Staff management is admin-only
  // --------------------------------------------------

  if (profile.role !== "admin") {
    return <AccessDenied role={profile.role} />;
  }

  // --------------------------------------------------
  // 5. Fetch staff profiles and driver records
  // --------------------------------------------------

  const [
    { data: profiles, error: profilesError },
    { data: drivers, error: driversError },
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, full_name, role, is_active, created_at")
      .order("created_at", {
        ascending: false,
      }),

    supabase.from("drivers").select("profile_id, phone, status"),
  ]);

  if (profilesError) {
    console.error("Profiles error:", profilesError);
  }

  if (driversError) {
    console.error("Drivers error:", driversError);
  }

  // --------------------------------------------------
  // 6. Fetch Auth users so we can display email addresses
  // --------------------------------------------------

  const {
    data: { users },
    error: usersError,
  } = await supabaseAdmin.auth.admin.listUsers({
    page: 1,
    perPage: 1000,
  });

  if (usersError) {
    console.error("Auth users error:", usersError);
  }

  // --------------------------------------------------
  // 7. Build lookup maps
  // --------------------------------------------------

  const emailByUserId = new Map(
    (users ?? []).map((authUser) => [
      authUser.id,
      authUser.email ?? "—",
    ])
  );

  const driverByProfileId = new Map(
    (drivers ?? [])
      .filter((driver) => driver.profile_id)
      .map((driver) => [
        driver.profile_id as string,
        {
          phone: driver.phone,
          status: driver.status,
        },
      ])
  );

  const staffMembers = profiles ?? [];

  // --------------------------------------------------
  // 8. Render admin staff page
  // --------------------------------------------------

  return (
    <main className="min-h-screen bg-slate-50">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-slate-200 bg-white px-5 py-6 lg:flex lg:flex-col">
        <Logo />

        <div className="mt-8 flex-1">
          <Navigation />
        </div>

        {/* Current user */}
        <div className="border-t border-slate-100 pt-5">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white">
              {profile.full_name
                ?.split(" ")
                .map((name: string) => name[0])
                .join("")
                .slice(0, 2)
                .toUpperCase() ?? "AD"}
            </div>

            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-slate-950">
                {profile.full_name ?? "Administrator"}
              </p>

              <p className="text-xs text-slate-500">
                Administrator
              </p>
            </div>
          </div>

          <form
            action={async () => {
              "use server";

              const supabase = await createClient();

              await supabase.auth.signOut();

              redirect("/login");
            }}
          >
            <button
              type="submit"
              className="w-full rounded-xl px-3 py-2 text-left text-sm font-medium text-slate-500 transition hover:bg-slate-100 hover:text-slate-950"
            >
              Log out
            </button>
          </form>
        </div>
      </aside>

      {/* Main workspace */}
      <div className="lg:pl-64">
        {/* Top header */}
        <header className="sticky top-0 z-20 flex h-[72px] items-center justify-between border-b border-slate-200 bg-white/90 px-5 backdrop-blur sm:px-8 lg:px-10">
          {/* Mobile header */}
          <div className="flex items-center gap-3 lg:hidden">
            <MobileWorkspaceDrawer activeHref="/staff" />
            <Logo />
          </div>

          {/* Desktop header */}
          <div className="hidden lg:block">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Workspace / Staff
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Manage LogiFlow staff accounts
            </p>
          </div>

          {/* Header right */}
          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-medium text-slate-950">
                {profile.full_name ?? "Administrator"}
              </p>

              <p className="text-xs text-slate-500">
                Administrator
              </p>
            </div>

            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white">
              {profile.full_name
                ?.split(" ")
                .map((name: string) => name[0])
                .join("")
                .slice(0, 2)
                .toUpperCase() ?? "AD"}
            </div>
          </div>
        </header>

        {/* Page content */}
        <div className="mx-auto max-w-[1440px] px-5 py-8 sm:px-8 sm:py-10 lg:px-10">
          {/* Header */}
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <Link
                href="/dashboard"
                className="mb-3 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-blue-600"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to dashboard
              </Link>

              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-600 text-white">
                  <Users className="h-5 w-5" />
                </div>

                <div>
                  <h1 className="text-2xl font-semibold tracking-tight text-slate-950">
                    Staff
                  </h1>

                  <p className="text-sm text-slate-500">
                    Manage the people who operate LogiFlow.
                  </p>
                </div>
              </div>
            </div>

            <Link
              href="#create-staff"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700"
            >
              <UserPlus className="h-4 w-4" />
              Add staff
            </Link>
          </div>

          {/* Main content */}
          <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            {/* Staff list */}
            <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-100 px-6 py-5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h2 className="text-base font-semibold text-slate-950">
                      Staff members
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      Accounts currently registered in LogiFlow.
                    </p>
                  </div>

                  <div className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                    {staffMembers.length}{" "}
                    {staffMembers.length === 1
                      ? "member"
                      : "members"}
                  </div>
                </div>
              </div>

              {/* Desktop table */}
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-100 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">
                      <th className="px-6 py-4">
                        Name
                      </th>

                      <th className="px-6 py-4">
                        Email
                      </th>

                      <th className="px-6 py-4">
                        Role
                      </th>

                      <th className="px-6 py-4">
                        Status
                      </th>

                      <th className="px-6 py-4">
                        Joined
                      </th>

                      <th className="px-6 py-4 text-right">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {staffMembers.map((member) => {
                      const driver =
                        driverByProfileId.get(member.id);

                      return (
                        <StaffTableRow
                          key={member.id}
                          member={{
                            id: member.id,
                            full_name: member.full_name,
                            role: member.role,
                            is_active: member.is_active,
                            created_at: member.created_at,
                            email:
                              emailByUserId.get(member.id) ??
                              "—",
                            phone:
                              driver?.phone ?? null,
                          }}
                          isCurrentUser={
                            member.id === user.id
                          }
                        />
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile staff list */}
              <div className="divide-y divide-slate-100 md:hidden">
                {staffMembers.map((member) => {
                  const driver =
                    driverByProfileId.get(member.id);

                  return (
                    <StaffMobileCard
                      key={member.id}
                      member={{
                        id: member.id,
                        full_name: member.full_name,
                        role: member.role,
                        is_active: member.is_active,
                        created_at: member.created_at,
                        email:
                          emailByUserId.get(member.id) ??
                          "—",
                        phone:
                          driver?.phone ?? null,
                        driverStatus:
                          driver?.status,
                      }}
                      isCurrentUser={
                        member.id === user.id
                      }
                    />
                  );
                })}
              </div>

              {/* Empty state */}
              {staffMembers.length === 0 && (
                <div className="px-6 py-12 text-center">
                  <Users className="mx-auto h-8 w-8 text-slate-300" />

                  <p className="mt-3 text-sm text-slate-500">
                    No staff members found.
                  </p>
                </div>
              )}
            </section>

            {/* Create staff */}
            <section
              id="create-staff"
              className="rounded-2xl border border-slate-200 bg-white shadow-sm"
            >
              <div className="border-b border-slate-100 px-6 py-5">
                <h2 className="text-base font-semibold text-slate-950">
                  Create staff account
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Add an admin, dispatcher, or driver to
                  LogiFlow.
                </p>
              </div>

              <div className="p-6">
                <CreateStaffForm />
              </div>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}