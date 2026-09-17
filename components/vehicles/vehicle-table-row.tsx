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

export function VehicleTableRow({
  vehicle,
}: {
  vehicle: Vehicle;
}) {
  const [editing, setEditing] = useState(false);

  if (editing) {
    return (
      <tr>
        <td
          colSpan={4}
          className="px-6 py-5"
        >
          <EditVehicleForm
            vehicle={vehicle}
            onCancel={() => setEditing(false)}
          />
        </td>
      </tr>
    );
  }

  return (
    <tr className="transition hover:bg-slate-50/60">
      <td className="px-6 py-4">
        <p className="text-sm font-bold text-slate-900">
          {vehicle.plate_number}
        </p>
      </td>

      <td className="px-6 py-4">
        <p className="text-sm text-slate-600">
          {vehicle.vehicle_type}
        </p>
      </td>

      <td className="px-6 py-4">
        <span
          className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold ${statusClasses(
            vehicle.status
          )}`}
        >
          {formatStatus(vehicle.status)}
        </span>
      </td>

      <td className="px-6 py-4">
        <div className="flex justify-end gap-2">
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
      </td>
    </tr>
  );
}