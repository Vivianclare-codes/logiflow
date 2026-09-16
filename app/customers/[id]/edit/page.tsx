import { notFound } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { EditCustomerForm } from "@/components/customers/edit-customer-form";

type EditCustomerPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditCustomerPage({
  params,
}: EditCustomerPageProps) {
  const { id } = await params;

  const supabase = await createClient();

  const { data: customer, error } = await supabase
    .from("customers")
    .select("id, name, phone, email, address")
    .eq("id", id)
    .single();

  if (error || !customer) {
    notFound();
  }

  return (
    <main className="min-h-screen p-8">
      <h1 className="text-3xl font-bold">
        Edit customer
      </h1>

      <p className="mt-2 text-muted-foreground">
        Update this customer's information.
      </p>

      <div className="mt-8">
        <EditCustomerForm customer={customer} />
      </div>
    </main>
  );
}