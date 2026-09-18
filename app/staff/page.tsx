import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowLeft,
  UserPlus,
  Users,
} from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

import CreateStaffForm from "@/components/staff/create-staff-form";
import StaffTableRow from "@/components/staff/staff-table-row";
import StaffMobileCard from "@/components/staff/staff-mobile-card";

function formatRole(role: string) {
  switch (role) {
    case "admin":
      return "Administrator";

    case "dispatcher":
      return "Dispatcher";

    case "driver":
      return "Driver";

    default:
      return role;
  }
}

function roleClasses(role: string) {
  switch (role) {
    case "admin":
      return "bg-purple-50 text-purple-700 ring-purple-200";

    case "dispatcher":
      return "bg-blue-50 text-blue-700 ring-blue-200";

    case "driver":
      return "bg-amber-50 text-amber-700 ring-amber-200";

    default:
      return "bg-slate-50 text-slate-600 ring-slate-200";
  }
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en-NG", {
    dateStyle: "medium",
  }).format(new Date(date));
}

function formatDriverStatus(status: string | undefined) {
  switch (status) {
    case "available":
      return "Available";

    case "busy":
      return "Busy";

    case "off_duty":
      return "Off duty";

    default:
      return "No driver record";
  }
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
  // 2. Verify the current user is an active admin
  // --------------------------------------------------

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("full_name, role, is_active")
    .eq("id", user.id)
    .single();

  if (profileError || !profile || profile.role !== "admin") {
    redirect("/dashboard");
  }

  if (!profile.is_active) {
    await supabase.auth.signOut();
    redirect("/login");
  }

  // --------------------------------------------------
  // 3. Fetch staff profiles and driver records
  // --------------------------------------------------

  const [
    { data: profiles, error: profilesError },
    { data: drivers, error: driversError },
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select(
        "id, full_name, role, is_active, created_at"
      )
      .order("created_at", {
        ascending: false,
      }),

    supabase
      .from("drivers")
      .select("profile_id, phone, status"),
  ]);

  if (profilesError) {
    console.error("Profiles error:", profilesError);
  }

  if (driversError) {
    console.error("Drivers error:", driversError);
  }

  // --------------------------------------------------
  // 4. Fetch Auth users so we can display email addresses
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
  // 5. Build lookup maps
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
  // 6. Render
  // --------------------------------------------------

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Link
              href="/dashboard"
              className="mb-3 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-900"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to dashboard
            </Link>

            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 text-white">
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
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-slate-800"
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

                <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
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
    </main>
  );
}