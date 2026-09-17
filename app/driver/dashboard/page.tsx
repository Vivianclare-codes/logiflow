import { redirect } from "next/navigation";
import {
  ArrowRight,
  Clock3,
  MapPin,
  Package,
  Route,
  Truck,
} from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

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

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default async function DriverDashboardPage() {
  const supabase = await createClient();

  // 1. Get logged-in user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // 2. Get the user's profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role")
    .eq("id", user.id)
    .single();

  // 3. Make sure this is actually a driver
  if (!profile || profile.role !== "driver") {
    redirect("/dashboard");
  }

  // 4. Find the driver record connected to this profile
  const { data: driver, error: driverError } = await supabase
    .from("drivers")
    .select("id, full_name, status")
    .eq("profile_id", user.id)
    .single();

  if (driverError || !driver) {
    redirect("/login");
  }

  // 5. Get shipments assigned to this driver
  const { data: shipments, error: shipmentsError } = await supabase
    .from("shipments")
    .select(`
      id,
      tracking_number,
      pickup_address,
      destination_address,
      status,
      scheduled_pickup,
      created_at
    `)
    .eq("driver_id", driver.id)
    .order("created_at", { ascending: false });

  if (shipmentsError) {
    console.error(
      "Driver shipments error:",
      shipmentsError
    );
  }

  const driverShipments = shipments ?? [];

  // 6. Calculate real dashboard metrics
  const activeShipments = driverShipments.filter(
    (shipment) =>
      !["delivered", "cancelled"].includes(shipment.status)
  );

  const inTransitCount = driverShipments.filter(
    (shipment) => shipment.status === "in_transit"
  ).length;

  const outForDeliveryCount = driverShipments.filter(
    (shipment) => shipment.status === "out_for_delivery"
  ).length;

  const deliveredCount = driverShipments.filter(
    (shipment) => shipment.status === "delivered"
  ).length;

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        {/* Header */}
        <header className="flex flex-col gap-4 border-b border-slate-200 pb-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex size-9 items-center justify-center rounded-xl bg-blue-600 text-white">
                <Route className="size-5" />
              </div>

              <p className="text-sm font-bold text-slate-950">
                LogiFlow
              </p>
            </div>

            <p className="mt-4 text-sm font-medium text-slate-400">
              Driver workspace
            </p>

            <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
              Welcome, {driver.full_name}
            </h1>
          </div>

          <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3">
            <span
              className={`size-2.5 rounded-full ${
                driver.status === "available"
                  ? "bg-emerald-500"
                  : driver.status === "busy"
                    ? "bg-amber-500"
                    : "bg-slate-400"
              }`}
            />

            <div>
              <p className="text-xs font-medium text-slate-400">
                Driver status
              </p>

              <p className="text-sm font-semibold capitalize text-slate-900">
                {driver.status.replaceAll("_", " ")}
              </p>
            </div>
          </div>
        </header>

        {/* Metrics */}
        <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
                Active
              </p>

              <Package className="size-5 text-slate-400" />
            </div>

            <p className="mt-4 text-3xl font-bold text-slate-950">
              {activeShipments.length}
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Current assignments
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
                In transit
              </p>

              <Truck className="size-5 text-blue-500" />
            </div>

            <p className="mt-4 text-3xl font-bold text-slate-950">
              {inTransitCount}
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Shipments moving
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
                Out for delivery
              </p>

              <MapPin className="size-5 text-amber-500" />
            </div>

            <p className="mt-4 text-3xl font-bold text-slate-950">
              {outForDeliveryCount}
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Ready for delivery
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
                Completed
              </p>

              <Clock3 className="size-5 text-emerald-500" />
            </div>

            <p className="mt-4 text-3xl font-bold text-slate-950">
              {deliveredCount}
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Delivered shipments
            </p>
          </div>
        </section>

        {/* Shipments */}
        <section className="mt-6 rounded-2xl border border-slate-200 bg-white">
          <div className="border-b border-slate-100 px-5 py-5 sm:px-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-sm font-bold text-slate-950">
                  My shipments
                </h2>

                <p className="mt-1 text-xs text-slate-400">
                  Shipments currently assigned to you
                </p>
              </div>

              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                {driverShipments.length} total
              </span>
            </div>
          </div>

          {driverShipments.length > 0 ? (
            <>
              {/* Desktop table */}
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-100 text-left">
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-[0.12em] text-slate-400">
                        Shipment
                      </th>

                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-[0.12em] text-slate-400">
                        Route
                      </th>

                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-[0.12em] text-slate-400">
                        Status
                      </th>

                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-[0.12em] text-slate-400">
                        Pickup
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {driverShipments.map((shipment) => (
                      <tr
                        key={shipment.id}
                        className="border-b border-slate-100 last:border-0"
                      >
                        <td className="px-6 py-5">
                          <Link
  href={`/driver/shipments/${shipment.id}`}
  className="text-sm font-bold text-slate-950 transition hover:text-blue-600"
>
  {shipment.tracking_number}
</Link>

                          <p className="mt-1 text-xs text-slate-400">
                            Created {formatDate(shipment.created_at)}
                          </p>
                        </td>

                        <td className="px-6 py-5">
                          <div className="max-w-sm">
                            <p className="text-sm text-slate-700">
                              {shipment.pickup_address}
                            </p>

                            <div className="my-1 text-xs text-slate-400">
                              ↓
                            </div>

                            <p className="text-sm text-slate-700">
                              {shipment.destination_address}
                            </p>
                          </div>
                        </td>

                        <td className="px-6 py-5">
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${statusClasses(
                              shipment.status
                            )}`}
                          >
                            {formatStatus(shipment.status)}
                          </span>
                        </td>

                        <td className="px-6 py-5">
                          <p className="text-sm text-slate-700">
                            {shipment.scheduled_pickup
                              ? formatDate(
                                  shipment.scheduled_pickup
                                )
                              : "Not scheduled"}
                          </p>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <div className="divide-y divide-slate-100 md:hidden">
                {driverShipments.map((shipment) => (
                  <div
                    key={shipment.id}
                    className="p-5"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-bold text-slate-950">
                          {shipment.tracking_number}
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                          Created {formatDate(shipment.created_at)}
                        </p>
                      </div>

                      <span
                        className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold ${statusClasses(
                          shipment.status
                        )}`}
                      >
                        {formatStatus(shipment.status)}
                      </span>
                    </div>

                    <div className="mt-5 space-y-3">
                      <div>
                        <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">
                          Pickup
                        </p>

                        <p className="mt-1 text-sm text-slate-700">
                          {shipment.pickup_address}
                        </p>
                      </div>

                      <div>
                        <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">
                          Destination
                        </p>

                        <p className="mt-1 text-sm text-slate-700">
                          {shipment.destination_address}
                        </p>
                      </div>

                      <div>
                        <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">
                          Scheduled pickup
                        </p>

                        <p className="mt-1 text-sm text-slate-700">
                          {shipment.scheduled_pickup
                            ? formatDate(
                                shipment.scheduled_pickup
                              )
                            : "Not scheduled"}
                        </p>
                      </div>
                    </div>

                  <Link
  href={`/driver/shipments/${shipment.id}`}
  className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-blue-600"
>
  View shipment
  <ArrowRight className="size-4" />
</Link>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="px-6 py-16 text-center">
              <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                <Package className="size-6" />
              </div>

              <h3 className="mt-4 text-sm font-bold text-slate-950">
                No shipments assigned
              </h3>

              <p className="mx-auto mt-1 max-w-sm text-sm leading-6 text-slate-500">
                When a dispatcher assigns a shipment to you,
                it will appear here.
              </p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}