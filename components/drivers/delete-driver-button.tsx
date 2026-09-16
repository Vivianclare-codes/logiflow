"use client";

import { useActionState } from "react";

import { deleteDriver } from "@/app/drivers/actions";
import { Button } from "@/components/ui/button";

export function DeleteDriverButton({
  driverId,
}: {
  driverId: string;
}) {
  const [state, formAction, pending] = useActionState(
    deleteDriver,
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
            "Are you sure you want to delete this driver?"
          );

          if (!confirmed) {
            event.preventDefault();
          }
        }}
      >
        <input
          type="hidden"
          name="id"
          value={driverId}
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