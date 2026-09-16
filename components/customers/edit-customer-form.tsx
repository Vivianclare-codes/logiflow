"use client";

import { useActionState, useState } from "react";

import { updateCustomer } from "@/app/customers/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type EditCustomerFormProps = {
  customer: {
    id: string;
    name: string;
    phone: string;
    email: string | null;
    address: string | null;
  };
};

export function EditCustomerForm({
  customer,
}: EditCustomerFormProps) {
  const [state, formAction, pending] = useActionState(
    updateCustomer,
    {
      error: undefined,
      success: false,
    }
  );

  const [name, setName] = useState(customer.name);
  const [phone, setPhone] = useState(customer.phone);
  const [email, setEmail] = useState(customer.email ?? "");
  const [address, setAddress] = useState(customer.address ?? "");

  return (
    <form
      action={formAction}
      className="flex max-w-xl flex-col gap-5"
    >
      <input
        type="hidden"
        name="id"
        value={customer.id}
      />

      <div className="flex flex-col gap-2">
        <Label htmlFor="name">Customer name</Label>
        <Input
          id="name"
          name="name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          required
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="phone">Phone number</Label>
        <Input
          id="phone"
          name="phone"
          type="tel"
          value={phone}
          onChange={(event) => setPhone(event.target.value)}
          required
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="email">Email address</Label>
        <Input
          id="email"
          name="email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="address">Address</Label>
        <Input
          id="address"
          name="address"
          value={address}
          onChange={(event) => setAddress(event.target.value)}
        />
      </div>

      {state.error && (
        <p className="text-sm text-destructive">
          {state.error}
        </p>
      )}

      {state.success && (
        <p className="text-sm text-green-600">
          Customer updated successfully.
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