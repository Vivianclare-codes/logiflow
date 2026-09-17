import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowLeft,
  Bell,
  LayoutDashboard,
  LogOut,
  Package,
  Route,
  Settings,
  Truck,
  UserRound,
  Users,
} from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { CustomerForm } from "@/components/customers/customer-form";
import { CustomerList } from "@/components/customers/customer-list";
import { MobileWorkspaceDrawer } from "@/components/layout/mobile-workspace-drawer";

const navigation = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    href: "/dashboard",
  },
  {
    label: "Shipments",
    icon: Package,
    href: "/shipments",
  },
  {
    label: "Customers",
    icon: Users,
    href: "/customers",
    active: true,
  },
  {
    label: "Drivers",
    icon: UserRound,
    href: "/drivers",
  },
  {
    label: "Vehicles",
    icon: Truck,
    href: "/vehicles",
  },
];

function Logo() {
  return (
    <Link
      href="/dashboard"
      className="flex items-center gap-2.5"
      aria-label="LogiFlow dashboard"
    >
      <span className="flex size-9 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm shadow-blue-600/20">
        <Route
          className="size-5"
          strokeWidth={2.5}
        />
      </span>

      <span className="text-[17px] font-bold tracking-tight text-slate-950">
        LogiFlow
      </span>
    </Link>
  );
}

function Navigation() {
  return (
    <nav
      className="space-y-1"
      aria-label="Staff navigation"
    >
      {navigation.map(
        ({
          label,
          icon: Icon,
          href,
          active,
        }) => (
          <Link
            key={label}
            href={href}
            className={`flex min-h-11 w-full items-center gap-3 rounded-lg px-3 text-sm font-semibold transition ${
              active
                ? "bg-blue-50 text-blue-700"
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-950"
            }`}
          >
            <Icon
              className={`size-[18px] ${
                active
                  ? "text-blue-600"
                  : "text-slate-400"
              }`}
            />

            {label}
          </Link>
        )
      )}
    </nav>
  );
}

async function signOut() {
  "use server";

  const supabase = await createClient();

  await supabase.auth.signOut();

  redirect("/login");
}

export default async function CustomersPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role")
    .eq("id", user.id)
    .single();

  const { data: customers, error } =
    await supabase
      .from("customers")
      .select(
        "id, name, phone, email, address, created_at"
      )
      .order("created_at", {
        ascending: false,
      });

  if (error) {
    console.error(
      "Customers fetch error:",
      error
    );
  }

  const displayName =
    profile?.full_name?.trim() ||
    user.email?.split("@")[0] ||
    "Account user";

  const roleLabel =
    profile?.role === "admin"
      ? "Administrator"
      : profile?.role === "dispatcher"
        ? "Dispatcher"
        : "Staff";

  const initials = displayName
    .split(" ")
    .filter(Boolean)
    .map((part: string) => part[0])
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

          <Navigation />
        </div>

        <div className="mt-auto border-t border-slate-100 pt-5">
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
                {displayName}
              </p>

              <p className="text-[11px] text-slate-500">
                {roleLabel}
              </p>
            </div>

            <form action={signOut}>
              <button
                type="submit"
                className="flex size-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-white hover:text-slate-700"
                aria-label="Log out"
              >
                <LogOut className="size-4" />
              </button>
            </form>
          </div>
        </div>
      </aside>

      {/* Main application */}
      <div className="lg:pl-64">
        {/* Header */}
        <header className="sticky top-0 z-20 flex h-[72px] items-center justify-between border-b border-slate-200 bg-white/90 px-5 backdrop-blur sm:px-8 lg:px-10">
          {/* Mobile header */}
          <div className="flex items-center gap-3 lg:hidden">
            <MobileWorkspaceDrawer
              activeHref="/customers"
            />

            <Logo />
          </div>

          {/* Desktop header */}
          <div className="hidden lg:block">
            <p className="text-xs font-semibold text-slate-400">
              Workspace / Customers
            </p>

            <p className="mt-0.5 text-sm font-bold text-slate-900">
              Customer operations
            </p>
          </div>

          {/* Header actions */}
          <div className="flex items-center gap-2 sm:gap-4">
            <button
              type="button"
              disabled
              className="relative flex size-10 cursor-not-allowed items-center justify-center rounded-lg text-slate-400"
              aria-label="Notifications"
            >
              <Bell className="size-[18px]" />

              <span className="absolute right-2.5 top-2 size-1.5 rounded-full bg-slate-300" />
            </button>

            <div className="hidden h-6 w-px bg-slate-200 sm:block" />

            <div className="flex items-center gap-2">
              <div className="flex size-8 items-center justify-center rounded-full bg-blue-100 text-[10px] font-bold text-blue-700">
                {initials || "U"}
              </div>

              <span className="hidden text-xs font-semibold text-slate-700 sm:block">
                {displayName}
              </span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <div className="mx-auto max-w-[1440px] px-5 py-8 sm:px-8 sm:py-10 lg:px-10">
          {/* Back link */}
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 transition hover:text-blue-600"
          >
            <ArrowLeft className="size-3.5" />

            Back to dashboard
          </Link>

          {/* Heading */}
          <section className="mt-7 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <p className="text-sm font-semibold text-blue-600">
                Customer directory
              </p>

              <h1 className="mt-1 text-3xl font-bold tracking-[-0.04em] text-slate-950 sm:text-4xl">
                Customers
              </h1>

              <p className="mt-3 max-w-xl text-sm leading-6 text-slate-500">
                Manage the customers connected to your logistics operation.
              </p>
            </div>

            <Link
              href="#add-customer"
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 text-xs font-bold text-white shadow-sm shadow-blue-600/20 transition hover:bg-blue-700"
            >
              <Users className="size-4" />

              Add customer
            </Link>
          </section>

          {/* Customer list */}
          <section
            className="mt-8 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
            aria-labelledby="customer-list-heading"
          >
            <div className="flex flex-col gap-4 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
              <div>
                <h2
                  id="customer-list-heading"
                  className="text-sm font-bold text-slate-900"
                >
                  Customer list
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Search and manage the customers in your workspace.
                </p>
              </div>

              <span className="w-fit rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-semibold text-slate-500">
                {customers?.length ?? 0}{" "}
                {customers?.length === 1
                  ? "customer"
                  : "customers"}
              </span>
            </div>

            <div className="p-4 sm:p-5">
              <CustomerList
                customers={customers ?? []}
              />
            </div>
          </section>

          {/* Add customer */}
          <section
            id="add-customer"
            className="mt-8 scroll-mt-24 rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
          >
            <div className="mb-6">
              <p className="text-sm font-semibold text-blue-600">
                Customer directory
              </p>

              <h2 className="mt-1 text-lg font-bold text-slate-950">
                Add a customer
              </h2>

              <p className="mt-1 text-sm leading-6 text-slate-500">
                Add a customer to your logistics workspace.
              </p>
            </div>

            <CustomerForm />
          </section>

          {/* Footer */}
          <footer className="mt-10 border-t border-slate-200 pt-5 text-[11px] text-slate-400">
            LogiFlow operations workspace
          </footer>
        </div>
      </div>
    </main>
  );
}