"use client";

import { useActionState } from "react";

import { assignShipmentResources } from "@/app/shipments/actions";

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

type AssignResourcesFormProps = {
  shipmentId: string;
  drivers: Driver[];
  vehicles: Vehicle[];
};

const initialState = {
  error: "",
  success: false,
};

export function AssignResourcesForm({
  shipmentId,
  drivers,
  vehicles,
}: AssignResourcesFormProps) {
  const [state, formAction, isPending] = useActionState(
    assignShipmentResources,
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
          htmlFor="driver_id"
          className="text-sm font-medium text-slate-700"
        >
          Driver
        </label>

        <select
          id="driver_id"
          name="driver_id"
          required
          defaultValue=""
          className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        >
          <option value="" disabled>
            Select a driver
          </option>

          {drivers.map((driver) => (
            <option key={driver.id} value={driver.id}>
              {driver.full_name} — {driver.phone}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label
          htmlFor="vehicle_id"
          className="text-sm font-medium text-slate-700"
        >
          Vehicle
        </label>

        <select
          id="vehicle_id"
          name="vehicle_id"
          required
          defaultValue=""
          className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        >
          <option value="" disabled>
            Select a vehicle
          </option>

          {vehicles.map((vehicle) => (
            <option key={vehicle.id} value={vehicle.id}>
              {vehicle.plate_number} — {vehicle.vehicle_type}
            </option>
          ))}
        </select>
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
            Driver and vehicle assigned successfully.
          </p>
        </div>
      )}

      <button
        type="submit"
        disabled={
          isPending ||
          drivers.length === 0 ||
          vehicles.length === 0
        }
        className="inline-flex min-h-11 items-center justify-center rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isPending ? "Assigning..." : "Assign resources"}
      </button>

      {drivers.length === 0 && (
        <p className="text-xs text-amber-600">
          No available drivers right now.
        </p>
      )}

      {vehicles.length === 0 && (
        <p className="text-xs text-amber-600">
          No available vehicles right now.
        </p>
      )}
    </form>
  );
}