
import { createClient } from "@/lib/supabase/server";
import { DriverForm } from "@/components/drivers/driver-form";
import { DriverList } from "@/components/drivers/driver-list";

export default async function DriversPage() {
  const supabase = await createClient();

  const { data: drivers, error } = await supabase
    .from("drivers")
    .select("id, full_name, phone, status, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    console.error(
      "Fetch drivers error message:",
      error.message
    );
    console.error(
      "Fetch drivers error details:",
      error.details
    );
    console.error(
      "Fetch drivers error hint:",
      error.hint
    );
    console.error(
      "Fetch drivers error code:",
      error.code
    );
  }

  return (
    <main className="min-h-screen p-8">
      <h1 className="text-3xl font-bold">
        Drivers
      </h1>

      <p className="mt-2 text-muted-foreground">
        Manage your company's drivers.
      </p>

      <section className="mt-8">
        <h2 className="mb-4 text-xl font-semibold">
          Add driver
        </h2>

        <DriverForm />
      </section>

     <section className="mt-10">
  <h2 className="mb-4 text-xl font-semibold">
    Driver list
  </h2>

  {drivers?.length ? (
    <DriverList drivers={drivers} />
  ) : (
    <p className="text-muted-foreground">
      No drivers yet.
    </p>
  )}
</section>
    </main>
  );
}