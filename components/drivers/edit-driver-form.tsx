"use client";

import { useActionState, useState } from "react";

import { updateDriver } from "@/app/drivers/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type EditDriverFormProps = {
  driver: {
    id: string;
    full_name: string;
    phone: string;
    status: string;
  };
};

export function EditDriverForm({
  driver,
}: EditDriverFormProps) {
  const [state, formAction, pending] = useActionState(
    updateDriver,
    {
      error: undefined,
      success: false,
    }
  );

  const [fullName, setFullName] = useState(
    driver.full_name
  );

  const [phone, setPhone] = useState(
    driver.phone
  );

  const [status, setStatus] = useState(
    driver.status
  );

  return (
    <form
      action={formAction}
      className="flex max-w-xl flex-col gap-5"
    >
      <input
        type="hidden"
        name="id"
        value={driver.id}
      />

      <div className="flex flex-col gap-2">
        <Label htmlFor="full_name">
          Driver name
        </Label>

        <Input
          id="full_name"
          name="full_name"
          value={fullName}
          onChange={(event) =>
            setFullName(event.target.value)
          }
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
          value={phone}
          onChange={(event) =>
            setPhone(event.target.value)
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
          Driver updated successfully.
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