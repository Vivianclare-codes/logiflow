"use client";

import { useActionState } from "react";

import { createVehicle } from "@/app/vehicles/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function VehicleForm() {
  const [state, formAction, pending] = useActionState(
    createVehicle,
    {
      error: undefined,
      success: false,
    }
  );

  return (
    <form
      action={formAction}
      className="flex max-w-xl flex-col gap-5"
    >
      <div className="flex flex-col gap-2">
        <Label htmlFor="plate_number">
          Plate number
        </Label>

        <Input
          id="plate_number"
          name="plate_number"
          placeholder="e.g. RSH-482-KD"
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
          placeholder="e.g. Van"
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
          defaultValue="available"
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
          Vehicle added successfully.
        </p>
      )}

      <Button
        type="submit"
        className="w-fit"
        disabled={pending}
      >
        {pending ? "Adding..." : "Add vehicle"}
      </Button>
    </form>
  );
}