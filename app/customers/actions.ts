"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

type CustomerActionState = {
  error?: string;
  success?: boolean;
};



export async function createCustomer(
  previousState: CustomerActionState,
  formData: FormData
): Promise<CustomerActionState>  {
  const supabase = await createClient();

  // Make sure the person submitting the form is logged in.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be logged in." };
  }

  const name = String(formData.get("name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const address = String(formData.get("address") ?? "").trim();

  // Basic validation for now.
  if (!name || !phone) {
    return { error: "Name and phone are required." };
  }

  const { error } = await supabase.from("customers").insert({
    name,
    phone,
    email: email || null,
    address: address || null,
  });

  if (error) {
    console.error("Create customer error:", error);
    return { error: error.message };
  }

  // Tell Next.js that /customers has new data.
  revalidatePath("/customers");

  return { success: true };
}

export async function updateCustomer(
  previousState: CustomerActionState,
  formData: FormData
): Promise<CustomerActionState> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be logged in." };
  }

  const id = String(formData.get("id") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const address = String(formData.get("address") ?? "").trim();

  if (!id) {
    return { error: "Customer ID is required." };
  }

  if (!name || !phone) {
    return { error: "Name and phone are required." };
  }

  const { error } = await supabase
    .from("customers")
    .update({
      name,
      phone,
      email: email || null,
      address: address || null,
    })
    .eq("id", id);

  if (error) {
    console.error("Update customer error:", error);
    return { error: error.message };
  }

  revalidatePath("/customers");

  return { success: true };
}