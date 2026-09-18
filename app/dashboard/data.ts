import { createClient } from "@/lib/supabase/server";

export type DashboardShipment = {
  id: string;
  trackingNumber: string;
  pickupAddress: string;
  destinationAddress: string;
  status: string;
  customerName: string;
};

export type DashboardActivity = {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  metadata: Record<string, unknown>;
  createdAt: string;
  actor: {
    fullName: string | null;
    role: string | null;
  } | null;
};

export type DashboardData = {
  totalShipments: number;
  pendingShipments: number;
  inTransitShipments: number;
  todaysDeliveries: number;
  completedShipments: number;
  outstandingPayments: number;
  activeDrivers: number;
  availableVehicles: number;
  totalVehicles: number;
  recentShipments: DashboardShipment[];
  recentActivity: DashboardActivity[];
};

function getLagosTodayRange() {
  const now = new Date();

  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Africa/Lagos",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);

  const year = parts.find(
    (part) => part.type === "year"
  )?.value;

  const month = parts.find(
    (part) => part.type === "month"
  )?.value;

  const day = parts.find(
    (part) => part.type === "day"
  )?.value;

  if (!year || !month || !day) {
    throw new Error("Unable to determine today's date.");
  }

  const start = new Date(
    `${year}-${month}-${day}T00:00:00+01:00`
  );

  const end = new Date(
    start.getTime() + 24 * 60 * 60 * 1000
  );

  return {
    start: start.toISOString(),
    end: end.toISOString(),
  };
}

export async function getDashboardData(): Promise<DashboardData> {
  const supabase = await createClient();

  const {
    start: todayStart,
    end: todayEnd,
  } = getLagosTodayRange();

  // -----------------------------------------
  // Shipment counts
  // -----------------------------------------

  const [
    totalShipmentsResult,
    pendingShipmentsResult,
    inTransitShipmentsResult,
    completedShipmentsResult,
    todaysDeliveriesResult,
  ] = await Promise.all([
    supabase
      .from("shipments")
      .select("id", {
        count: "exact",
        head: true,
      }),

    supabase
      .from("shipments")
      .select("id", {
        count: "exact",
        head: true,
      })
      .eq("status", "pending"),

    supabase
      .from("shipments")
      .select("id", {
        count: "exact",
        head: true,
      })
      .eq("status", "in_transit"),

    supabase
      .from("shipments")
      .select("id", {
        count: "exact",
        head: true,
      })
      .eq("status", "delivered"),

    supabase
      .from("proof_of_delivery")
      .select("id", {
        count: "exact",
        head: true,
      })
      .gte("delivered_at", todayStart)
      .lt("delivered_at", todayEnd),
  ]);

  // -----------------------------------------
  // Driver + vehicle metrics
  // -----------------------------------------

  const [
    activeDriversResult,
    totalVehiclesResult,
    availableVehiclesResult,
  ] = await Promise.all([
    supabase
      .from("drivers")
      .select("id", {
        count: "exact",
        head: true,
      })
      .eq("status", "busy"),

    supabase
      .from("vehicles")
      .select("id", {
        count: "exact",
        head: true,
      }),

    supabase
      .from("vehicles")
      .select("id", {
        count: "exact",
        head: true,
      })
      .eq("status", "available"),
  ]);

  // -----------------------------------------
  // Outstanding payments
  // -----------------------------------------

  const {
    data: shipmentPayments,
    error: shipmentPaymentsError,
  } = await supabase
    .from("shipments")
    .select(`
      id,
      delivery_fee,
      payments (
        amount
      )
    `);

  if (shipmentPaymentsError) {
    console.error(
      "Dashboard payment data error:",
      shipmentPaymentsError
    );
  }

  let outstandingPayments = 0;

  for (const shipment of shipmentPayments ?? []) {
    const deliveryFee = Number(
      shipment.delivery_fee
    );

    const payments = Array.isArray(
      shipment.payments
    )
      ? shipment.payments
      : [];

    const totalPaid = payments.reduce(
      (total, payment) =>
        total + Number(payment.amount),
      0
    );

    const balance = deliveryFee - totalPaid;

    if (balance > 0) {
      outstandingPayments += balance;
    }
  }

  // -----------------------------------------
  // Recent shipments
  // -----------------------------------------

  const {
    data: recentShipmentRows,
    error: recentShipmentsError,
  } = await supabase
    .from("shipments")
    .select(`
      id,
      tracking_number,
      pickup_address,
      destination_address,
      status,
      created_at,
      customer:customers (
        name
      )
    `)
    .order("created_at", {
      ascending: false,
    })
    .limit(5);

  if (recentShipmentsError) {
    console.error(
      "Dashboard recent shipments error:",
      recentShipmentsError
    );
  }

  const recentShipments: DashboardShipment[] =
    (recentShipmentRows ?? []).map(
      (shipment) => {
        const customer = Array.isArray(
          shipment.customer
        )
          ? shipment.customer[0] ?? null
          : shipment.customer;

        return {
          id: shipment.id,
          trackingNumber:
            shipment.tracking_number,
          pickupAddress:
            shipment.pickup_address,
          destinationAddress:
            shipment.destination_address,
          status: shipment.status,
          customerName:
            customer?.name ?? "Unknown customer",
        };
      }
    );

  // -----------------------------------------
  // Recent activity
  // -----------------------------------------

  const {
    data: activityLogs,
    error: activityError,
  } = await supabase
    .from("activity_logs")
    .select(`
      id,
      action,
      entity_type,
      entity_id,
      metadata,
      created_at,
      actor:profiles (
        full_name,
        role
      )
    `)
    .order("created_at", {
      ascending: false,
    })
    .limit(6);

  if (activityError) {
    console.error(
      "Dashboard activity error:",
      activityError
    );
  }

  const recentActivity: DashboardActivity[] =
    (activityLogs ?? []).map((log) => {
      const actor = Array.isArray(log.actor)
        ? log.actor[0] ?? null
        : log.actor;

      return {
        id: log.id,
        action: log.action,
        entityType: log.entity_type,
        entityId: log.entity_id,
        metadata:
          (log.metadata as Record<
            string,
            unknown
          >) ?? {},
        createdAt: log.created_at,
        actor: actor
          ? {
              fullName: actor.full_name,
              role: actor.role,
            }
          : null,
      };
    });

  return {
    totalShipments:
      totalShipmentsResult.count ?? 0,

    pendingShipments:
      pendingShipmentsResult.count ?? 0,

    inTransitShipments:
      inTransitShipmentsResult.count ?? 0,

    todaysDeliveries:
      todaysDeliveriesResult.count ?? 0,

    completedShipments:
      completedShipmentsResult.count ?? 0,

    outstandingPayments,

    activeDrivers:
      activeDriversResult.count ?? 0,

    totalVehicles:
      totalVehiclesResult.count ?? 0,

    availableVehicles:
      availableVehiclesResult.count ?? 0,

    recentShipments,

    recentActivity,
  };
}