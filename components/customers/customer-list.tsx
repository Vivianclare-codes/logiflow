
"use client";

import { useState } from "react";
import Link from "next/link";

import { Input } from "@/components/ui/input";
import { DeleteCustomerButton } from "@/components/customers/delete-customer-button";

type Customer = {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  address: string | null;
  created_at: string;
};

export function CustomerList({
  customers,
}: {
  customers: Customer[];
}) {
  const [search, setSearch] = useState("");

  const filteredCustomers = customers.filter((customer) => {
    const searchTerm = search.toLowerCase();

    return (
      customer.name.toLowerCase().includes(searchTerm) ||
      customer.phone.toLowerCase().includes(searchTerm) ||
      customer.email?.toLowerCase().includes(searchTerm)
    );
  });

  return (
    <div>
      <div className="mb-6 max-w-md">
        <Input
          placeholder="Search customers..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </div>

      <div className="space-y-4">
        {filteredCustomers.map((customer) => (
          <div
            key={customer.id}
            className="rounded-lg border p-4"
          >
            <p className="font-semibold">{customer.name}</p>

            <div className="mt-2 space-y-1 text-sm text-muted-foreground">
              <p>Phone: {customer.phone}</p>

              {customer.email && (
                <p>Email: {customer.email}</p>
              )}

              {customer.address && (
                <p>Address: {customer.address}</p>
              )}

              <p>
                Added:{" "}
                {new Date(
                  customer.created_at
                ).toLocaleDateString()}
              </p>
            </div>

            <div className="mt-4 flex items-center gap-4">
              <Link
                href={`/customers/${customer.id}/edit`}
                className="text-sm font-medium underline"
              >
                Edit
              </Link>

              <DeleteCustomerButton customerId={customer.id} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

