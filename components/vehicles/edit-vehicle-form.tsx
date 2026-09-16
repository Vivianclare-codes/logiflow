"use client";

import { useActionState, useState } from "react";

import { updateVehicle } from "@/app/vehicles/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type EditVehicleFormProps = {
  vehicle: {
    id: string;
    plate_number: string;
    vehicle_type: string;
    status: string;
  };
};

export function EditVehicleForm({
  vehicle,
}: EditVehicleFormProps) {
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

  return (
    <form
      action={formAction}
      className="flex max-w-xl flex-col gap-5"
    >
      <input
        type="hidden"
        name="id"
        value={vehicle.id}
      />

      <div className="flex flex-col gap-2">
        <Label htmlFor="plate_number">
          Plate number
        </Label>

        <Input
          id="plate_number"
          name="plate_number"
          value={plateNumber}
          onChange={(event) =>
            setPlateNumber(event.target.value)
          }
          required
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="vehicle_type">
          Vehicle type
        </Label>

        <Input
          id="vehicle_type"
          name="vehicle_type"
          value={vehicleType}
          onChange={(event) =>
            setVehicleType(event.target.value)
          }
          required
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="status">
          Status
        </Label>

        <select
          id="status"
          name="status"
          value={status}
          onChange={(event) =>
            setStatus(event.target.value)
          }
          className="rounded-md border bg-background px-3 py-2 text-sm"
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

      {state.success && (
        <p className="text-sm text-green-600">
          Vehicle updated successfully.
        </p>
      )}

      <Button
        type="submit"
        className="w-fit"
        disabled={pending}
      >
        {pending ? "Saving..." : "Save changes"}
      </Button>
    </form>
  );
}