"use client";

import { useState } from "react";

import { DeleteVehicleButton } from "@/components/vehicles/delete-vehicle-button";
import { EditVehicleForm } from "@/components/vehicles/edit-vehicle-form";

type Vehicle = {
  id: string;
  plate_number: string;
  vehicle_type: string;
  status: string;
};

function formatStatus(status: string) {
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

function statusClasses(status: string) {
  switch (status) {
    case "available":
      return "bg-emerald-50 text-emerald-700";

    case "in_use":
      return "bg-blue-50 text-blue-700";

    case "maintenance":
      return "bg-amber-50 text-amber-700";

    default:
      return "bg-slate-100 text-slate-600";
  }
}

export function VehicleMobileCard({
  vehicle,
}: {
  vehicle: Vehicle;
}) {
  const [editing, setEditing] = useState(false);

  if (editing) {
    return (
      <div className="border-b border-slate-100 p-5">
        <EditVehicleForm
          vehicle={vehicle}
          onCancel={() => setEditing(false)}
        />
      </div>
    );
  }

  return (
    <div className="border-b border-slate-100 p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-bold text-slate-900">
            {vehicle.plate_number}
          </p>

          <p className="mt-1 text-xs text-slate-500">
            {vehicle.vehicle_type}
          </p>
        </div>

        <span
          className={`inline-flex shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold ${statusClasses(
            vehicle.status
          )}`}
        >
          {formatStatus(vehicle.status)}
        </span>
      </div>

      <div className="mt-4 flex justify-end gap-2">
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-blue-200 hover:text-blue-700"
        >
          Edit
        </button>

        <DeleteVehicleButton
          vehicleId={vehicle.id}
        />
      </div>
    </div>
  );
}