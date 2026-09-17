"use client";

import Link from "next/link";
import { useState } from "react";
import { Package } from "lucide-react";

type Shipment = {
  id: string;
  tracking_number: string;
  pickup_address: string;
  destination_address: string;
  status: string;
  delivery_fee: number | string;
  created_at: string;
  customer: {
    name: string;
    phone: string;
  } | null;
};

function formatStatus(status: string) {
  switch (status) {
    case "pending":
      return "Pending";

    case "pickup_scheduled":
      return "Pickup scheduled";

    case "picked_up":
      return "Picked up";

    case "in_transit":
      return "In transit";

    case "out_for_delivery":
      return "Out for delivery";

    case "delivered":
      return "Delivered";

    case "cancelled":
      return "Cancelled";

    default:
      return status;
  }
}

function statusClasses(status: string) {
  switch (status) {
    case "pending":
      return "bg-slate-100 text-slate-600";

    case "pickup_scheduled":
      return "bg-blue-50 text-blue-700";

    case "picked_up":
      return "bg-indigo-50 text-indigo-700";

    case "in_transit":
      return "bg-blue-50 text-blue-700";

    case "out_for_delivery":
      return "bg-amber-50 text-amber-700";

    case "delivered":
      return "bg-emerald-50 text-emerald-700";

    case "cancelled":
      return "bg-red-50 text-red-700";

    default:
      return "bg-slate-100 text-slate-600";
  }
}

