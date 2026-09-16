"use client";

import { useActionState } from "react";

import { deleteCustomer } from "@/app/customers/actions";
import { Button } from "@/components/ui/button";

export function DeleteCustomerButton({
  customerId,
}: {
  customerId: string;
}) {
  const [state, formAction, pending] = useActionState(
    deleteCustomer,
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
            "Are you sure you want to delete this customer?"
          );

          if (!confirmed) {
            event.preventDefault();
          }
        }}
      >
        <input
          type="hidden"
          name="id"
          value={customerId}
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