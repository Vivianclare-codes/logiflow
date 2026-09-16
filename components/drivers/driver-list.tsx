"use client";

import { useState } from "react";
import Link from "next/link";

import { Input } from "@/components/ui/input";
import { DeleteDriverButton } from "@/components/drivers/delete-driver-button";

type Driver = {
  id: string;
  full_name: string;
  phone: string;
  status: string;
  created_at: string;
};

export function DriverList({
  drivers,
}: {
  drivers: Driver[];
}) {
  const [search, setSearch] = useState("");

  const filteredDrivers = drivers.filter((driver) => {
    const searchTerm = search.toLowerCase();

    return (
      driver.full_name.toLowerCase().includes(searchTerm) ||
      driver.phone.toLowerCase().includes(searchTerm) ||
      driver.status.toLowerCase().includes(searchTerm)
    );
  });

  return (
    <div>
      <div className="mb-6 max-w-md">
        <Input
          placeholder="Search drivers..."
          value={search}
          onChange={(event) =>
            setSearch(event.target.value)
          }
        />
      </div>

      <div className="space-y-4">
        {filteredDrivers.length ? (
          filteredDrivers.map((driver) => (
            <div
              key={driver.id}
              className="rounded-lg border p-4"
            >
              <p className="font-semibold">
                {driver.full_name}
              </p>

              <p className="mt-1 text-sm text-muted-foreground">
                Phone: {driver.phone}
              </p>

              <p className="mt-1 text-sm">
                Status: {driver.status}
              </p>

              <div className="mt-4 flex items-center gap-4">
                <Link
                  href={`/drivers/${driver.id}/edit`}
                  className="text-sm font-medium underline"
                >
                  Edit
                </Link>

                <DeleteDriverButton
                  driverId={driver.id}
                />
              </div>
            </div>
          ))
        ) : (
          <p className="text-muted-foreground">
            No drivers found.
          </p>
        )}
      </div>
    </div>
  );
}