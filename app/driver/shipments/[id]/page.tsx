import Link from "next/link";
import {
  ArrowLeft,
  Clock3,
  MapPin,
  Package,
  Route,
  Truck,
} from "lucide-react";
import { notFound, redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { DriverStatusForm } from "@/components/shipments/driver-status-form";
import { ProofOfDeliveryForm } from "@/components/shipments/proof-of-delivery-form";

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

function formatEventTime(value: string) {
  return new Date(value).toLocaleString("en-NG", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function formatDate(value: string) {
  return new Date(value).toLocaleString("en-NG", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default async function DriverShipmentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const supabase = await createClient();

  // 1. Get logged-in user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // 2. Verify this is a driver
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "driver") {
    redirect("/dashboard");
  }

  // 3. Get this driver's record
  const { data: driver } = await supabase
    .from("drivers")
    .select("id, full_name, status")
    .eq("profile_id", user.id)
    .single();

  if (!driver) {
    redirect("/login");
  }

  // 4. Get this driver's shipment
  const { data: shipment, error } = await supabase
    .from("shipments")
    .select(`
      id,
      tracking_number,
      driver_id,
      vehicle_id,
      pickup_address,
      destination_address,
      scheduled_pickup,
      status,
      created_at
    `)
    .eq("id", id)
    .eq("driver_id", driver.id)
    .single();

  if (error || !shipment) {
    notFound();
  }

  // 5. Get shipment events
  const { data: events, error: eventsError } = await supabase
    .from("shipment_events")
    .select(`
      id,
      status,
      description,
      created_at
    `)
    .eq("shipment_id", shipment.id)
    .order("created_at", { ascending: false });

  if (eventsError) {
    console.error("Driver shipment events error:", eventsError);
  }

  // 6. Get assigned vehicle
  const { data: vehicle } = shipment.vehicle_id
    ? await supabase
        .from("vehicles")
        .select("plate_number, vehicle_type")
        .eq("id", shipment.vehicle_id)
        .single()
    : { data: null };

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        {/* Header */}
        <header className="flex items-center justify-between border-b border-slate-200 pb-5">
          <Link
            href="/driver/dashboard"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-slate-950"
          >
            <ArrowLeft className="size-4" />
            Back to dashboard
          </Link>

          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-lg bg-blue-600 text-white">
              <Route className="size-4" />
            </div>

            <span className="text-sm font-bold text-slate-950">
              LogiFlow
            </span>
          </div>
        </header>

        {/* Shipment heading */}
        <div className="mt-8">
          <p className="text-sm font-medium text-slate-400">
            My shipment
          </p>

          <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h1 className="text-3xl font-bold tracking-tight text-slate-950">
              {shipment.tracking_number}
            </h1>

            <span
              className={`w-fit rounded-full px-3 py-1 text-xs font-bold ${statusClasses(
                shipment.status
              )}`}
            >
              {formatStatus(shipment.status)}
            </span>
          </div>
        </div>

        {/* Route */}
        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <MapPin className="size-5" />
            </div>

            <div>
              <h2 className="text-sm font-bold text-slate-950">
                Delivery route
              </h2>

              <p className="text-xs text-slate-400">
                Pickup and destination
              </p>
            </div>
          </div>

          <div className="mt-7 space-y-6">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
                Pickup
              </p>

              <p className="mt-2 text-sm font-medium leading-6 text-slate-800">
                {shipment.pickup_address}
              </p>
            </div>

            <div className="h-px bg-slate-100" />

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

        {/* Assignment */}
        <section className="mt-6 grid gap-6 sm:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                <Truck className="size-5" />
              </div>

              <div>
                <h2 className="text-sm font-bold text-slate-950">
                  Vehicle
                </h2>

                <p className="text-xs text-slate-400">
                  Assigned vehicle
                </p>
              </div>
            </div>

            <div className="mt-5">
              <p className="text-sm font-bold text-slate-900">
                {vehicle?.plate_number ?? "Not assigned"}
              </p>

              {vehicle?.vehicle_type && (
                <p className="mt-1 text-sm text-slate-500">
                  {vehicle.vehicle_type}
                </p>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                <Clock3 className="size-5" />
              </div>

              <div>
                <h2 className="text-sm font-bold text-slate-950">
                  Pickup
                </h2>

                <p className="text-xs text-slate-400">
                  Scheduled time
                </p>
              </div>
            </div>

            <div className="mt-5">
              <p className="text-sm font-bold text-slate-900">
                {shipment.scheduled_pickup
                  ? formatDate(shipment.scheduled_pickup)
                  : "Not scheduled"}
              </p>
            </div>
          </div>
        </section>

        {/* Shipment Workflow */}
        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div>
            <h2 className="text-sm font-bold text-slate-950">
              Shipment workflow
            </h2>

            <p className="mt-1 text-xs text-slate-400">
              Update your assigned shipment as it moves through the
              delivery process.
            </p>
          </div>

          <div className="mt-6">
            <DriverStatusForm
              shipmentId={shipment.id}
              currentStatus={shipment.status}
            />
          </div>
        </section>

        {/* Proof of Delivery */}
        {shipment.status === "out_for_delivery" && (
          <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div>
              <h2 className="text-sm font-bold text-slate-950">
                Proof of delivery
              </h2>

              <p className="mt-1 text-xs text-slate-400">
                Record the recipient before completing this delivery.
              </p>
            </div>

            <div className="mt-6">
              <ProofOfDeliveryForm shipmentId={shipment.id} />
            </div>
          </section>
        )}

        {/* History */}
        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div>
            <h2 className="text-sm font-bold text-slate-950">
              Shipment history
            </h2>

            <p className="mt-1 text-xs text-slate-400">
              Recorded events for this shipment
            </p>
          </div>

          <div className="mt-7">
            {events && events.length > 0 ? (
              <div className="relative">
                <div className="absolute bottom-2 left-[7px] top-2 w-px bg-slate-200" />

                <div className="space-y-7">
                  {events.map((event, index) => (
                    <div
                      key={event.id}
                      className="relative flex gap-4"
                    >
                      <div className="relative z-10 mt-1 flex size-4 shrink-0 items-center justify-center rounded-full bg-white">
                        <div
                          className={`size-2.5 rounded-full ${
                            index === 0
                              ? "bg-blue-600"
                              : "bg-slate-300"
                          }`}
                        />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-col gap-1">
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
                  Shipment events will appear here as the shipment
                  moves through its workflow.
                </p>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}