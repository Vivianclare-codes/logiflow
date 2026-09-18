"use server";

import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// --------------------------------------------------
// VALIDATION SCHEMAS
// --------------------------------------------------

const createStaffSchema = z
  .object({
    fullName: z
      .string()
      .trim()
      .min(2, "Full name must be at least 2 characters.")
      .max(100, "Full name is too long."),

    email: z
      .string()
      .trim()
      .email("Enter a valid email address."),

    password: z
      .string()
      .min(8, "Password must be at least 8 characters."),

    role: z.enum(["admin", "dispatcher", "driver"]),

    phone: z
      .string()
      .trim()
      .max(30, "Phone number is too long.")
      .optional(),
  })
  .superRefine((data, ctx) => {
    if (data.role === "driver" && !data.phone) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["phone"],
        message: "Phone number is required for drivers.",
      });
    }
  });

const updateStaffSchema = z
  .object({
    staffId: z.string().uuid("Invalid staff ID."),

    fullName: z
      .string()
      .trim()
      .min(2, "Full name must be at least 2 characters.")
      .max(100, "Full name is too long."),

    role: z.enum(["admin", "dispatcher", "driver"]),

    phone: z
      .string()
      .trim()
      .max(30, "Phone number is too long.")
      .optional(),
  })
  .superRefine((data, ctx) => {
    if (data.role === "driver" && !data.phone) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["phone"],
        message: "Phone number is required for drivers.",
      });
    }
  });

// --------------------------------------------------
// TYPES
// --------------------------------------------------

export type CreateStaffState = {
  success: boolean;
  message: string;
  errors?: {
    fullName?: string[];
    email?: string[];
    password?: string[];
    role?: string[];
    phone?: string[];
  };
};

export type UpdateStaffState = {
  success: boolean;
  message: string;
  errors?: {
    fullName?: string[];
    role?: string[];
    phone?: string[];
  };
};

export type ToggleStaffState = {
  success: boolean;
  message: string;
};

// --------------------------------------------------
// CREATE STAFF
// --------------------------------------------------

export async function createStaff(
  _previousState: CreateStaffState,
  formData: FormData
): Promise<CreateStaffState> {
  const supabase = await createClient();

  // 1. Verify that someone is logged in.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      success: false,
      message: "You must be logged in to create staff accounts.",
    };
  }

  // 2. Verify that the logged-in user is an active admin.
  const { data: profile, error: currentProfileError } = await supabase
    .from("profiles")
    .select("role, is_active")
    .eq("id", user.id)
    .single();

  if (currentProfileError || !profile) {
    return {
      success: false,
      message: "Your account profile could not be found.",
    };
  }

  if (!profile.is_active) {
    await supabase.auth.signOut();

    return {
      success: false,
      message: "Your LogiFlow account has been deactivated.",
    };
  }

  if (profile.role !== "admin") {
    return {
      success: false,
      message: "Only administrators can create staff accounts.",
    };
  }

  // 3. Read submitted form data.
  const rawData = {
    fullName: formData.get("fullName"),
    email: formData.get("email"),
    password: formData.get("password"),
    role: formData.get("role"),
    phone: formData.get("phone") || undefined,
  };

  // 4. Validate.
  const validationResult = createStaffSchema.safeParse(rawData);

  if (!validationResult.success) {
    return {
      success: false,
      message: "Please correct the highlighted fields.",
      errors: validationResult.error.flatten().fieldErrors,
    };
  }

  const {
    fullName,
    email,
    password,
    role,
    phone,
  } = validationResult.data;

  // 5. Create the Supabase Auth user.
  const {
    data: { user: newUser },
    error: createUserError,
  } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      full_name: fullName,
    },
  });

  if (createUserError || !newUser) {
    console.error("Auth user creation error:", createUserError);

    return {
      success: false,
      message:
        createUserError?.message ??
        "Unable to create the staff account.",
    };
  }

  // 6. Create or update the profile.
  //
  // The existing Auth trigger may already have created
  // this profile. Upsert handles either situation.
  const { error: staffProfileError } = await supabaseAdmin
    .from("profiles")
    .upsert(
      {
        id: newUser.id,
        full_name: fullName,
        role,
        is_active: true,
      },
      {
        onConflict: "id",
      }
    );

  if (staffProfileError) {
    console.error("Profile setup error:", staffProfileError);

    // Clean up anything created so far.
    await supabaseAdmin
      .from("profiles")
      .delete()
      .eq("id", newUser.id);

    await supabaseAdmin.auth.admin.deleteUser(newUser.id);

    return {
      success: false,
      message: "Staff account could not be fully configured.",
    };
  }

  // 7. If the new staff member is a driver,
  // create their driver record.
  if (role === "driver") {
    const { error: driverError } = await supabaseAdmin
      .from("drivers")
      .insert({
        full_name: fullName,
        phone: phone!,
        profile_id: newUser.id,
        status: "available",
      });

    if (driverError) {
      console.error("Driver creation error:", driverError);

      // Clean up the driver record if necessary.
      await supabaseAdmin
        .from("drivers")
        .delete()
        .eq("profile_id", newUser.id);

      // Clean up profile.
      await supabaseAdmin
        .from("profiles")
        .delete()
        .eq("id", newUser.id);

      // Clean up Auth user.
      await supabaseAdmin.auth.admin.deleteUser(newUser.id);

      return {
        success: false,
        message: "Driver account could not be fully configured.",
      };
    }
  }

  revalidatePath("/staff");

  return {
    success: true,
    message: `${fullName} was created successfully as ${role}.`,
  };
}

