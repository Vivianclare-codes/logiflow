import Link from "next/link";
import { ArrowLeft, MapPin, Package, Route, UserRound } from "lucide-react";
import { notFound } from "next/navigation";
import { UpdateStatusForm } from "@/components/shipments/update-status-form";

import { createClient } from "@/lib/supabase/server";
import { MobileWorkspaceDrawer } from "@/components/layout/mobile-workspace-drawer";

function formatEventTime(value: string) {
  return new Date(value).toLocaleString("en-NG", {
    dateStyle: "medium",
    timeStyle: "short",
  });
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

function formatCurrency(value: number | string) {
  const amount = Number(value);

  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(amount);
}

export default async function ShipmentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    notFound();
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role")
    .eq("id", user.id)
    .single();

  const { data: shipment, error } = await supabase
    .from("shipments")
    .select(`
      id,
      tracking_number,
      pickup_address,
      destination_address,
      status,
      delivery_fee,
      scheduled_pickup,
      created_at,
      customer:customers (
        name,
        phone,
        email,
        address
      )
    `)
    .eq("id", id)
    .single();

    const { data: events, error: eventsError } = await supabase
  .from("shipment_events")
  .select(`
    id,
    status,
    description,
    created_at
  `)
  .eq("shipment_id", id)
  .order("created_at", { ascending: false });

if (eventsError) {
  console.error("Shipment events error:", eventsError);
}

  if (error || !shipment) {
    notFound();
  }

  const customer = Array.isArray(shipment.customer)
    ? shipment.customer[0] ?? null
    : shipment.customer;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="flex min-h-screen">
        {/* Desktop Sidebar */}
        <aside className="hidden w-64 shrink-0 border-r border-slate-200 bg-white lg:flex lg:flex-col">
          <div className="border-b border-slate-100 px-6 py-6">
            <Link href="/dashboard" className="flex items-center gap-3">
              <div className="flex size-9 items-center justify-center rounded-xl bg-blue-600 text-white">
                <Route className="size-5" />
              </div>

              <div>
                <p className="text-sm font-bold text-slate-950">LogiFlow</p>
                <p className="text-[11px] text-slate-400">Operations</p>
              </div>
            </Link>
          </div>

          <div className="flex-1 px-4 py-6">
            <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
              Workspace
            </p>

            <nav className="space-y-1" aria-label="Staff navigation">
              <Link
                href="/dashboard"
                className="flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-slate-950"
              >
                <Package className="size-[18px] text-slate-400" />
                Dashboard
              </Link>

              <Link
                href="/shipments"
                className="flex min-h-11 items-center gap-3 rounded-lg bg-blue-50 px-3 text-sm font-semibold text-blue-700"
              >
                <Package className="size-[18px] text-blue-600" />
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
            </nav>
          </div>

          <div className="border-t border-slate-100 px-5 py-5">
            <p className="text-sm font-semibold text-slate-900">
              {profile?.full_name ?? "Staff"}
            </p>

            <p className="mt-1 text-xs capitalize text-slate-400">
              {profile?.role ?? "staff"}
            </p>
          </div>
        </aside>

        {/* Main Content */}
        <div className="min-w-0 flex-1">
          {/* Header */}
          <header className="border-b border-slate-200 bg-white">
            <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
              <div className="flex items-center gap-3 lg:hidden">
                <MobileWorkspaceDrawer activeHref="/shipments" />

                <Link href="/dashboard" className="flex items-center gap-2">
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
                  Shipment details
                </p>
              </div>

              <div className="text-right">
                <p className="text-xs font-medium text-slate-400">
                  Operations
                </p>
              </div>
            </div>
          </header>

          <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
  <div>
    <h2 className="text-sm font-bold text-slate-950">
      Shipment workflow
    </h2>

    <p className="mt-1 text-xs text-slate-400">
     A driver and vehicle must be assigned before pickup.
    </p>
  </div>

  <div className="mt-5">
    <UpdateStatusForm
      shipmentId={shipment.id}
      currentStatus={shipment.status}
    />
  </div>
</section>

          {/* Page */}
          <main className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
            <div className="mx-auto max-w-6xl">
              <Link
                href="/shipments"
                className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-slate-950"
              >
                <ArrowLeft className="size-4" />
                Back to shipments
              </Link>

              {/* Heading */}
              <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
                      {shipment.tracking_number}
                    </h1>

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold ${statusClasses(
                        shipment.status
                      )}`}
                    >
                      {formatStatus(shipment.status)}
                    </span>
                  </div>

                  <p className="mt-2 text-sm text-slate-500">
                    Created{" "}
                    {new Date(shipment.created_at).toLocaleString("en-NG")}
                  </p>
                </div>
              </div>

              {/* Main Grid */}
              <div className="mt-8 grid gap-6 lg:grid-cols-3">
                {/* Customer */}
                <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                      <UserRound className="size-5" />
                    </div>

                    <div>
                      <h2 className="text-sm font-bold text-slate-950">
                        Customer
                      </h2>
                      <p className="text-xs text-slate-400">
                        Shipment customer
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 space-y-3">
                    <div>
                      <p className="text-xs font-medium text-slate-400">
                        Name
                      </p>
                      <p className="mt-1 text-sm font-semibold text-slate-900">
                        {customer?.name ?? "—"}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-medium text-slate-400">
                        Phone
                      </p>
                      <p className="mt-1 text-sm text-slate-700">
                        {customer?.phone ?? "—"}
                      </p>
                    </div>

                    {customer?.email && (
                      <div>
                        <p className="text-xs font-medium text-slate-400">
                          Email
                        </p>
                        <p className="mt-1 break-all text-sm text-slate-700">
                          {customer.email}
                        </p>
                      </div>
                    )}
                  </div>
                </section>

                {/* Delivery Fee */}
                <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                      <Package className="size-5" />
                    </div>

                    <div>
                      <h2 className="text-sm font-bold text-slate-950">
                        Delivery fee
                      </h2>
                      <p className="text-xs text-slate-400">
                        Current shipment charge
                      </p>
                    </div>
                  </div>

                  <div className="mt-6">
                    <p className="text-3xl font-bold tracking-tight text-slate-950">
                      {formatCurrency(shipment.delivery_fee)}
                    </p>

                    <p className="mt-2 text-sm text-slate-500">
                      Payment tracking will be added later.
                    </p>
                  </div>
                </section>

                {/* Assignment Placeholder */}
                <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                      <Route className="size-5" />
                    </div>

                    <div>
                      <h2 className="text-sm font-bold text-slate-950">
                        Dispatch
                      </h2>
                      <p className="text-xs text-slate-400">
                        Assignment status
                      </p>
                    </div>
                  </div>

                  <div className="mt-6">
                    <p className="text-sm font-semibold text-slate-900">
                      Not assigned
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                      Driver and vehicle assignment will be added in the
                      dispatch phase.
                    </p>
                  </div>
                </section>

                {/* Route */}
                <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-3">
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                      <MapPin className="size-5" />
                    </div>

                    <div>
                      <h2 className="text-sm font-bold text-slate-950">
                        Shipment route
                      </h2>
                      <p className="text-xs text-slate-400">
                        Pickup and destination
                      </p>
                    </div>
                  </div>

                  <div className="mt-8 grid gap-8 md:grid-cols-[1fr_auto_1fr] md:items-center">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
                        Pickup
                      </p>

                      <p className="mt-2 text-sm font-medium leading-6 text-slate-800">
                        {shipment.pickup_address}
                      </p>
                    </div>

                    <div className="hidden h-px w-20 bg-slate-200 md:block" />

                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
                        Destination
                      </p>

                      <p className="mt-2 text-sm font-medium leading-6 text-slate-800">
                        {shipment.destination_address}
                      </p>
                    </div>
                  </div>
                </section>

                {/* Shipment History */}
<section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-3">
  <div>
    <h2 className="text-sm font-bold text-slate-950">
      Shipment history
    </h2>

    <p className="mt-1 text-xs text-slate-400">
      Timeline of recorded shipment events
    </p>
  </div>

  <div className="mt-8">
    {events && events.length > 0 ? (
      <div className="relative">
        <div className="absolute left-[7px] top-2 bottom-2 w-px bg-slate-200" />

        <div className="space-y-7">
          {events.map((event, index) => (
            <div key={event.id} className="relative flex gap-4">
              <div className="relative z-10 mt-1 flex size-4 shrink-0 items-center justify-center rounded-full bg-white">
                <div
                  className={`size-2.5 rounded-full ${
                    index === 0 ? "bg-blue-600" : "bg-slate-300"
                  }`}
                />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm font-semibold text-slate-900">
                    {formatStatus(event.status)}
                  </p>

                  <p className="text-xs text-slate-400">
                    {formatEventTime(event.created_at)}
                  </p>
                </div>

                {event.description && (
                  <p className="mt-1 text-sm leading-6 text-slate-500">
                    {event.description}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    ) : (
      <div className="rounded-xl border border-dashed border-slate-200 px-5 py-8 text-center">
        <p className="text-sm font-medium text-slate-700">
          No shipment history yet
        </p>

        <p className="mt-1 text-xs text-slate-400">
          Shipment events will appear here as the shipment moves through
          its workflow.
        </p>
      </div>
    )}
  </div>
</section>

                {/* Scheduling */}
                <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
                  <h2 className="text-sm font-bold text-slate-950">
                    Pickup schedule
                  </h2>

                  <div className="mt-5">
                    <p className="text-xs font-medium text-slate-400">
                      Scheduled pickup
                    </p>

                    <p className="mt-2 text-sm font-semibold text-slate-900">
                      {shipment.scheduled_pickup
                        ? new Date(
                            shipment.scheduled_pickup
                          ).toLocaleString("en-NG")
                        : "Not scheduled"}
                    </p>
                  </div>
                </section>

                {/* Record */}
                <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <h2 className="text-sm font-bold text-slate-950">
                    Shipment record
                  </h2>

                  <div className="mt-5 space-y-4">
                    <div>
                      <p className="text-xs font-medium text-slate-400">
                        Tracking number
                      </p>
                      <p className="mt-1 text-sm font-semibold text-slate-900">
                        {shipment.tracking_number}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-medium text-slate-400">
                        Status
                      </p>
                      <p className="mt-1 text-sm font-semibold text-slate-900">
                        {formatStatus(shipment.status)}
                      </p>
                    </div>
                  </div>
                </section>
              </div>
            </div>
          </main>

          <footer className="border-t border-slate-200 px-4 py-6 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-6xl">
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