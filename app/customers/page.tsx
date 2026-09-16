import Link from "next/link";

import { createClient } from "@/lib/supabase/server";
import { CustomerForm } from "@/components/customers/customer-form";
import { DeleteCustomerButton } from "@/components/customers/delete-customer-button";
import { CustomerList } from "@/components/customers/customer-list";

export default async function CustomersPage() {
  const supabase = await createClient();

  const { data: customers, error } = await supabase
    .from("customers")
    .select("id, name, phone, email, address, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Customers fetch error:", error);
  }

  return (
    <main className="min-h-screen p-8">
      <h1 className="text-3xl font-bold">Customers</h1>

      <p className="mt-2 text-muted-foreground">
        Manage your logistics customers.
      </p>

      <div className="mt-8">
        <h2 className="text-xl font-semibold">Add customer</h2>

        <div className="mt-4">
          <CustomerForm />
        </div>
      </div>

      <div className="mt-8">
 {customers?.length ? (
  <CustomerList customers={customers} />
) : (
  <p className="text-muted-foreground">
    No customers yet.
  </p>
)}
      </div>
    </main>
  );
}