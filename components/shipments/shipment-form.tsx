"use client";

import { useActionState } from "react";

import { createShipment } from "@/app/shipments/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Customer = {
  id: string;
  name: string;
  phone: string;
};

type ShipmentFormProps = {
  customers: Customer[];
};

export function ShipmentForm({
  customers,
}: ShipmentFormProps) {
  const [state, formAction, pending] =
    useActionState(
      createShipment,
      {
        error: undefined,
        success: false,
        trackingNumber: undefined,
      }
    );

  return (
    <form
      action={formAction}
      className="max-w-3xl space-y-6"
    >
      {/* Customer */}
      <div className="flex flex-col gap-2">
        <Label htmlFor="customer_id">
          Customer
        </Label>

        <select
          id="customer_id"
          name="customer_id"
          defaultValue=""
          className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          required
        >
          <option value="" disabled>
            Select a customer
          </option>

          {customers.map((customer) => (
            <option
              key={customer.id}
              value={customer.id}
            >
              {customer.name} —{" "}
              {customer.phone}
            </option>
          ))}
        </select>

        {customers.length === 0 && (
          <p className="text-xs text-amber-600">
            No customers exist yet. Create a
            customer before creating a shipment.
          </p>
        )}
      </div>

      {/* Addresses */}
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor="pickup_address">
            Pickup address
          </Label>

          <Input
            id="pickup_address"
            name="pickup_address"
            placeholder="e.g. Port Harcourt, Rivers State"
            className="h-10"
            required
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="destination_address">
            Destination
          </Label>

          <Input
            id="destination_address"
            name="destination_address"
            placeholder="e.g. Ikeja, Lagos"
            className="h-10"
            required
          />
        </div>
      </div>

      {/* Delivery fee */}
      <div className="flex max-w-sm flex-col gap-2">
        <Label htmlFor="delivery_fee">
          Delivery fee
        </Label>

        <div className="relative">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium text-slate-400">
            ₦
          </span>

          <Input
            id="delivery_fee"
            name="delivery_fee"
            type="number"
            min="0"
            step="0.01"
            placeholder="50000"
            className="h-10 pl-8"
            required
          />
        </div>

        <p className="text-xs text-slate-400">
          Enter the total delivery charge for
          this shipment.
        </p>
      </div>

      {/* Status */}
      <div className="rounded-lg border border-slate-100 bg-slate-50 p-4">
        <p className="text-xs font-semibold text-slate-500">
          Initial status
        </p>

        <p className="mt-1 text-sm font-semibold text-slate-800">
          Pending
        </p>

        <p className="mt-1 text-xs text-slate-400">
          New shipments begin as pending and can
          be moved through the workflow later.
        </p>
      </div>

      {/* Errors */}
      {state.error && (
        <div className="rounded-lg border border-red-100 bg-red-50 px-4 py-3">
          <p className="text-sm text-red-700">
            {state.error}
          </p>
        </div>
      )}

      {/* Success */}
      {state.success && (
        <div className="rounded-lg border border-emerald-100 bg-emerald-50 px-4 py-3">
          <p className="text-sm font-semibold text-emerald-700">
            Shipment created successfully.
          </p>

          {state.trackingNumber && (
            <p className="mt-1 text-sm text-emerald-600">
              Tracking number:{" "}
              <span className="font-bold">
                {state.trackingNumber}
              </span>
            </p>
          )}
        </div>
      )}

      <Button
        type="submit"
        disabled={
          pending || customers.length === 0
        }
      >
        {pending
          ? "Creating shipment..."
          : "Create shipment"}
      </Button>
    </form>
  );
}