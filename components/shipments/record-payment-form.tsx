"use client";

import { useActionState } from "react";

import { recordShipmentPayment } from "@/app/shipments/actions";

type RecordPaymentFormProps = {
  shipmentId: string;
  balance: number;
};

type PaymentActionState = {
  error?: string;
  success?: boolean;
  trackingNumber?: string;
};

const initialState: PaymentActionState = {
  error: "",
  success: false,
};

export function RecordPaymentForm({
  shipmentId,
  balance,
}: RecordPaymentFormProps) {
  const [state, formAction, isPending] = useActionState(
    recordShipmentPayment,
    initialState
  );

  return (
    <form action={formAction} className="space-y-4">
      <input
        type="hidden"
        name="shipment_id"
        value={shipmentId}
      />

      <div>
        <label
          htmlFor="amount"
          className="text-sm font-semibold text-slate-700"
        >
          Payment amount
        </label>

        <div className="relative mt-2">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-400">
            ₦
          </span>

          <input
            id="amount"
            name="amount"
            type="number"
            min="1"
            max={balance}
            step="0.01"
            required
            placeholder="Enter amount"
            className="h-12 w-full rounded-lg border border-slate-300 bg-white pl-8 pr-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
          />
        </div>

        <p className="mt-2 text-xs text-slate-500">
          Remaining balance: ₦
          {balance.toLocaleString("en-NG")}
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
            Payment recorded successfully.
          </p>
        </div>
      )}

      <button
        type="submit"
        disabled={isPending || balance <= 0}
        className="inline-flex min-h-11 w-full items-center justify-center rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isPending ? "Recording..." : "Record payment"}
      </button>
    </form>
  );
}