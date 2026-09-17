"use client";

import { useActionState } from "react";

import { completeShipmentDelivery } from "@/app/shipments/actions";

type ProofOfDeliveryFormProps = {
  shipmentId: string;
};

const initialState = {
  error: "",
  success: false,
  trackingNumber: "",
};

export function ProofOfDeliveryForm({
  shipmentId,
}: ProofOfDeliveryFormProps) {
  const [state, formAction, isPending] = useActionState(
    completeShipmentDelivery,
    initialState
  );

  return (
    <form action={formAction} className="space-y-5">
      <input
        type="hidden"
        name="shipment_id"
        value={shipmentId}
      />

      <div>
        <label
          htmlFor="recipient_name"
          className="text-sm font-semibold text-slate-700"
        >
          Recipient name
        </label>

        <input
          id="recipient_name"
          name="recipient_name"
          type="text"
          required
          placeholder="Enter recipient's name"
          className="mt-2 h-12 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
        />
      </div>

      <div>
        <label
          htmlFor="notes"
          className="text-sm font-semibold text-slate-700"
        >
          Delivery notes
        </label>

        <textarea
          id="notes"
          name="notes"
          rows={4}
          placeholder="Optional notes about the delivery"
          className="mt-2 w-full resize-none rounded-lg border border-slate-300 bg-white px-3 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
        />
      </div>

      <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
        <p className="text-xs leading-5 text-slate-500">
          Completing this form will mark the shipment as delivered and
          release the assigned driver and vehicle.
        </p>
      </div>

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
            {state.trackingNumber
              ? `${state.trackingNumber} has been marked as delivered.`
              : "Shipment has been marked as delivered."}
          </p>
        </div>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="inline-flex min-h-11 w-full items-center justify-center rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isPending ? "Completing delivery..." : "Complete delivery"}
      </button>
    </form>
  );
}