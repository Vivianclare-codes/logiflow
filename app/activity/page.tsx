import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  CircleDollarSign,
  Package,
  Route,
  Truck,
  UserRound,
} from "lucide-react";
import { notFound } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { MobileWorkspaceDrawer } from "@/components/layout/mobile-workspace-drawer";

function formatAction(action: string) {
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

function actionIcon(action: string) {
  switch (action) {
    case "shipment_created":
      return Package;

    case "driver_assigned":
    case "driver_reassigned":
      return UserRound;

    case "vehicle_assigned":
    case "vehicle_reassigned":
      return Truck;

    case "status_changed":
      return Route;

    case "payment_recorded":
      return CircleDollarSign;

    case "delivery_completed":
      return CheckCircle2;

    default:
      return Route;
  }
}

function actionClasses(action: string) {
  switch (action) {
    case "shipment_created":
      return "bg-blue-50 text-blue-600";

    case "driver_assigned":
    case "driver_reassigned":
      return "bg-violet-50 text-violet-600";

    case "vehicle_assigned":
    case "vehicle_reassigned":
      return "bg-slate-100 text-slate-600";

    case "status_changed":
      return "bg-amber-50 text-amber-600";

    case "payment_recorded":
      return "bg-emerald-50 text-emerald-600";

    case "delivery_completed":
      return "bg-emerald-50 text-emerald-600";

    default:
      return "bg-slate-100 text-slate-600";
  }
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

function formatEventTime(value: string) {
  return new Date(value).toLocaleString("en-NG", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function formatCurrency(value: number | string) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(Number(value));
}

export default async function ActivityPage() {
  const supabase = await createClient();

  // -----------------------------------------
  // Authentication
  // -----------------------------------------

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    notFound();
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
    notFound();
  }

  // -----------------------------------------
  // Activity logs
  // -----------------------------------------

  const { data: logs, error } = await supabase
    .from("activity_logs")
    .select(`
      id,
      actor_id,
      action,
      entity_type,
      entity_id,
      metadata,
      created_at,
      actor:profiles (
        id,
        full_name,
        role
      )
    `)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    console.error("Activity logs error:", error);
  }

  const activityLogs = (logs ?? []).map((log) => {
    const actor = Array.isArray(log.actor)
      ? log.actor[0] ?? null
      : log.actor;

    return {
      id: log.id,
      actor_id: log.actor_id,
      action: log.action,
      entity_type: log.entity_type,
      entity_id: log.entity_id,
      metadata:
        (log.metadata as Record<string, unknown>) ?? {},
      created_at: log.created_at,
      actor,
    };
  });

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="flex min-h-screen">

        {/* Desktop Sidebar */}
        <aside className="hidden w-64 shrink-0 border-r border-slate-200 bg-white lg:flex lg:flex-col">
          <div className="border-b border-slate-100 px-6 py-6">
            <Link
              href="/dashboard"
              className="flex items-center gap-3"
            >
              <div className="flex size-9 items-center justify-center rounded-xl bg-blue-600 text-white">
                <Route className="size-5" />
              </div>

              <div>
                <p className="text-sm font-bold text-slate-950">
                  LogiFlow
                </p>

                <p className="text-[11px] text-slate-400">
                  Operations
                </p>
              </div>
            </Link>
          </div>

          <div className="flex-1 px-4 py-6">
            <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
              Workspace
            </p>

            <nav
              className="space-y-1"
              aria-label="Staff navigation"
            >
              <Link
                href="/dashboard"
                className="flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-slate-950"
              >
                <Package className="size-[18px] text-slate-400" />
                Dashboard
              </Link>

              <Link
                href="/shipments"
                className="flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-slate-950"
              >
                <Package className="size-[18px] text-slate-400" />
                Shipments
              </Link>

              <Link
                href="/customers"
                className="flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-slate-950"
              >
                <UserRound className="size-[18px] text-slate-400" />
                Customers
              </Link>

              <Link
                href="/drivers"
                className="flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-slate-950"
              >
                <UserRound className="size-[18px] text-slate-400" />
                Drivers
              </Link>

              <Link
                href="/vehicles"
                className="flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-slate-950"
              >
                <Package className="size-[18px] text-slate-400" />
                Vehicles
              </Link>

              <Link
                href="/activity"
                className="flex min-h-11 items-center gap-3 rounded-lg bg-blue-50 px-3 text-sm font-semibold text-blue-700"
              >
                <Route className="size-[18px] text-blue-600" />
                Activity
              </Link>
            </nav>
          </div>

          <div className="border-t border-slate-100 px-5 py-5">
            <p className="text-sm font-semibold text-slate-900">
              {profile.full_name ?? "Staff"}
            </p>

            <p className="mt-1 text-xs capitalize text-slate-400">
              {profile.role}
            </p>
          </div>
        </aside>

        {/* Main Content */}
        <div className="min-w-0 flex-1">

          {/* Header */}
          <header className="border-b border-slate-200 bg-white">
            <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">

              <div className="flex items-center gap-3 lg:hidden">
                <MobileWorkspaceDrawer activeHref="/activity" />

                <Link
                  href="/dashboard"
                  className="flex items-center gap-2"
                >
                  <div className="flex size-8 items-center justify-center rounded-lg bg-blue-600 text-white">
                    <Route className="size-4" />
                  </div>

                  <span className="text-sm font-bold text-slate-950">
                    LogiFlow
                  </span>
                </Link>
              </div>

              <div className="hidden lg:block">
                <p className="text-sm font-semibold text-slate-900">
                  Activity
                </p>
              </div>

              <div className="text-right">
                <p className="text-xs font-medium text-slate-400">
                  Operations
                </p>
              </div>

            </div>
          </header>

          {/* Page */}
          <main className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
            <div className="mx-auto max-w-5xl">

              {/* Back link */}
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-slate-950"
              >
                <ArrowLeft className="size-4" />
                Back to dashboard
              </Link>

              {/* Heading */}
              <div className="mt-6">
                <h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
                  Activity
                </h1>

                <p className="mt-2 text-sm text-slate-500">
                  A record of recent operational actions in
                  LogiFlow.
                </p>
              </div>

              {/* Activity list */}
              <section className="mt-8 rounded-2xl border border-slate-200 bg-white shadow-sm">

                <div className="border-b border-slate-100 px-5 py-4 sm:px-6">
                  <p className="text-sm font-bold text-slate-950">
                    Recent activity
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    Showing the 50 most recent recorded actions.
                  </p>
                </div>

                {activityLogs.length > 0 ? (
                  <div className="divide-y divide-slate-100">
                    {activityLogs.map((log) => {
                      const Icon = actionIcon(log.action);

                      const metadata = log.metadata;

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

                      const amount =
                        typeof metadata.amount === "number" ||
                        typeof metadata.amount === "string"
                          ? metadata.amount
                          : null;

                      const trackingNumber =
                        typeof metadata.tracking_number ===
                        "string"
                          ? metadata.tracking_number
                          : null;

                      const recipientName =
                        typeof metadata.recipient_name ===
                        "string"
                          ? metadata.recipient_name
                          : null;

                      return (
                        <div
                          key={log.id}
                          className="px-5 py-5 sm:px-6"
                        >
                          <div className="flex gap-4">

                            {/* Icon */}
                            <div
                              className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${actionClasses(
                                log.action
                              )}`}
                            >
                              <Icon className="size-5" />
                            </div>

                            {/* Content */}
                            <div className="min-w-0 flex-1">

                              <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                                <div>
                                  <p className="text-sm font-semibold text-slate-900">
                                    {formatAction(log.action)}
                                  </p>

                                  <p className="mt-1 text-xs text-slate-400">
                                    {formatEventTime(
                                      log.created_at
                                    )}
                                  </p>
                                </div>

                                {trackingNumber && (
                                  <span className="text-xs font-semibold text-blue-600">
                                    {trackingNumber}
                                  </span>
                                )}
                              </div>

                              <div className="mt-3 space-y-1 text-sm text-slate-600">

                                {log.action ===
                                  "status_changed" &&
                                  previousStatus &&
                                  newStatus && (
                                    <p>
                                      {formatStatus(
                                        previousStatus
                                      )}{" "}
                                      →{" "}
                                      {formatStatus(newStatus)}
                                    </p>
                                  )}

                                {log.action ===
                                  "payment_recorded" &&
                                  amount !== null && (
                                    <p>
                                      Payment of{" "}
                                      <span className="font-semibold text-slate-900">
                                        {formatCurrency(amount)}
                                      </span>{" "}
                                      recorded.
                                    </p>
                                  )}

                                {log.action ===
                                  "delivery_completed" &&
                                  recipientName && (
                                    <p>
                                      Recipient:{" "}
                                      <span className="font-semibold text-slate-900">
                                        {recipientName}
                                      </span>
                                    </p>
                                  )}

                                {log.action ===
                                  "driver_reassigned" && (
                                    <p>
                                      The shipment's driver was
                                      replaced.
                                    </p>
                                  )}

                                {log.action ===
                                  "vehicle_reassigned" && (
                                    <p>
                                      The shipment's vehicle was
                                      replaced.
                                    </p>
                                  )}

                                {log.action ===
                                  "driver_assigned" && (
                                    <p>
                                      A driver was assigned to
                                      the shipment.
                                    </p>
                                  )}

                                {log.action ===
                                  "vehicle_assigned" && (
                                    <p>
                                      A vehicle was assigned to
                                      the shipment.
                                    </p>
                                  )}

                                {log.action ===
                                  "shipment_created" && (
                                    <p>
                                      A new shipment was created.
                                    </p>
                                  )}

                              </div>

                              <div className="mt-3">
                                <p className="text-xs text-slate-400">
                                  By{" "}
                                  <span className="font-medium text-slate-500">
                                    {log.actor?.full_name ??
                                      "Staff"}
                                  </span>
                                  {log.actor?.role && (
                                    <>
                                      {" "}
                                      ·{" "}
                                      <span className="capitalize">
                                        {log.actor.role}
                                      </span>
                                    </>
                                  )}
                                </p>
                              </div>

                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="px-6 py-12 text-center">
                    <div className="mx-auto flex size-12 items-center justify-center rounded-xl bg-slate-50">
                      <Route className="size-5 text-slate-400" />
                    </div>

                    <p className="mt-4 text-sm font-semibold text-slate-900">
                      No activity recorded yet.
                    </p>

                    <p className="mt-1 text-sm text-slate-400">
                      Operational actions will appear here as
                      they happen.
                    </p>
                  </div>
                )}

              </section>

            </div>
          </main>

          {/* Footer */}
          <footer className="border-t border-slate-200 px-4 py-6 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-5xl">
              <p className="text-xs text-slate-400">
                LogiFlow Operations Management
              </p>
            </div>
          </footer>

        </div>
      </div>
    </div>
  );
}