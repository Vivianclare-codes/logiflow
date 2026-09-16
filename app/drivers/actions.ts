"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

type DriverActionState = {
  error?: string;
  success?: boolean;
};

export async function createDriver(
  previousState: DriverActionState,
  formData: FormData
): Promise<DriverActionState> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be logged in." };
  }

  const fullName = String(
    formData.get("full_name") ?? ""
  ).trim();

  const phone = String(
    formData.get("phone") ?? ""
  ).trim();

  const status = String(
    formData.get("status") ?? "available"
  ).trim();

  if (!fullName || !phone) {
    return {
      error: "Driver name and phone are required.",
    };
  }

  const { error } = await supabase
    .from("drivers")
    .insert({
      full_name: fullName,
      phone,
      status,
    });

  if (error) {
    console.error("Create driver error:", error);

    return {
      error: error.message,
    };
  }

  revalidatePath("/drivers");

  return {
    success: true,
  };
}

export async function updateDriver(
  previousState: DriverActionState,
  formData: FormData
): Promise<DriverActionState> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be logged in." };
  }

  const id = String(formData.get("id") ?? "").trim();

  const fullName = String(
    formData.get("full_name") ?? ""
  ).trim();

  const phone = String(
    formData.get("phone") ?? ""
  ).trim();

  const status = String(
    formData.get("status") ?? "available"
  ).trim();

  if (!id) {
    return { error: "Driver ID is required." };
  }

  if (!fullName || !phone) {
    return {
      error: "Driver name and phone are required.",
    };
  }

  const { error } = await supabase
    .from("drivers")
    .update({
      full_name: fullName,
      phone,
      status,
    })
    .eq("id", id);

  if (error) {
    console.error("Update driver error:", error);

    return {
      error: error.message,
    };
  }

  revalidatePath("/drivers");

  return {
    success: true,
  };
}

export async function deleteDriver(
  previousState: DriverActionState,
  formData: FormData
): Promise<DriverActionState> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be logged in." };
  }

  const id = String(formData.get("id") ?? "").trim();

  if (!id) {
    return { error: "Driver ID is required." };
  }

  const { error } = await supabase
    .from("drivers")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Delete driver error:", error);

    return {
      error: error.message,
    };
  }

  revalidatePath("/drivers");

  return {
    success: true,
  };
}