function formatCurrency(value: number | string) {
  const amount =
    typeof value === "number"
      ? value
      : Number(value);

  if (!Number.isFinite(amount)) {
    return "₦0";
  }

  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function ShipmentList({
  shipments,
}: {
  shipments: Shipment[];
}) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] =
    useState("all");

  const searchTerm = search
    .trim()
    .toLowerCase();

  const filteredShipments =
    shipments.filter((shipment) => {
      const matchesSearch =
        !searchTerm ||
        shipment.tracking_number
          .toLowerCase()
          .includes(searchTerm) ||
        shipment.customer?.name
          ?.toLowerCase()
          .includes(searchTerm) ||
        shipment.customer?.phone
          ?.toLowerCase()
          .includes(searchTerm) ||
        shipment.pickup_address
          .toLowerCase()
          .includes(searchTerm) ||
        shipment.destination_address
          .toLowerCase()
          .includes(searchTerm);

      const matchesStatus =
        statusFilter === "all" ||
        shipment.status === statusFilter;

      return (
        matchesSearch && matchesStatus
      );
    });

  return (
    <div>
      {/* Filters */}
      <div className="mb-6 grid gap-3 md:grid-cols-[minmax(0,1fr)_220px]">
        <div>
          <label
            htmlFor="shipment-search"
            className="sr-only"
          >
            Search shipments
          </label>

          <input
            id="shipment-search"
            type="search"
            placeholder="Search by tracking number, customer, or route"
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
          />
        </div>

        <div>
          <label
            htmlFor="shipment-status"
            className="sr-only"
          >
            Filter by shipment status
          </label>

          <select
            id="shipment-status"
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(
                event.target.value
              )
            }
            className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          >
            <option value="all">
              All statuses
            </option>

            <option value="pending">
              Pending
            </option>

            <option value="pickup_scheduled">
              Pickup scheduled
            </option>

            <option value="picked_up">
              Picked up
            </option>

            <option value="in_transit">
              In transit
            </option>

            <option value="out_for_delivery">
              Out for delivery
            </option>

            <option value="delivered">
              Delivered
            </option>

            <option value="cancelled">
              Cancelled
            </option>
          </select>
        </div>
      </div>

      {filteredShipments.length > 0 ? (
        <>
          {/* Desktop table */}
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full text-left">
              <thead className="border-b border-slate-100 bg-slate-50/70">
                <tr>
                  <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                    Shipment
                  </th>

                  <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                    Customer
                  </th>

                  <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                    Route
                  </th>

                  <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                    Status
                  </th>

                  <th className="px-5 py-3 text-right text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                    Fee
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {filteredShipments.map(
                  (shipment) => (
                    <tr
                      key={shipment.id}
                      className="transition hover:bg-slate-50/60"
                    >
                      <td className="px-5 py-4">
                        <p className="text-sm font-bold text-slate-900">
                        <Link
  href={`/shipments/${shipment.id}`}
  className="font-semibold text-slate-950 hover:text-blue-600"
>
  {shipment.tracking_number}
</Link>
                        </p>

                        <p className="mt-1 text-[11px] text-slate-400">
                          {new Date(
                            shipment.created_at
                          ).toLocaleDateString()}
                        </p>
                      </td>

                      <td className="px-5 py-4">
                        <p className="text-sm font-semibold text-slate-800">
                          {shipment.customer
                            ?.name || "Unknown customer"}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          {shipment.customer
                            ?.phone || "—"}
                        </p>
                      </td>

                      <td className="px-5 py-4">
                        <div className="max-w-[280px]">
                          <p className="truncate text-xs text-slate-600">
                            {shipment.pickup_address}
                          </p>

                          <p className="my-1 text-[10px] font-semibold text-slate-300">
                            ↓
                          </p>

                          <p className="truncate text-xs text-slate-600">
                            {shipment.destination_address}
                          </p>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold ${statusClasses(
                            shipment.status
                          )}`}
                        >
                          {formatStatus(
                            shipment.status
                          )}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-right">
                        <p className="text-sm font-semibold text-slate-800">
                          {formatCurrency(
                            shipment.delivery_fee
                          )}
                        </p>
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="divide-y divide-slate-100 rounded-lg border border-slate-100 md:hidden">
            {filteredShipments.map(
              (shipment) => (
                <div
                  key={shipment.id}
                  className="p-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-slate-900">
                       <Link
  href={`/shipments/${shipment.id}`}
  className="font-semibold text-slate-950 hover:text-blue-600"
>
  {shipment.tracking_number}
</Link>
                      </p>

                      <p className="mt-1 truncate text-xs text-slate-500">
                        {shipment.customer
                          ?.name ||
                          "Unknown customer"}
                      </p>
                    </div>

                    <span
                      className={`inline-flex shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold ${statusClasses(
                        shipment.status
                      )}`}
                    >
                      {formatStatus(
                        shipment.status
                      )}
                    </span>
                  </div>

                  <div className="mt-4 rounded-lg bg-slate-50 p-3">
                    <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400">
                      Route
                    </p>

                    <p className="mt-2 text-xs text-slate-700">
                      {shipment.pickup_address}
                    </p>

                    <p className="my-1 text-[10px] font-semibold text-slate-300">
                      ↓
                    </p>

                    <p className="text-xs text-slate-700">
                      {shipment.destination_address}
                    </p>
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-400">
                        Delivery fee
                      </p>

                      <p className="mt-1 text-sm font-bold text-slate-800">
                        {formatCurrency(
                          shipment.delivery_fee
                        )}
                      </p>
                    </div>

                    <p className="text-[11px] text-slate-400">
                      {new Date(
                        shipment.created_at
                      ).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              )
            )}
          </div>
        </>
      ) : (
        <div className="flex min-h-[220px] flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 px-6 py-12 text-center">
          <span className="flex size-11 items-center justify-center rounded-full bg-blue-50 text-blue-600">
            <Package className="size-5" />
          </span>

          <p className="mt-4 text-sm font-semibold text-slate-700">
            {search || statusFilter !== "all"
              ? "No shipments found"
              : "No shipments yet"}
          </p>

          <p className="mt-1 max-w-xs text-xs leading-5 text-slate-400">
            {search || statusFilter !== "all"
              ? "Try changing your search or status filter."
              : "Create your first shipment to start tracking your operation."}
          </p>
        </div>
      )}
    </div>
  );
}