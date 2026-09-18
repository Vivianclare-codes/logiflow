import Link from "next/link";
import {
  Activity,
  Bell,
  CheckCircle2,
  ChevronRight,
  CircleDollarSign,
  CircleHelp,
  Clock3,
  Command,
  LayoutDashboard,
  LogOut,
  Package,
  Route,
  Truck,
  UserRound,
  Users,
} from "lucide-react";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { getDashboardData } from "@/app/dashboard/data";
import { MobileWorkspaceDrawer } from "@/components/layout/mobile-workspace-drawer";

const navigation = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Shipments",
    href: "/shipments",
    icon: Package,
  },
  {
    label: "Customers",
    href: "/customers",
    icon: Users,
  },
  {
    label: "Drivers",
    href: "/drivers",
    icon: UserRound,
  },
  {
    label: "Vehicles",
    href: "/vehicles",
    icon: Truck,
  },
  {
    label: "Activity",
    href: "/activity",
    icon: Activity,
  },
];

function Logo() {
  return (
    <Link
      href="/"
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
        ({ label, href, icon: Icon }) => {
          const isActive = href === "/dashboard";

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
                  isActive
                    ? "text-blue-600"
                    : "text-slate-400"
                }`}
              />

              {label}
            </Link>
          );
        }
      )}
    </nav>
  );
}

function formatStatus(status: string) {
  switch (status) {
    case "pending":
      return "Pending";

    case "pickup_scheduled":
      return "Pickup scheduled";

    case "picked_up":
      return "Picked up";

    case "in_transit":
      return "In transit";

    case "out_for_delivery":
      return "Out for delivery";

    case "delivered":
      return "Delivered";

    case "cancelled":
      return "Cancelled";

    default:
      return status;
  }
}

function statusClasses(status: string) {
  switch (status) {
    case "pending":
      return "bg-slate-100 text-slate-700";

    case "pickup_scheduled":
      return "bg-blue-50 text-blue-700";

    case "picked_up":
      return "bg-indigo-50 text-indigo-700";

    case "in_transit":
      return "bg-blue-50 text-blue-700";

    case "out_for_delivery":
      return "bg-amber-50 text-amber-700";

    case "delivered":
      return "bg-emerald-50 text-emerald-700";

    case "cancelled":
      return "bg-red-50 text-red-700";

    default:
      return "bg-slate-100 text-slate-700";
  }
}

function formatActivityAction(action: string) {
  switch (action) {
    case "shipment_created":
      return "Shipment created";

    case "driver_assigned":
      return "Driver assigned";

    case "vehicle_assigned":
      return "Vehicle assigned";

    case "driver_reassigned":
      return "Driver reassigned";

    case "vehicle_reassigned":
      return "Vehicle reassigned";

    case "status_changed":
      return "Shipment status changed";

    case "payment_recorded":
      return "Payment recorded";

    case "delivery_completed":
      return "Delivery completed";

    default:
      return action;
  }
}

function activityIcon(action: string) {
  switch (action) {
    case "shipment_created":
      return Package;

    case "driver_assigned":
    case "driver_reassigned":
      return UserRound;

    case "vehicle_assigned":
    case "vehicle_reassigned":
      return Truck;

    case "payment_recorded":
      return CircleDollarSign;

    case "delivery_completed":
      return CheckCircle2;

    case "status_changed":
      return Route;

    default:
      return Activity;
  }
}

function activityIconClasses(action: string) {
  switch (action) {
    case "shipment_created":
      return "bg-blue-50 text-blue-600";

    case "driver_assigned":
    case "driver_reassigned":
      return "bg-violet-50 text-violet-600";

    case "vehicle_assigned":
    case "vehicle_reassigned":
      return "bg-slate-100 text-slate-600";

    case "payment_recorded":
    case "delivery_completed":
      return "bg-emerald-50 text-emerald-600";

    case "status_changed":
      return "bg-amber-50 text-amber-600";

    default:
      return "bg-slate-100 text-slate-600";
  }
}

function formatEventTime(value: string) {
  return new Date(value).toLocaleString(
    "en-NG",
    {
      dateStyle: "medium",
      timeStyle: "short",
    }
  );
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatRoutePart(address: string) {
  const parts = address
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);

  return parts[parts.length - 1] ?? address;
}

export default async function DashboardPage() {
  const supabase = await createClient();

  // -----------------------------------------
  // Authentication
  // -----------------------------------------

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // -----------------------------------------
  // Current profile
  // -----------------------------------------

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role")
    .eq("id", user.id)
    .single();

  if (
    !profile ||
    (profile.role !== "admin" &&
      profile.role !== "dispatcher")
  ) {
    redirect("/login");
  }

  // -----------------------------------------
  // Real dashboard data
  // -----------------------------------------

  const dashboardData =
    await getDashboardData();

  async function handleLogout() {
    "use server";

    const supabase = await createClient();

    await supabase.auth.signOut();

    redirect("/login");
  }

  const fullName =
    profile.full_name ?? "Account user";

  const role =
    profile.role === "admin"
      ? "Administrator"
      : "Dispatcher";

  const initials = fullName
    .split(" ")
    .filter(Boolean)
    .map((name: any[]) => name[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const metrics = [
    {
      label: "Total shipments",
      value: dashboardData.totalShipments,
      icon: Package,
      helper: "All shipments",
    },
    {
      label: "Pending",
      value: dashboardData.pendingShipments,
      icon: Clock3,
      helper: "Awaiting next step",
    },
    {
      label: "In transit",
      value: dashboardData.inTransitShipments,
      icon: Route,
      helper: "Currently moving",
    },
    {
      label: "Today's deliveries",
      value: dashboardData.todaysDeliveries,
      icon: Truck,
      helper: "Completed today",
    },
  ];

  const fleetAvailability =
    dashboardData.totalVehicles > 0
      ? `${dashboardData.availableVehicles}/${dashboardData.totalVehicles}`
      : "0/0";

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

        <div className="mt-auto space-y-1 border-t border-slate-100 pt-5">
          <button
            type="button"
            disabled
            className="flex min-h-11 w-full cursor-not-allowed items-center gap-3 rounded-lg px-3 text-sm font-semibold text-slate-400"
          >
            <SettingsIcon />
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

              <p className="text-[11px] text-slate-500">
                {role}
              </p>
            </div>

            <form action={handleLogout}>
              <button
                type="submit"
                className="flex size-8 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-white hover:text-slate-700"
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
                A clear view of what&apos;s moving,
                waiting, and needs attention.
              </p>
            </div>

            <div className="inline-flex h-10 items-center gap-2 self-start rounded-lg border border-slate-200 bg-white px-3.5 text-xs font-semibold text-slate-500 shadow-sm sm:self-auto">
              <Clock3 className="size-4 text-slate-400" />
              Today
            </div>
          </section>

          {/* Metrics */}
          <section
            className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
            aria-label="Shipment metrics"
          >
            {metrics.map(
              ({
                label,
                value,
                icon: Icon,
                helper,
              }) => (
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
                    {value.toLocaleString("en-NG")}
                  </p>

                  <p className="mt-1 text-[11px] text-slate-400">
                    {helper}
                  </p>
                </div>
              )
            )}
          </section>

          <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_minmax(300px,0.75fr)]">
            {/* Recent shipments */}
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

                      <th className="px-5 py-3 font-bold">
                        Route
                      </th>

                      <th className="px-5 py-3 font-bold">
                        Status
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {dashboardData.recentShipments.length >
                    0 ? (
                      dashboardData.recentShipments.map(
                        (shipment) => (
                          <tr
                            key={shipment.id}
                            className="transition hover:bg-slate-50/70"
                          >
                            <td className="px-5 py-4 sm:px-6">
                              <Link
                                href={`/shipments/${shipment.id}`}
                                className="group"
                              >
                                <p className="text-sm font-bold text-slate-900 group-hover:text-blue-600">
                                  {shipment.trackingNumber}
                                </p>

                                <p className="mt-1 max-w-[180px] truncate text-xs text-slate-400">
                                  {shipment.customerName}
                                </p>
                              </Link>
                            </td>

                            <td className="px-5 py-4 text-xs text-slate-500">
                              <div className="flex items-center gap-2">
                                <span>
                                  {formatRoutePart(
                                    shipment.pickupAddress
                                  )}
                                </span>

                                <ChevronRight className="size-3 text-slate-300" />

                                <span>
                                  {formatRoutePart(
                                    shipment.destinationAddress
                                  )}
                                </span>
                              </div>
                            </td>

                            <td className="px-5 py-4">
                              <span
                                className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold ${statusClasses(
                                  shipment.status
                                )}`}
                              >
                                {formatStatus(
                                  shipment.status
                                )}
                              </span>
                            </td>
                          </tr>
                        )
                      )
                    ) : (
                      <tr>
                        <td
                          colSpan={3}
                          className="px-5 py-12 text-center sm:px-6"
                        >
                          <div className="mx-auto flex max-w-sm flex-col items-center">
                            <span className="flex size-11 items-center justify-center rounded-full bg-slate-50 text-slate-400">
                              <Package className="size-5" />
                            </span>

                            <p className="mt-4 text-sm font-semibold text-slate-700">
                              No shipments yet
                            </p>

                            <p className="mt-1 text-xs leading-5 text-slate-400">
                              Create your first shipment
                              and it will appear here.
                            </p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>

            {/* Recent activity */}
            <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                <div>
                  <h2 className="text-sm font-bold text-slate-900">
                    Recent activity
                  </h2>

                  <p className="mt-1 text-xs text-slate-500">
                    Updates from your team and fleet.
                  </p>
                </div>

                <Link
                  href="/activity"
                  className="text-xs font-bold text-blue-600 hover:text-blue-700"
                >
                  View all
                </Link>
              </div>

              {dashboardData.recentActivity.length >
              0 ? (
                <div className="divide-y divide-slate-100">
                  {dashboardData.recentActivity.map(
                    (activity) => {
                      const Icon = activityIcon(
                        activity.action
                      );

                      const iconClasses =
                        activityIconClasses(
                          activity.action
                        );

                      const metadata =
                        activity.metadata;

                      const trackingNumber =
                        typeof metadata.tracking_number ===
                        "string"
                          ? metadata.tracking_number
                          : null;

                      const amount =
                        typeof metadata.amount ===
                          "number" ||
                        typeof metadata.amount ===
                          "string"
                          ? Number(metadata.amount)
                          : null;

                      const previousStatus =
                        typeof metadata.previous_status ===
                        "string"
                          ? metadata.previous_status
                          : null;

                      const newStatus =
                        typeof metadata.new_status ===
                        "string"
                          ? metadata.new_status
                          : null;

                      return (
                        <div
                          key={activity.id}
                          className="px-5 py-4"
                        >
                          <div className="flex gap-3">
                            <div
                              className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${iconClasses}`}
                            >
                              <Icon className="size-4" />
                            </div>

                            <div className="min-w-0 flex-1">
                              <div className="flex items-start justify-between gap-3">
                                <p className="text-xs font-bold text-slate-800">
                                  {formatActivityAction(
                                    activity.action
                                  )}
                                </p>

                                {trackingNumber && (
                                  <Link
                                    href={`/shipments/${activity.entityId}`}
                                    className="shrink-0 text-[10px] font-bold text-blue-600 hover:text-blue-700"
                                  >
                                    {trackingNumber}
                                  </Link>
                                )}
                              </div>

                              <p className="mt-1 text-[11px] text-slate-400">
                                {activity.actor
                                  ?.fullName ??
                                  "Staff"}{" "}
                                ·{" "}
                                {formatEventTime(
                                  activity.createdAt
                                )}
                              </p>

                              {activity.action ===
                                "status_changed" &&
                                previousStatus &&
                                newStatus && (
                                  <p className="mt-2 text-[11px] text-slate-500">
                                    {formatStatus(
                                      previousStatus
                                    )}{" "}
                                    →{" "}
                                    {formatStatus(
                                      newStatus
                                    )}
                                  </p>
                                )}

                              {activity.action ===
                                "payment_recorded" &&
                                amount !== null && (
                                  <p className="mt-2 text-[11px] text-slate-500">
                                    {formatCurrency(
                                      amount
                                    )}{" "}
                                    recorded.
                                  </p>
                                )}

                              {activity.action ===
                                "shipment_created" && (
                                  <p className="mt-2 text-[11px] text-slate-500">
                                    New shipment added
                                    to the operation.
                                  </p>
                                )}

                              {activity.action ===
                                "delivery_completed" && (
                                  <p className="mt-2 text-[11px] text-slate-500">
                                    Delivery completed
                                    successfully.
                                  </p>
                                )}
                            </div>
                          </div>
                        </div>
                      );
                    }
                  )}
                </div>
              ) : (
                <div className="flex min-h-[240px] flex-col items-center justify-center px-6 text-center">
                  <span className="flex size-11 items-center justify-center rounded-full bg-slate-50 text-slate-400">
                    <Activity className="size-5" />
                  </span>

                  <p className="mt-4 text-sm font-semibold text-slate-700">
                    No activity yet
                  </p>

                  <p className="mt-1 max-w-[220px] text-xs leading-5 text-slate-400">
                    Team updates and shipment events
                    will appear here.
                  </p>
                </div>
              )}
            </section>
          </div>

          {/* Operational overview */}
          <section className="mt-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-sm font-bold text-slate-900">
                  Operational overview
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  A quick view of workload across your
                  logistics network.
                </p>
              </div>

              <CircleHelp className="size-4 text-slate-400" />
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <div className="rounded-lg border border-slate-200 p-4">
                <p className="text-xs font-semibold text-slate-500">
                  Completed shipments
                </p>

                <p className="mt-4 text-xl font-bold text-slate-900">
                  {dashboardData.completedShipments.toLocaleString(
                    "en-NG"
                  )}
                </p>
              </div>

              <div className="rounded-lg border border-slate-200 p-4">
                <p className="text-xs font-semibold text-slate-500">
                  Active drivers
                </p>

                <p className="mt-4 text-xl font-bold text-slate-900">
                  {dashboardData.activeDrivers.toLocaleString(
                    "en-NG"
                  )}
                </p>
              </div>

              <div className="rounded-lg border border-slate-200 p-4">
                <p className="text-xs font-semibold text-slate-500">
                  Fleet availability
                </p>

                <p className="mt-4 text-xl font-bold text-slate-900">
                  {fleetAvailability}
                </p>
              </div>
            </div>

            <div className="mt-3 rounded-lg border border-slate-200 p-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold text-slate-500">
                    Outstanding payments
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    Total unpaid balance across shipments
                  </p>
                </div>

                <p className="text-lg font-bold text-slate-900">
                  {formatCurrency(
                    dashboardData.outstandingPayments
                  )}
                </p>
              </div>
            </div>
          </section>

          <footer className="mt-10 flex flex-col gap-2 border-t border-slate-200 pt-5 text-[11px] text-slate-400 sm:flex-row sm:items-center sm:justify-between">
            <p className="flex items-center gap-1.5">
              <Command className="size-3.5" />
              LogiFlow operations workspace
            </p>

            <p>
              Live operational data from your workspace.
            </p>
          </footer>
        </div>
      </div>
    </main>
  );
}

function SettingsIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-[18px] text-slate-300"
      aria-hidden="true"
    >
      <path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z" />
      <path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-1.42 1.42-.06-.06a1.7 1.7 0 0 0-1.88-.34 1.7 1.7 0 0 0-1.03 1.56V19.6h-2v-.08A1.7 1.7 0 0 0 12.38 18a1.7 1.7 0 0 0-1.88.34l-.06.06-1.42-1.42.06-.06A1.7 1.7 0 0 0 9.42 15a1.7 1.7 0 0 0-1.56-1.03H7.6v-2h.26A1.7 1.7 0 0 0 9.42 11a1.7 1.7 0 0 0-.34-1.88l-.06-.06 1.42-1.42.06.06a1.7 1.7 0 0 0 1.88.34A1.7 1.7 0 0 0 13.4 6.48V6.4h2v.08a1.7 1.7 0 0 0 1.03 1.56 1.7 1.7 0 0 0 1.88-.34l.06-.06 1.42 1.42-.06.06A1.7 1.7 0 0 0 19.4 11c.17.63.75 1.03 1.4 1.03h.2v2h-.2A1.7 1.7 0 0 0 19.4 15Z" />
    </svg>
  );
}