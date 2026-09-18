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

  const { error: eventError } = await supabase
  .from("shipment_events")
  .insert({
    shipment_id: shipment.id,
    status: "pending",
    description: "Shipment created.",
    created_by: user.id,
  });

if (eventError) {
  console.error("Create shipment event error:", eventError);
  return { error: eventError.message };
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

export async function updateShipmentStatus(
  previousState: ShipmentActionState,
  formData: FormData
): Promise<ShipmentActionState> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      error: "You must be logged in.",
    };
  }

  const shipmentId = String(formData.get("shipment_id") ?? "").trim();
  const newStatus = String(formData.get("new_status") ?? "").trim();
  const scheduledPickup = String(
    formData.get("scheduled_pickup") ?? ""
  ).trim();

  if (!shipmentId) {
    return {
      error: "Shipment ID is required.",
    };
  }

  if (!newStatus) {
    return {
      error: "New shipment status is required.",
    };
  }

  const { data, error } = await supabase.rpc(
    "update_shipment_status",
    {
      p_shipment_id: shipmentId,
      p_new_status: newStatus,
      p_scheduled_pickup: scheduledPickup
        ? new Date(scheduledPickup).toISOString()
        : null,
    }
  );

  if (error) {
    console.error("Update shipment status error:", error);

    return {
      error: error.message,
    };
  }

  revalidatePath("/shipments");
  revalidatePath(`/shipments/${shipmentId}`);
  revalidatePath("/dashboard");

  return {
    success: true,
    trackingNumber: data,
  };
}

export async function assignShipmentResources(
  previousState: ShipmentActionState,
  formData: FormData
): Promise<ShipmentActionState> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      error: "You must be logged in.",
    };
  }

  const shipmentId = String(
    formData.get("shipment_id") ?? ""
  ).trim();

  const driverId = String(
    formData.get("driver_id") ?? ""
  ).trim();

  const vehicleId = String(
    formData.get("vehicle_id") ?? ""
  ).trim();

  if (!shipmentId) {
    return {
      error: "Shipment ID is required.",
    };
  }

  if (!driverId) {
    return {
      error: "Please select a driver.",
    };
  }

  if (!vehicleId) {
    return {
      error: "Please select a vehicle.",
    };
  }

  const { error } = await supabase.rpc(
    "assign_shipment_resources",
    {
      p_shipment_id: shipmentId,
      p_driver_id: driverId,
      p_vehicle_id: vehicleId,
    }
  );

  if (error) {
    console.error("Assign shipment resources error:", error);

    return {
      error: error.message,
    };
  }

  revalidatePath("/shipments");
  revalidatePath(`/shipments/${shipmentId}`);
  revalidatePath("/drivers");
  revalidatePath("/vehicles");
  revalidatePath("/dashboard");

  return {
    success: true,
  };
}

export async function completeShipmentDelivery(
  previousState: ShipmentActionState,
  formData: FormData
): Promise<ShipmentActionState> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      error: "You must be logged in.",
    };
  }

  const shipmentId = String(
    formData.get("shipment_id") ?? ""
  ).trim();

  const recipientName = String(
    formData.get("recipient_name") ?? ""
  ).trim();

  const notes = String(
    formData.get("notes") ?? ""
  ).trim();

  if (!shipmentId) {
    return {
      error: "Shipment ID is required.",
    };
  }

  if (!recipientName) {
    return {
      error: "Recipient name is required.",
    };
  }

  const { data, error } = await supabase.rpc(
    "complete_shipment_delivery",
    {
      p_shipment_id: shipmentId,
      p_recipient_name: recipientName,
      p_notes: notes || null,
      p_image_path: null,
    }
  );

  if (error) {
    console.error(
      "Complete shipment delivery error:",
      error
    );

    return {
      error: error.message,
    };
  }

  revalidatePath("/shipments");
  revalidatePath(`/shipments/${shipmentId}`);
  revalidatePath("/driver/dashboard");
  revalidatePath(`/driver/shipments/${shipmentId}`);
  revalidatePath("/drivers");
  revalidatePath("/vehicles");
  revalidatePath("/dashboard");

  return {
    success: true,
    trackingNumber: data,
  };
}

export async function recordShipmentPayment(
  previousState: ShipmentActionState,
  formData: FormData
): Promise<ShipmentActionState> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      error: "You must be logged in.",
    };
  }

  const shipmentId = String(
    formData.get("shipment_id") ?? ""
  ).trim();

  const amountValue = String(
    formData.get("amount") ?? ""
  ).trim();

  if (!shipmentId) {
    return {
      error: "Shipment ID is required.",
    };
  }

  if (!amountValue) {
    return {
      error: "Payment amount is required.",
    };
  }

  const amount = Number(amountValue);

  if (!Number.isFinite(amount) || amount <= 0) {
    return {
      error: "Payment amount must be greater than zero.",
    };
  }

  const { data: newBalance, error } = await supabase.rpc(
    "record_shipment_payment",
    {
      p_shipment_id: shipmentId,
      p_amount: amount,
    }
  );

  if (error) {
    console.error(
      "Record shipment payment error:",
      error
    );

    return {
      error: error.message,
    };
  }

  revalidatePath("/shipments");
  revalidatePath(`/shipments/${shipmentId}`);
  revalidatePath("/dashboard");

  return {
    success: true,
    trackingNumber: String(newBalance),
  };
}