"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

type VehicleActionState = {
  error?: string;
  success?: boolean;
};

export async function createVehicle(
  previousState: VehicleActionState,
  formData: FormData
): Promise<VehicleActionState> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be logged in." };
  }

  const plateNumber = String(
    formData.get("plate_number") ?? ""
  ).trim();

  const vehicleType = String(
    formData.get("vehicle_type") ?? ""
  ).trim();

  const status = String(
    formData.get("status") ?? "available"
  ).trim();

  if (!plateNumber || !vehicleType) {
    return {
      error: "Plate number and vehicle type are required.",
    };
  }

  const { error } = await supabase
    .from("vehicles")
    .insert({
      plate_number: plateNumber,
      vehicle_type: vehicleType,
      status,
    });

  if (error) {
    console.error("Create vehicle error:", error);
    return { error: error.message };
  }

  revalidatePath("/vehicles");

  return { success: true };
}

export async function updateVehicle(
  previousState: VehicleActionState,
  formData: FormData
): Promise<VehicleActionState> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be logged in." };
  }

  const id = String(formData.get("id") ?? "").trim();
  const plateNumber = String(
    formData.get("plate_number") ?? ""
  ).trim();
  const vehicleType = String(
    formData.get("vehicle_type") ?? ""
  ).trim();
  const status = String(
    formData.get("status") ?? "available"
  ).trim();

  if (!id) {
    return { error: "Vehicle ID is required." };
  }

  if (!plateNumber || !vehicleType) {
    return {
      error: "Plate number and vehicle type are required.",
    };
  }

  const { error } = await supabase
    .from("vehicles")
    .update({
      plate_number: plateNumber,
      vehicle_type: vehicleType,
      status,
    })
    .eq("id", id);

  if (error) {
    console.error("Update vehicle error:", error);
    return { error: error.message };
  }

  revalidatePath("/vehicles");

  return { success: true };
}

export async function deleteVehicle(
  previousState: VehicleActionState,
  formData: FormData
): Promise<VehicleActionState> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be logged in." };
  }

  const id = String(formData.get("id") ?? "").trim();

  if (!id) {
    return { error: "Vehicle ID is required." };
  }

  const { error } = await supabase
    .from("vehicles")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Delete vehicle error:", error);
    return { error: error.message };
  }

  revalidatePath("/vehicles");

  return { success: true };
}