"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

type ShipmentActionState = {
  error?: string;
  success?: boolean;
  trackingNumber?: string;
};

export async function createShipment(
  previousState: ShipmentActionState,
  formData: FormData
): Promise<ShipmentActionState> {
  const supabase = await createClient();

  // -----------------------------------------
  // 1. Check authentication
  // -----------------------------------------

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      error: "You must be logged in.",
    };
  }

  // -----------------------------------------
  // 2. Check role
  // -----------------------------------------

  const { data: profile, error: profileError } =
    await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

  if (profileError || !profile) {
    return {
      error: "Unable to verify your account permissions.",
    };
  }

  if (
    profile.role !== "admin" &&
    profile.role !== "dispatcher"
  ) {
    return {
      error:
        "You do not have permission to create shipments.",
    };
  }

  // -----------------------------------------
  // 3. Read form values
  // -----------------------------------------

  const customerId = String(
    formData.get("customer_id") ?? ""
  ).trim();

  const pickupAddress = String(
    formData.get("pickup_address") ?? ""
  ).trim();

  const destinationAddress = String(
    formData.get("destination_address") ?? ""
  ).trim();

  const deliveryFeeValue = String(
    formData.get("delivery_fee") ?? ""
  ).trim();

  // -----------------------------------------
  // 4. Validate required fields
  // -----------------------------------------

  if (!customerId) {
    return {
      error: "Please select a customer.",
    };
  }

  if (!pickupAddress) {
    return {
      error: "Pickup address is required.",
    };
  }

  if (!destinationAddress) {
    return {
      error: "Destination address is required.",
    };
  }

  if (!deliveryFeeValue) {
    return {
      error: "Delivery fee is required.",
    };
  }

  const deliveryFee = Number(
    deliveryFeeValue
  );

  if (
    !Number.isFinite(deliveryFee) ||
    deliveryFee < 0
  ) {
    return {
      error:
        "Delivery fee must be a valid non-negative number.",
    };
  }

  // -----------------------------------------
  // 5. Create shipment
  // -----------------------------------------

  const { data: shipment, error } =
    await supabase
      .from("shipments")
      .insert({
        customer_id: customerId,
        pickup_address: pickupAddress,
        destination_address:
          destinationAddress,
        delivery_fee: deliveryFee,
        status: "pending",
        created_by: user.id,
      })
      .select("id, tracking_number")
      .single();

  if (error) {
    console.error(
      "Create shipment error:",
      error
    );

    return {
      error: error.message,
    };
  }

  // -----------------------------------------
  // 6. Refresh relevant paths
  // -----------------------------------------

  revalidatePath("/shipments");
  revalidatePath("/dashboard");

  return {
    success: true,
    trackingNumber:
      shipment.tracking_number,
  };
}