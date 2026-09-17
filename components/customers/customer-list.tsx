"use client";

import { useState } from "react";
import Link from "next/link";

import { Input } from "@/components/ui/input";
import { DeleteCustomerButton } from "@/components/customers/delete-customer-button";
import { Users } from "lucide-react";

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

  const searchTerm = search
    .trim()
    .toLowerCase();

  const filteredCustomers =
    customers.filter((customer) => {
      return (
        customer.name
          .toLowerCase()
          .includes(searchTerm) ||
        customer.phone
          .toLowerCase()
          .includes(searchTerm) ||
        customer.email
          ?.toLowerCase()
          .includes(searchTerm)
      );
    });

  return (
    <div>
      {/* Search */}
      <div className="mb-5 max-w-md">
        <label
          htmlFor="customer-search"
          className="sr-only"
        >
          Search customers
        </label>

        <Input
          id="customer-search"
          placeholder="Search by name, phone, or email"
          value={search}
          onChange={(event) =>
            setSearch(event.target.value)
          }
          className="h-10 border-slate-200 bg-slate-50 text-sm focus:border-blue-500 focus:bg-white focus:ring-blue-100"
        />
      </div>

      {filteredCustomers.length > 0 ? (
        <>
          {/* Desktop table */}
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full text-left">
              <thead className="border-b border-slate-100 bg-slate-50/70">
                <tr>
                  <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                    Customer
                  </th>

                  <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                    Phone
                  </th>

                  <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                    Email
                  </th>

                  <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                    Address
                  </th>

                  <th className="px-5 py-3 text-right text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {filteredCustomers.map(
                  (customer) => (
                    <tr
                      key={customer.id}
                      className="transition hover:bg-slate-50/60"
                    >
                      <td className="px-5 py-4">
                        <p className="text-sm font-bold text-slate-900">
                          {customer.name}
                        </p>
                      </td>

                      <td className="px-5 py-4">
                        <p className="text-sm text-slate-600">
                          {customer.phone}
                        </p>
                      </td>

                      <td className="px-5 py-4">
                        <p className="max-w-[220px] truncate text-sm text-slate-600">
                          {customer.email || "—"}
                        </p>
                      </td>

                      <td className="px-5 py-4">
                        <p className="max-w-[240px] truncate text-sm text-slate-600">
                          {customer.address || "—"}
                        </p>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          <Link
                            href={`/customers/${customer.id}/edit`}
                            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-blue-200 hover:text-blue-700"
                          >
                            Edit
                          </Link>

                          <DeleteCustomerButton
                            customerId={customer.id}
                          />
                        </div>
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="divide-y divide-slate-100 rounded-lg border border-slate-100 md:hidden">
            {filteredCustomers.map(
              (customer) => (
                <div
                  key={customer.id}
                  className="p-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-slate-900">
                        {customer.name}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        {customer.phone}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 space-y-2 text-xs">
                    {customer.email && (
                      <div className="flex gap-2">
                        <span className="w-14 shrink-0 font-semibold text-slate-400">
                          Email
                        </span>

                        <span className="min-w-0 break-all text-slate-600">
                          {customer.email}
                        </span>
                      </div>
                    )}

                    {customer.address && (
                      <div className="flex gap-2">
                        <span className="w-14 shrink-0 font-semibold text-slate-400">
                          Address
                        </span>

                        <span className="min-w-0 text-slate-600">
                          {customer.address}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 flex justify-end gap-2">
                    <Link
                      href={`/customers/${customer.id}/edit`}
                      className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-blue-200 hover:text-blue-700"
                    >
                      Edit
                    </Link>

                    <DeleteCustomerButton
                      customerId={customer.id}
                    />
                  </div>
                </div>
              )
            )}
          </div>
        </>
      ) : (
        <div className="flex min-h-[220px] flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 px-6 py-12 text-center">
          <span className="flex size-11 items-center justify-center rounded-full bg-blue-50 text-blue-600">
            <Users className="size-5" />
          </span>

          <p className="mt-4 text-sm font-semibold text-slate-700">
            {search
              ? "No customers found"
              : "No customers yet"}
          </p>

          <p className="mt-1 max-w-xs text-xs leading-5 text-slate-400">
            {search
              ? "Try a different name, phone number, or email."
              : "Add your first customer to start managing shipments."}
          </p>
        </div>
      )}
    </div>
  );
}