// --------------------------------------------------
// UPDATE STAFF
// --------------------------------------------------

export async function updateStaff(
  _previousState: UpdateStaffState,
  formData: FormData
): Promise<UpdateStaffState> {
  const supabase = await createClient();

  // 1. Verify current user.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      success: false,
      message: "You must be logged in to edit staff accounts.",
    };
  }

  // 2. Verify current user is an active admin.
  const { data: currentProfile, error: currentProfileError } =
    await supabase
      .from("profiles")
      .select("role, is_active")
      .eq("id", user.id)
      .single();

  if (currentProfileError || !currentProfile) {
    return {
      success: false,
      message: "Your account profile could not be found.",
    };
  }

  if (!currentProfile.is_active) {
    await supabase.auth.signOut();

    return {
      success: false,
      message: "Your LogiFlow account has been deactivated.",
    };
  }

  if (currentProfile.role !== "admin") {
    return {
      success: false,
      message: "Only administrators can edit staff accounts.",
    };
  }

  // 3. Read and validate submitted fields.
  const rawData = {
    staffId: formData.get("staffId"),
    fullName: formData.get("fullName"),
    role: formData.get("role"),
    phone: formData.get("phone") || undefined,
  };

  const validationResult = updateStaffSchema.safeParse(rawData);

  if (!validationResult.success) {
    return {
      success: false,
      message: "Please correct the highlighted fields.",
      errors: validationResult.error.flatten().fieldErrors,
    };
  }

  const {
    staffId,
    fullName,
    role,
    phone,
  } = validationResult.data;

  // 4. Get the staff member being edited.
  const { data: existingProfile, error: existingProfileError } =
    await supabaseAdmin
      .from("profiles")
      .select("id, full_name, role, is_active")
      .eq("id", staffId)
      .single();

  if (existingProfileError || !existingProfile) {
    return {
      success: false,
      message: "Staff member could not be found.",
    };
  }

  // 5. Prevent an admin from removing their own admin role.
  if (staffId === user.id && role !== "admin") {
    return {
      success: false,
      message: "You cannot remove your own administrator role.",
    };
  }

  // 6. Find the person's current driver record, if any.
  const { data: existingDriver, error: existingDriverError } =
    await supabaseAdmin
      .from("drivers")
      .select("id, status, profile_id")
      .eq("profile_id", staffId)
      .maybeSingle();

  if (existingDriverError) {
    console.error("Driver lookup error:", existingDriverError);

    return {
      success: false,
      message: "Unable to check the staff member's driver record.",
    };
  }

  // 7. If a current driver is being changed to another role,
  // make sure there are no active shipments first.
  if (
    existingProfile.role === "driver" &&
    role !== "driver" &&
    existingDriver
  ) {
    const {
      data: activeShipments,
      error: activeShipmentsError,
    } = await supabaseAdmin
      .from("shipments")
      .select("id, tracking_number, status")
      .eq("driver_id", existingDriver.id)
      .not("status", "in", "(delivered,cancelled)");

    if (activeShipmentsError) {
      console.error(
        "Active shipment check error:",
        activeShipmentsError
      );

      return {
        success: false,
        message: "Unable to check the driver's active shipments.",
      };
    }

    if ((activeShipments ?? []).length > 0) {
      return {
        success: false,
        message:
          "This driver still has active shipments. Reassign those shipments before changing their role.",
      };
    }
  }

  // 8. Update the profile.
  const { error: profileUpdateError } = await supabaseAdmin
    .from("profiles")
    .update({
      full_name: fullName,
      role,
    })
    .eq("id", staffId);

  if (profileUpdateError) {
    console.error(
      "Staff profile update error:",
      profileUpdateError
    );

    return {
      success: false,
      message: "Unable to update the staff profile.",
    };
  }

  // 9. Keep Auth metadata in sync with the profile name.
  const { error: authUpdateError } =
    await supabaseAdmin.auth.admin.updateUserById(staffId, {
      user_metadata: {
        full_name: fullName,
      },
    });

  if (authUpdateError) {
    console.error("Auth user update error:", authUpdateError);
  }

  // 10. Handle someone becoming or remaining a driver.
  if (role === "driver") {
    if (existingDriver) {
      const { error: driverUpdateError } = await supabaseAdmin
        .from("drivers")
        .update({
          full_name: fullName,
          phone: phone!,
        })
        .eq("id", existingDriver.id);

      if (driverUpdateError) {
        console.error(
          "Driver update error:",
          driverUpdateError
        );

        return {
          success: false,
          message:
            "The staff profile was updated, but the driver record could not be updated.",
        };
      }
    } else {
      // New driver identity.
      const { error: driverCreateError } = await supabaseAdmin
        .from("drivers")
        .insert({
          full_name: fullName,
          phone: phone!,
          profile_id: staffId,
          status: "off_duty",
        });

      if (driverCreateError) {
        console.error(
          "Driver record creation error:",
          driverCreateError
        );

        return {
          success: false,
          message:
            "The staff profile was updated, but the driver record could not be created.",
        };
      }
    }
  }

  // 11. If a driver becomes an admin or dispatcher,
  // detach their current driver identity.
  //
  // We don't delete the driver row because historical
  // shipments may still reference it.
  if (
    existingProfile.role === "driver" &&
    role !== "driver" &&
    existingDriver
  ) {
    const { error: detachDriverError } = await supabaseAdmin
      .from("drivers")
      .update({
        profile_id: null,
        status: "off_duty",
      })
      .eq("id", existingDriver.id);

    if (detachDriverError) {
      console.error(
        "Driver detach error:",
        detachDriverError
      );

      return {
        success: false,
        message:
          "The staff profile was updated, but the driver role could not be removed safely.",
      };
    }
  }

  revalidatePath("/staff");
  revalidatePath("/drivers");

  return {
    success: true,
    message: `${fullName} was updated successfully.`,
  };
}

