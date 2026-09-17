"use client";

import { useActionState, useEffect, useState } from "react";

import { updateVehicle } from "@/app/vehicles/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Vehicle = {
  id: string;
  plate_number: string;
  vehicle_type: string;
  status: string;
};

export function EditVehicleForm({
  vehicle,
  onCancel,
}: {
  vehicle: Vehicle;
  onCancel: () => void;
}) {
  const [state, formAction, pending] = useActionState(
    updateVehicle,
    {
      error: undefined,
      success: false,
    }
  );

  const [plateNumber, setPlateNumber] = useState(
    vehicle.plate_number
  );

  const [vehicleType, setVehicleType] = useState(
    vehicle.vehicle_type
  );

  const [status, setStatus] = useState(
    vehicle.status
  );

  useEffect(() => {
    if (state.success) {
      onCancel();
    }
  }, [state.success, onCancel]);

  return (
    <form
      action={formAction}
      className="space-y-5 rounded-xl border border-blue-100 bg-blue-50/40 p-5"
    >
      <input
        type="hidden"
        name="id"
        value={vehicle.id}
      />

      <div>
        <p className="text-sm font-bold text-slate-900">
          Edit vehicle
        </p>

        <p className="mt-1 text-xs text-slate-500">
          Update this vehicle's information.
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor={`plate-${vehicle.id}`}>
            Plate number
          </Label>

          <Input
            id={`plate-${vehicle.id}`}
            name="plate_number"
            value={plateNumber}
            onChange={(event) =>
              setPlateNumber(event.target.value)
            }
            required
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor={`type-${vehicle.id}`}>
            Vehicle type
          </Label>

          <Input
            id={`type-${vehicle.id}`}
            name="vehicle_type"
            value={vehicleType}
            onChange={(event) =>
              setVehicleType(event.target.value)
            }
            required
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor={`status-${vehicle.id}`}>
          Status
        </Label>

        <select
          id={`status-${vehicle.id}`}
          name="status"
          value={status}
          onChange={(event) =>
            setStatus(event.target.value)
          }
          className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        >
          <option value="available">
            Available
          </option>

          <option value="in_use">
            In use
          </option>

          <option value="maintenance">
            Maintenance
          </option>
        </select>
      </div>

      {state.error && (
        <p className="text-sm text-destructive">
          {state.error}
        </p>
      )}

      <div className="flex gap-2">
        <Button
          type="submit"
          disabled={pending}
        >
          {pending ? "Saving..." : "Save changes"}
        </Button>

        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={pending}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}