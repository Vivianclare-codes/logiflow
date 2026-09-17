"use client";

import { useState } from "react";
import Link from "next/link";
import { UserRound } from "lucide-react";

import { Input } from "@/components/ui/input";
import { DeleteDriverButton } from "@/components/drivers/delete-driver-button";


type Driver = {
  id: string;
  full_name: string;
  phone: string;
  status: string;
  created_at: string;
};

function formatStatus(status: string) {
  switch (status) {
    case "available":
      return "Available";

    case "busy":
      return "Busy";

    case "off_duty":
      return "Off duty";

    default:
      return status;
  }
}

function statusClasses(status: string) {
  switch (status) {
    case "available":
      return "bg-emerald-50 text-emerald-700";

    case "busy":
      return "bg-blue-50 text-blue-700";

    case "off_duty":
      return "bg-slate-100 text-slate-600";

    default:
      return "bg-slate-100 text-slate-600";
  }
}

export function DriverList({
  drivers,
}: {
  drivers: Driver[];
}) {
  const [search, setSearch] = useState("");

  const searchTerm = search
    .trim()
    .toLowerCase();

  const filteredDrivers = drivers.filter(
    (driver) =>
      driver.full_name
        .toLowerCase()
        .includes(searchTerm) ||
      driver.phone
        .toLowerCase()
        .includes(searchTerm) ||
      driver.status
        .toLowerCase()
        .includes(searchTerm)
  );

  return (
    <div>
      {/* Search */}
      <div className="mb-5 max-w-md">
        <label
          htmlFor="driver-search"
          className="sr-only"
        >
          Search drivers
        </label>

        <Input
          id="driver-search"
          placeholder="Search by name, phone, or status"
          value={search}
          onChange={(event) =>
            setSearch(event.target.value)
          }
          className="h-10 border-slate-200 bg-slate-50 text-sm focus:border-blue-500 focus:bg-white focus:ring-blue-100"
        />
      </div>

      {filteredDrivers.length > 0 ? (
        <>
          {/* Desktop table */}
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full text-left">
              <thead className="border-b border-slate-100 bg-slate-50/70">
                <tr>
                  <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                    Driver
                  </th>

                  <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                    Phone
                  </th>

                  <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                    Status
                  </th>

                  <th className="px-5 py-3 text-right text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {filteredDrivers.map(
                  (driver) => (
                    <tr
                      key={driver.id}
                      className="transition hover:bg-slate-50/60"
                    >
                      <td className="px-5 py-4">
                        <p className="text-sm font-bold text-slate-900">
                          {driver.full_name}
                        </p>
                      </td>

                      <td className="px-5 py-4">
                        <p className="text-sm text-slate-600">
                          {driver.phone}
                        </p>
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold ${statusClasses(
                            driver.status
                          )}`}
                        >
                          {formatStatus(
                            driver.status
                          )}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          <Link
                            href={`/drivers/${driver.id}/edit`}
                            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-blue-200 hover:text-blue-700"
                          >
                            Edit
                          </Link>

                          <DeleteDriverButton
                            driverId={driver.id}
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
            {filteredDrivers.map(
              (driver) => (
                <div
                  key={driver.id}
                  className="p-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-slate-900">
                        {driver.full_name}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        {driver.phone}
                      </p>
                    </div>

                    <span
                      className={`inline-flex shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold ${statusClasses(
                        driver.status
                      )}`}
                    >
                      {formatStatus(
                        driver.status
                      )}
                    </span>
                  </div>

                  <div className="mt-4 flex justify-end gap-2">
                    <Link
                      href={`/drivers/${driver.id}/edit`}
                      className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-blue-200 hover:text-blue-700"
                    >
                      Edit
                    </Link>

                    <DeleteDriverButton
                      driverId={driver.id}
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
            <UserRound className="size-5" />
          </span>

          <p className="mt-4 text-sm font-semibold text-slate-700">
            {search
              ? "No drivers found"
              : "No drivers yet"}
          </p>

          <p className="mt-1 max-w-xs text-xs leading-5 text-slate-400">
            {search
              ? "Try a different name, phone number, or status."
              : "Add your first driver to start managing your fleet."}
          </p>
        </div>
      )}
    </div>
  );
}