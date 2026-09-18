"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";

import { updateShipmentAssignment } from "@/app/shipments/actions";

type Driver = {
  id: string;
  full_name: string;
  phone: string;
  status: string;
};

type Vehicle = {
  id: string;
  plate_number: string;
  vehicle_type: string;
  status: string;
};

type EditAssignmentFormProps = {
  shipmentId: string;
  currentDriverId: string | null;
  currentVehicleId: string | null;
  drivers: Driver[];
  vehicles: Vehicle[];
};

type AssignmentState = {
  error?: string;
  success?: boolean;
};

const initialState: AssignmentState = {};

function formatDriverStatus(status: string) {
  switch (status) {
    case "available":
      return "Available";

    case "busy":
      return "Busy";

    case "off_duty":
      return "Off duty";

    default:
      return status;
  }
}

function formatVehicleStatus(status: string) {
  switch (status) {
    case "available":
      return "Available";

    case "in_use":
      return "In use";

    case "maintenance":
      return "Maintenance";

    default:
      return status;
  }
}

export function EditAssignmentForm({
  shipmentId,
  currentDriverId,
  currentVehicleId,
  drivers,
  vehicles,
}: EditAssignmentFormProps) {
  const router = useRouter();

  const [state, formAction, pending] = useActionState(
    updateShipmentAssignment,
    initialState
  );

  useEffect(() => {
    if (state.success) {
      router.refresh();
    }
  }, [state.success, router]);

  return (
    <form action={formAction} className="mt-5 space-y-5">
      <input
        type="hidden"
        name="shipment_id"
        value={shipmentId}
      />

      <div>
        <label
          htmlFor="edit-driver"
          className="text-xs font-semibold text-slate-600"
        >
          Driver
        </label>

        <select
          id="edit-driver"
          name="driver_id"
          defaultValue={currentDriverId ?? ""}
          disabled={pending}
          className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-50"
          required
        >
          <option value="">
            Select driver
          </option>

          {drivers.map((driver) => {
            const isCurrent =
              driver.id === currentDriverId;

            const unavailable =
              driver.status !== "available" &&
              !isCurrent;

            return (
              <option
                key={driver.id}
                value={driver.id}
                disabled={unavailable}
              >
                {driver.full_name}
                {isCurrent
                  ? " — Current"
                  : ` — ${formatDriverStatus(driver.status)}`}
              </option>
            );
          })}
        </select>

        <p className="mt-2 text-xs text-slate-400">
          Only available drivers can be selected as replacements.
        </p>
      </div>

      <div>
        <label
          htmlFor="edit-vehicle"
          className="text-xs font-semibold text-slate-600"
        >
          Vehicle
        </label>

        <select
          id="edit-vehicle"
          name="vehicle_id"
          defaultValue={currentVehicleId ?? ""}
          disabled={pending}
          className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-50"
          required
        >
          <option value="">
            Select vehicle
          </option>

          {vehicles.map((vehicle) => {
            const isCurrent =
              vehicle.id === currentVehicleId;

            const unavailable =
              vehicle.status !== "available" &&
              !isCurrent;

            return (
              <option
                key={vehicle.id}
                value={vehicle.id}
                disabled={unavailable}
              >
                {vehicle.plate_number} —{" "}
                {vehicle.vehicle_type}
                {isCurrent
                  ? " — Current"
                  : ` — ${formatVehicleStatus(
                      vehicle.status
                    )}`}
              </option>
            );
          })}
        </select>

        <p className="mt-2 text-xs text-slate-400">
          Only available vehicles can be selected as replacements.
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
            Assignment updated successfully.
          </p>
        </div>
      )}

      <button
        type="submit"
        disabled={pending}
        className="inline-flex min-h-11 items-center justify-center rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending
          ? "Updating assignment..."
          : "Update assignment"}
      </button>
    </form>
  );
}