// --------------------------------------------------
// DEACTIVATE / REACTIVATE STAFF
// --------------------------------------------------

export async function toggleStaffActive(
  staffId: string,
  isActive: boolean
): Promise<ToggleStaffState> {
  const supabase = await createClient();

  // 1. Verify current user.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      success: false,
      message: "You must be logged in to manage staff accounts.",
    };
  }

  // 2. Verify current user is an active admin.
  const { data: currentProfile, error: currentProfileError } =
    await supabase
      .from("profiles")
      .select("role, is_active")
      .eq("id", user.id)
      .single();

  if (currentProfileError || !currentProfile) {
    return {
      success: false,
      message: "Your account profile could not be found.",
    };
  }

  if (!currentProfile.is_active) {
    await supabase.auth.signOut();

    return {
      success: false,
      message: "Your LogiFlow account has been deactivated.",
    };
  }

  if (currentProfile.role !== "admin") {
    return {
      success: false,
      message: "Only administrators can manage staff accounts.",
    };
  }

  // 3. Prevent an admin from deactivating themselves.
  if (staffId === user.id && !isActive) {
    return {
      success: false,
      message: "You cannot deactivate your own account.",
    };
  }

  // 4. Find the target staff member.
  const { data: targetProfile, error: targetProfileError } =
    await supabaseAdmin
      .from("profiles")
      .select("id, full_name, role, is_active")
      .eq("id", staffId)
      .single();

  if (targetProfileError || !targetProfile) {
    return {
      success: false,
      message: "Staff member could not be found.",
    };
  }

  // 5. Prevent deactivating the last active administrator.
  if (!isActive && targetProfile.role === "admin") {
    const {
      count: activeAdminCount,
      error: adminCountError,
    } = await supabaseAdmin
      .from("profiles")
      .select("id", {
        count: "exact",
        head: true,
      })
      .eq("role", "admin")
      .eq("is_active", true);

    if (adminCountError) {
      console.error(
        "Active admin count error:",
        adminCountError
      );

      return {
        success: false,
        message: "Unable to verify administrator accounts.",
      };
    }

    if ((activeAdminCount ?? 0) <= 1) {
      return {
        success: false,
        message:
          "You cannot deactivate the last active administrator account.",
      };
    }
  }

  // 6. If deactivating a driver, make sure they
  // don't have active shipments.
  if (!isActive && targetProfile.role === "driver") {
    const { data: driver, error: driverError } =
      await supabaseAdmin
        .from("drivers")
        .select("id")
        .eq("profile_id", staffId)
        .maybeSingle();

    if (driverError) {
      console.error("Driver lookup error:", driverError);

      return {
        success: false,
        message:
          "Unable to check the driver's current assignments.",
      };
    }

    if (driver) {
      const {
        data: activeShipments,
        error: shipmentError,
      } = await supabaseAdmin
        .from("shipments")
        .select("id, tracking_number, status")
        .eq("driver_id", driver.id)
        .not("status", "in", "(delivered,cancelled)");

      if (shipmentError) {
        console.error(
          "Active shipment check error:",
          shipmentError
        );

        return {
          success: false,
          message:
            "Unable to check the driver's active shipments.",
        };
      }

      if ((activeShipments ?? []).length > 0) {
        return {
          success: false,
          message:
            "This driver still has active shipments. Reassign those shipments before deactivating the account.",
        };
      }
    }
  }

  // 7. Update the application account status.
  const { error: profileUpdateError } = await supabaseAdmin
    .from("profiles")
    .update({
      is_active: isActive,
    })
    .eq("id", staffId);

  if (profileUpdateError) {
    console.error(
      "Account status update error:",
      profileUpdateError
    );

    return {
      success: false,
      message: "Unable to update the staff account status.",
    };
  }

  // 8. Drivers who are deactivated or reactivated
  // remain off duty until deliberately made available.
  if (targetProfile.role === "driver") {
    const { error: driverStatusError } =
      await supabaseAdmin
        .from("drivers")
        .update({
          status: "off_duty",
        })
        .eq("profile_id", staffId);

    if (driverStatusError) {
      console.error(
        "Driver status update error:",
        driverStatusError
      );

      return {
        success: false,
        message:
          "The account status changed, but the driver's operational status could not be updated.",
      };
    }
  }

  revalidatePath("/staff");
  revalidatePath("/drivers");

  return {
    success: true,
    message: `${targetProfile.full_name ?? "Staff member"} was ${
      isActive ? "reactivated" : "deactivated"
    }.`,
  };
}