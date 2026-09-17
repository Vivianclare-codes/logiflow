"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  Activity,
  Bell,
  ChevronRight,
  CircleHelp,
  Clock3,
  Command,
  LayoutDashboard,
  LogOut,
  Package,
  Route,
  Settings,
  Truck,
  UserRound,
  Users,
} from "lucide-react";

import { supabase } from "@/lib/supabase/client";
import { MobileWorkspaceDrawer } from "@/components/layout/mobile-workspace-drawer";

const navigation = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Shipments", href: "/shipments", icon: Package },
  { label: "Customers", href: "/customers", icon: Users },
  { label: "Drivers", href: "/drivers", icon: UserRound },
  { label: "Vehicles", href: "/vehicles", icon: Truck },
];

const metrics = [
  { label: "Total shipments", icon: Package },
  { label: "Pending", icon: Clock3 },
  { label: "In transit", icon: Route },
  { label: "Today's deliveries", icon: Truck },
];

function Logo() {
  return (
    <Link
      href="/dashboard"
      className="flex items-center gap-2.5"
      aria-label="LogiFlow dashboard"
    >
      <span className="flex size-9 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm shadow-blue-600/20">
        <Route className="size-5" strokeWidth={2.5} />
      </span>

      <span className="text-[17px] font-bold tracking-tight text-slate-950">
        LogiFlow
      </span>
    </Link>
  );
}

