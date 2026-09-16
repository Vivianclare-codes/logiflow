"use client";

import { useActionState } from "react";
import { createCustomer } from "@/app/customers/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function CustomerForm() {
    const [state, formAction, pending] = useActionState(
  createCustomer,
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
        <Label htmlFor="name">Customer name</Label>
        <Input
          id="name"
          name="name"
          placeholder="e.g. John Doe"
          required
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="phone">Phone number</Label>
        <Input
          id="phone"
          name="phone"
          type="tel"
          placeholder="e.g. 08012345678"
          required
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="email">Email address</Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="e.g. john@example.com"
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="address">Address</Label>
        <Input
          id="address"
          name="address"
          placeholder="Customer delivery address"
        />

        {state.error && (
  <p className="text-sm text-destructive">
    {state.error}
  </p>
)}

{state.success && (
  <p className="text-sm text-green-600">
    Customer added successfully.
  </p>
)}
      </div>

      <Button type="submit" className="w-fit" disabled={pending}>
  {pending ? "Adding..." : "Add customer"}
</Button>
    </form>
  );
}