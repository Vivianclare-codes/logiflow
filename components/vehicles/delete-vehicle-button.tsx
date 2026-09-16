"use client";

import { useActionState } from "react";

import { deleteVehicle } from "@/app/vehicles/actions";
import { Button } from "@/components/ui/button";

export function DeleteVehicleButton({
  vehicleId,
}: {
  vehicleId: string;
}) {
  const [state, formAction, pending] = useActionState(
    deleteVehicle,
    {
      error: undefined,
      success: false,
    }
  );

  return (
    <div>
      <form
        action={formAction}
        onSubmit={(event) => {
          const confirmed = window.confirm(
            "Are you sure you want to delete this vehicle?"
          );

          if (!confirmed) {
            event.preventDefault();
          }
        }}
      >
        <input
          type="hidden"
          name="id"
          value={vehicleId}
        />

        <Button
          type="submit"
          variant="destructive"
          disabled={pending}
        >
          {pending ? "Deleting..." : "Delete"}
        </Button>
      </form>

      {state.error && (
        <p className="mt-2 text-sm text-destructive">
          {state.error}
        </p>
      )}
    </div>
  );
}