function Navigation({ pathname }: { pathname: string }) {
  return (
    <nav className="space-y-1" aria-label="Staff navigation">
      {navigation.map(({ label, href, icon: Icon }) => {
        const isActive = href === pathname;

        return (
          <Link
            key={label}
            href={href}
            className={`flex min-h-11 w-full items-center gap-3 rounded-lg px-3 text-sm font-semibold transition ${
              isActive
                ? "bg-blue-50 text-blue-700"
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-950"
            }`}
          >
            <Icon
              className={`size-[18px] ${
                isActive ? "text-blue-600" : "text-slate-400"
              }`}
            />

            {label}
          </Link>
        );
      })}
    </nav>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const pathname = usePathname();

  const [fullName, setFullName] = useState("Account user");
  const [role, setRole] = useState("Administrator");
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, role")
        .eq("id", user.id)
        .single();

      if (profile) {
        if (profile.full_name) {
          setFullName(profile.full_name);
        }

        if (profile.role) {
          setRole(
            profile.role.charAt(0).toUpperCase() + profile.role.slice(1)
          );
        }
      }
    }

    loadProfile();
  }, [router]);

  async function handleLogout() {
    setIsLoggingOut(true);

    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("Logout error:", error);
      setIsLoggingOut(false);
      return;
    }

    router.push("/login");
    router.refresh();
  }

  const initials = fullName
    .split(" ")
    .filter(Boolean)
    .map((name) => name[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-slate-200 bg-white px-5 py-6 lg:flex lg:flex-col">
        <Logo />

        <div className="mt-12">
          <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
            Workspace
          </p>

          <Navigation pathname={pathname} />
        </div>

        <div className="mt-auto space-y-1 border-t border-slate-100 pt-5">
          <button
            type="button"
            disabled
            className="flex min-h-11 w-full cursor-not-allowed items-center gap-3 rounded-lg px-3 text-sm font-semibold text-slate-400"
          >
            <Settings className="size-[18px] text-slate-300" />
            Settings
          </button>

          <div className="mt-4 flex items-center gap-3 rounded-xl bg-slate-50 p-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">
              {initials || "U"}
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-bold text-slate-900">
                {fullName}
              </p>

              <p className="text-[11px] text-slate-500">{role}</p>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="flex size-8 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-white hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
              aria-label="Log out"
            >
              <LogOut className="size-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main application */}
      <div className="lg:pl-64">
        {/* Top header */}
        <header className="sticky top-0 z-20 flex h-[72px] items-center justify-between border-b border-slate-200 bg-white/90 px-5 backdrop-blur sm:px-8 lg:px-10">
          <div className="flex items-center gap-3 lg:hidden">
            <MobileWorkspaceDrawer activeHref="/dashboard" />

            <Logo />
          </div>

          <div className="hidden lg:block">
            <p className="text-xs font-semibold text-slate-400">
              Workspace / Dashboard
            </p>

            <p className="mt-0.5 text-sm font-bold text-slate-900">
              Operations overview
            </p>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <button
              type="button"
              className="relative flex size-10 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-50"
              aria-label="Notifications"
              disabled
            >
              <Bell className="size-[18px]" />
              <span className="absolute right-2.5 top-2 size-1.5 rounded-full bg-blue-600" />
            </button>

            <div className="hidden h-6 w-px bg-slate-200 sm:block" />

            <div className="flex items-center gap-2">
              <div className="flex size-8 items-center justify-center rounded-full bg-blue-100 text-[10px] font-bold text-blue-700">
                {initials || "U"}
              </div>

              <span className="hidden text-xs font-semibold text-slate-700 sm:block">
                {fullName}
              </span>
            </div>
          </div>
        </header>

        {/* Dashboard content */}
        <div className="mx-auto max-w-[1440px] px-5 py-8 sm:px-8 sm:py-10 lg:px-10">
          <section className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <p className="text-sm font-semibold text-blue-600">
                Good morning
              </p>

              <h1 className="mt-1 text-3xl font-bold tracking-[-0.04em] text-slate-950 sm:text-4xl">
                Here&apos;s your operation.
              </h1>

              <p className="mt-3 text-sm leading-6 text-slate-500">
                A clear view of what&apos;s moving, waiting, and needs
                attention.
              </p>
            </div>

            <button
              type="button"
              disabled
              className="inline-flex h-10 cursor-not-allowed items-center justify-center gap-2 self-start rounded-lg border border-slate-200 bg-white px-3.5 text-xs font-semibold text-slate-400 shadow-sm sm:self-auto"
            >
              <Clock3 className="size-4 text-slate-300" />
              Today
              <ChevronRight className="size-3.5 text-slate-300" />
            </button>
          </section>

          <section
            className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
            aria-label="Shipment metrics"
          >
            {metrics.map(({ label, icon: Icon }) => (
              <div
                key={label}
                className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-slate-500">
                    {label}
                  </p>

                  <span className="flex size-8 items-center justify-center rounded-lg bg-slate-50 text-slate-400">
                    <Icon className="size-4" />
                  </span>
                </div>

                <p className="mt-5 text-3xl font-bold tracking-tight text-slate-900">
                  —
                </p>

                <p className="mt-1 text-[11px] text-slate-400">No data yet</p>
              </div>
            ))}
          </section>

          <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_minmax(300px,0.75fr)]">
            <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 sm:px-6">
                <div>
                  <h2 className="text-sm font-bold text-slate-900">
                    Recent shipments
                  </h2>

                  <p className="mt-1 text-xs text-slate-500">
                    The latest movement across your operation.
                  </p>
                </div>

                <Link
                  href="/shipments"
                  className="text-xs font-bold text-blue-600 hover:text-blue-700"
                >
                  View all
                </Link>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[560px] text-left">
                  <thead className="bg-slate-50/70 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    <tr>
                      <th className="px-5 py-3 font-bold sm:px-6">
                        Shipment
                      </th>
                      <th className="px-5 py-3 font-bold">Route</th>
                      <th className="px-5 py-3 font-bold">Status</th>
                    </tr>
                  </thead>

                  <tbody>
                    <tr>
                      <td colSpan={3} className="px-5 py-12 text-center sm:px-6">
                        <div className="mx-auto flex max-w-sm flex-col items-center">
                          <span className="flex size-11 items-center justify-center rounded-full bg-slate-50 text-slate-400">
                            <Package className="size-5" />
                          </span>

                          <p className="mt-4 text-sm font-semibold text-slate-700">
                            No shipments yet
                          </p>

                          <p className="mt-1 text-xs leading-5 text-slate-400">
                            Your latest shipments will appear here once
                            shipment management is connected.
                          </p>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-100 px-5 py-4">
                <h2 className="text-sm font-bold text-slate-900">
                  Recent activity
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Updates from your team and fleet.
                </p>
              </div>

              <div className="flex min-h-[240px] flex-col items-center justify-center px-6 text-center">
                <span className="flex size-11 items-center justify-center rounded-full bg-slate-50 text-slate-400">
                  <Activity className="size-5" />
                </span>

                <p className="mt-4 text-sm font-semibold text-slate-700">
                  No activity yet
                </p>

                <p className="mt-1 max-w-[220px] text-xs leading-5 text-slate-400">
                  Team updates and shipment events will appear here.
                </p>
              </div>
            </section>
          </div>

          <section className="mt-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-sm font-bold text-slate-900">
                  Operational overview
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  A quick view of workload across your logistics network.
                </p>
              </div>

              <CircleHelp className="size-4 text-slate-400" />
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <div className="rounded-lg border border-dashed border-slate-200 p-4">
                <p className="text-xs font-semibold text-slate-500">
                  Pending pickup
                </p>
                <p className="mt-4 text-xl font-bold text-slate-300">—</p>
              </div>

              <div className="rounded-lg border border-dashed border-slate-200 p-4">
                <p className="text-xs font-semibold text-slate-500">
                  Active drivers
                </p>
                <p className="mt-4 text-xl font-bold text-slate-300">—</p>
              </div>

              <div className="rounded-lg border border-dashed border-slate-200 p-4">
                <p className="text-xs font-semibold text-slate-500">
                  Fleet availability
                </p>
                <p className="mt-4 text-xl font-bold text-slate-300">—</p>
              </div>
            </div>
          </section>

          <footer className="mt-10 flex flex-col gap-2 border-t border-slate-200 pt-5 text-[11px] text-slate-400 sm:flex-row sm:items-center sm:justify-between">
            <p className="flex items-center gap-1.5">
              <Command className="size-3.5" />
              LogiFlow operations workspace
            </p>

            <p>Data connects to your workspace as features are built.</p>
          </footer>
        </div>
      </div>
    </main>
  );
}