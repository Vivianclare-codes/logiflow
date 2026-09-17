"use client";

import { useActionState } from "react";

import { updateShipmentStatus } from "@/app/shipments/actions";

type DriverStatusFormProps = {
  shipmentId: string;
  currentStatus: string;
};

const initialState = {
  error: "",
  success: false,
};

const driverNextStatus: Record<string, string | null> = {
  pickup_scheduled: "picked_up",
  picked_up: "in_transit",
  in_transit: "out_for_delivery",
  out_for_delivery: null,
  pending: null,
  delivered: null,
  cancelled: null,
};

function formatStatus(status: string) {
  switch (status) {
    case "picked_up":
      return "Picked up";
    case "in_transit":
      return "In transit";
    case "out_for_delivery":
      return "Out for delivery";
    default:
      return status;
  }
}

export function DriverStatusForm({
  shipmentId,
  currentStatus,
}: DriverStatusFormProps) {
  const [state, formAction, isPending] = useActionState(
    updateShipmentStatus,
    initialState
  );

  const nextStatus = driverNextStatus[currentStatus];

  if (currentStatus === "pending") {
    return (
      <div className="rounded-xl border border-amber-100 bg-amber-50 p-4">
        <p className="text-sm font-semibold text-amber-900">
          Waiting for pickup to be scheduled.
        </p>

        <p className="mt-1 text-sm text-amber-700">
          A dispatcher must schedule this shipment before you can
          pick it up.
        </p>
      </div>
    );
  }

  if (currentStatus === "out_for_delivery") {
    return (
      <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
        <p className="text-sm font-semibold text-blue-900">
          Shipment is out for delivery.
        </p>

        <p className="mt-1 text-sm text-blue-700">
          Proof of delivery will be required to complete this shipment.
        </p>
      </div>
    );
  }

  if (!nextStatus) {
    return null;
  }

  return (
    <form action={formAction} className="space-y-4">
      <input
        type="hidden"
        name="shipment_id"
        value={shipmentId}
      />

      <input
        type="hidden"
        name="new_status"
        value={nextStatus}
      />

      <div>
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
          Next action
        </p>

        <p className="mt-2 text-sm font-semibold text-slate-950">
          Move shipment to {formatStatus(nextStatus)}
        </p>
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="inline-flex min-h-11 items-center justify-center rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isPending
          ? "Updating..."
          : `Mark ${formatStatus(nextStatus)}`}
      </button>

      {state.error && (
        <div className="rounded-lg border border-red-100 bg-red-50 px-4 py-3">
          <p className="text-sm font-medium text-red-700">
            {state.error}
          </p>
        </div>
      )}

      {state.success && (
        <div className="rounded-lg border border-emerald-100 bg-emerald-50 px-4 py-3">
          <p className="text-sm font-medium text-emerald-700">
            Shipment status updated successfully.
          </p>
        </div>
      )}
    </form>
  );
}