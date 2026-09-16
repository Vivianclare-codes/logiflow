import Link from "next/link";

import { createClient } from "@/lib/supabase/server";
import { VehicleForm } from "@/components/vehicles/vehicle-form";
import { DeleteVehicleButton } from "@/components/vehicles/delete-vehicle-button";
import { VehicleList } from "@/components/vehicles/vehicle-list";

export default async function VehiclesPage() {
  const supabase = await createClient();

  const { data: vehicles, error } = await supabase
    .from("vehicles")
    .select("id, plate_number, vehicle_type, status, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Fetch vehicles error:", error);
  }

  return (
    <main className="min-h-screen p-8">
      <h1 className="text-3xl font-bold">
        Vehicles
      </h1>

      <p className="mt-2 text-muted-foreground">
        Manage your company's vehicles.
      </p>

      <section className="mt-8">
        <h2 className="mb-4 text-xl font-semibold">
          Add vehicle
        </h2>

        <VehicleForm />
      </section>

      <section className="mt-10">
        <h2 className="mb-4 text-xl font-semibold">
          Vehicle list
        </h2>

       {vehicles?.length ? (
  <VehicleList vehicles={vehicles} />
) : (
  <p className="text-muted-foreground">
    No vehicles yet.
  </p>
)}
      </section>
    </main>
  );
}