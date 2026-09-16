import { createClient } from "@/lib/supabase/server";
import { CustomerForm } from "@/components/customers/customer-form";

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
  <div className="space-y-4">
    {customers.map((customer) => (
      <div
        key={customer.id}
        className="rounded-lg border p-4"
      >
        <p className="font-semibold">{customer.name}</p>

        <div className="mt-2 space-y-1 text-sm text-muted-foreground">
          <p>Phone: {customer.phone}</p>

          {customer.email && (
            <p>Email: {customer.email}</p>
          )}

          {customer.address && (
            <p>Address: {customer.address}</p>
          )}

          <p>
            Added:{" "}
            {new Date(customer.created_at).toLocaleDateString()}
          </p>
        </div>
      </div>
    ))}
  </div>
) : (
          <p className="text-muted-foreground">
            No customers yet.
          </p>
        )}
      </div>
    </main>
  );
}