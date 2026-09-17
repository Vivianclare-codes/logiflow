"use client";

import { useActionState } from "react";

import { updateShipmentStatus } from "@/app/shipments/actions";

type UpdateStatusFormProps = {
  shipmentId: string;
  currentStatus: string;
};

type ActionState = {
  error?: string;
  success?: boolean;
  trackingNumber?: string;
};

const initialState: ActionState = {
  error: "",
  success: false,
};

const workflow = [
  {
    status: "pending",
    label: "Pending",
  },
  {
    status: "pickup_scheduled",
    label: "Pickup scheduled",
  },
  {
    status: "picked_up",
    label: "Picked up",
  },
  {
    status: "in_transit",
    label: "In transit",
  },
  {
    status: "out_for_delivery",
    label: "Out for delivery",
  },
  {
    status: "delivered",
    label: "Delivered",
  },
];

function getNextStatus(currentStatus: string) {
  const currentIndex = workflow.findIndex(
    (step) => step.status === currentStatus
  );

  if (currentIndex === -1 || currentIndex === workflow.length - 1) {
    return null;
  }

  return workflow[currentIndex + 1];
}

export function UpdateStatusForm({
  shipmentId,
  currentStatus,
}: UpdateStatusFormProps) {
  const [state, formAction, isPending] = useActionState(
    updateShipmentStatus,
    initialState
  );

  const currentIndex = workflow.findIndex(
    (step) => step.status === currentStatus
  );

  const nextStep = getNextStatus(currentStatus);

  return (
    <div className="space-y-8">
      {/* Workflow */}
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
          Shipment progress
        </p>

        <div className="mt-6">
          {workflow.map((step, index) => {
            const isCurrent = step.status === currentStatus;
            const isComplete = index < currentIndex;
            const isLast = index === workflow.length - 1;

            return (
              <div key={step.status} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div
                    className={`flex size-5 shrink-0 items-center justify-center rounded-full border-2 ${
                      isCurrent
                        ? "border-blue-600 bg-blue-600"
                        : isComplete
                          ? "border-blue-600 bg-blue-600"
                          : "border-slate-200 bg-white"
                    }`}
                  >
                    {(isCurrent || isComplete) && (
                      <div className="size-1.5 rounded-full bg-white" />
                    )}
                  </div>

                  {!isLast && (
                    <div
                      className={`h-8 w-px ${
                        index < currentIndex
                          ? "bg-blue-500"
                          : "bg-slate-200"
                      }`}
                    />
                  )}
                </div>

                <div className="-mt-0.5 pb-8">
                  <p
                    className={`text-sm font-semibold ${
                      isCurrent
                        ? "text-slate-950"
                        : isComplete
                          ? "text-slate-700"
                          : "text-slate-400"
                    }`}
                  >
                    {step.label}
                  </p>

                  {isCurrent && (
                    <p className="mt-1 text-xs text-blue-600">
                      Current status
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Next Action */}
      {nextStep && currentStatus !== "out_for_delivery" ? (
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
            Next action
          </p>

          <p className="mt-2 text-sm font-semibold text-slate-950">
            Move shipment to {nextStep.label}
          </p>

          <form action={formAction} className="mt-5 space-y-4">
            <input type="hidden" name="shipment_id" value={shipmentId} />

            <input
              type="hidden"
              name="new_status"
              value={nextStep.status}
            />

            {nextStep.status === "pickup_scheduled" && (
              <div>
                <label
                  htmlFor="scheduled_pickup"
                  className="text-sm font-medium text-slate-700"
                >
                  Pickup date and time
                </label>

               <input
  id="scheduled_pickup"
  name="scheduled_pickup"
  type="datetime-local"
  required
  className="mt-2 h-12 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm font-medium text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
  style={{ colorScheme: "light" }}
/>
              </div>
            )}

            <button
              type="submit"
              disabled={isPending}
              className="inline-flex min-h-11 items-center justify-center rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isPending
                ? "Updating..."
                : `Move to ${nextStep.label}`}
            </button>

            {state?.error && (
              <div className="rounded-lg border border-red-100 bg-red-50 px-4 py-3">
                <p className="text-sm font-medium text-red-700">
                  {state.error}
                </p>
              </div>
            )}

            {state?.success && (
              <div className="rounded-lg border border-emerald-100 bg-emerald-50 px-4 py-3">
                <p className="text-sm font-medium text-emerald-700">
                  Shipment status updated successfully.
                </p>
              </div>
            )}
          </form>
        </div>
      ) : currentStatus === "out_for_delivery" ? (
        <div className="rounded-xl border border-amber-100 bg-amber-50 p-5">
          <p className="text-sm font-semibold text-amber-900">
            Delivery completion requires proof of delivery.
          </p>

          <p className="mt-1 text-sm text-amber-700">
            The delivery action will become available when the proof-of-delivery
            feature is implemented.
          </p>
        </div>
      ) : (
        <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-5">
          <p className="text-sm font-semibold text-emerald-800">
            Shipment workflow complete.
          </p>
        </div>
      )}
    </div>
  );
}