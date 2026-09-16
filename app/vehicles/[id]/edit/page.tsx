import { notFound } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { EditVehicleForm } from "@/components/vehicles/edit-vehicle-form";

type EditVehiclePageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditVehiclePage({
  params,
}: EditVehiclePageProps) {
  const { id } = await params;

  const supabase = await createClient();

  const { data: vehicle, error } = await supabase
    .from("vehicles")
    .select("id, plate_number, vehicle_type, status")
    .eq("id", id)
    .single();

  if (error || !vehicle) {
    notFound();
  }

  return (
    <main className="min-h-screen p-8">
      <h1 className="text-3xl font-bold">
        Edit vehicle
      </h1>

      <p className="mt-2 text-muted-foreground">
        Update this vehicle's information.
      </p>

      <div className="mt-8">
        <EditVehicleForm vehicle={vehicle} />
      </div>
    </main>
  );
}