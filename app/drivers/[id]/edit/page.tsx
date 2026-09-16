import { notFound } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { EditDriverForm } from "@/components/drivers/edit-driver-form";

type EditDriverPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditDriverPage({
  params,
}: EditDriverPageProps) {
  const { id } = await params;

  const supabase = await createClient();

  const { data: driver, error } = await supabase
    .from("drivers")
    .select("id, full_name, phone, status")
    .eq("id", id)
    .single();

  if (error || !driver) {
    notFound();
  }

  return (
    <main className="min-h-screen p-8">
      <h1 className="text-3xl font-bold">
        Edit driver
      </h1>

      <p className="mt-2 text-muted-foreground">
        Update this driver's information.
      </p>

      <div className="mt-8">
        <EditDriverForm driver={driver} />
      </div>
    </main>
  );
}