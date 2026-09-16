"use client";

import { useActionState } from "react";

import { createDriver } from "@/app/drivers/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function DriverForm() {
  const [state, formAction, pending] = useActionState(
    createDriver,
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
        <Label htmlFor="full_name">
          Driver name
        </Label>

        <Input
          id="full_name"
          name="full_name"
          placeholder="e.g. John Doe"
          required
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="phone">
          Phone number
        </Label>

        <Input
          id="phone"
          name="phone"
          type="tel"
          placeholder="e.g. 08012345678"
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

          <option value="busy">
            Busy
          </option>

          <option value="off_duty">
            Off duty
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
          Driver added successfully.
        </p>
      )}

      <Button
        type="submit"
        className="w-fit"
        disabled={pending}
      >
        {pending ? "Adding..." : "Add driver"}
      </Button>
    </form>
  );
}
