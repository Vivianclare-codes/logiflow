"use client";

import { useState } from "react";
import Link from "next/link";

import { Input } from "@/components/ui/input";
import { DeleteVehicleButton } from "@/components/vehicles/delete-vehicle-button";

type Vehicle = {
  id: string;
  plate_number: string;
  vehicle_type: string;
  status: string;
  created_at: string;
};

export function VehicleList({
  vehicles,
}: {
  vehicles: Vehicle[];
}) {
  const [search, setSearch] = useState("");

  const filteredVehicles = vehicles.filter((vehicle) => {
    const searchTerm = search.toLowerCase();

    return (
      vehicle.plate_number.toLowerCase().includes(searchTerm) ||
      vehicle.vehicle_type.toLowerCase().includes(searchTerm) ||
      vehicle.status.toLowerCase().includes(searchTerm)
    );
  });

  return (
    <div>
      <div className="mb-6 max-w-md">
        <Input
          placeholder="Search vehicles..."
          value={search}
          onChange={(event) =>
            setSearch(event.target.value)
          }
        />
      </div>

      <div className="space-y-4">
        {filteredVehicles.length ? (
          filteredVehicles.map((vehicle) => (
            <div
              key={vehicle.id}
              className="rounded-lg border p-4"
            >
              <p className="font-semibold">
                {vehicle.plate_number}
              </p>

              <p className="mt-1 text-sm text-muted-foreground">
                Type: {vehicle.vehicle_type}
              </p>

              <p className="mt-1 text-sm">
                Status: {vehicle.status}
              </p>

              <div className="mt-4 flex items-center gap-4">
                <Link
                  href={`/vehicles/${vehicle.id}/edit`}
                  className="text-sm font-medium underline"
                >
                  Edit
                </Link>

                <DeleteVehicleButton
                  vehicleId={vehicle.id}
                />
              </div>
            </div>
          ))
        ) : (
          <p className="text-muted-foreground">
            No vehicles found.
          </p>
        )}
      </div>
    </div>
  );
}