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
  const [state, formAction, pending] =
    useActionState(
      updateDriver,
      {
        error: undefined,
        success: false,
      }
    );

  const [fullName, setFullName] =
    useState(driver.full_name);

  const [phone, setPhone] = useState(
    driver.phone
  );

  const [status, setStatus] = useState(
    driver.status
  );

  return (
    <form
      action={formAction}
      className="max-w-2xl space-y-5"
    >
      <input
        type="hidden"
        name="id"
        value={driver.id}
      />

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor="full_name">
            Driver name
          </Label>

          <Input
            id="full_name"
            name="full_name"
            value={fullName}
            onChange={(event) =>
              setFullName(
                event.target.value
              )
            }
            className="h-10"
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
              setPhone(
                event.target.value
              )
            }
            className="h-10"
            required
          />
        </div>
      </div>

      <div className="flex max-w-sm flex-col gap-2">
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
          className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
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
        disabled={pending}
      >
        {pending
          ? "Saving..."
          : "Save changes"}
      </Button>
    </form>
  );
}