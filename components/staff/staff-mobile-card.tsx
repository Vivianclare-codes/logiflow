"use client";

import { useState } from "react";

import EditStaffForm from "@/components/staff/edit-staff-form";
import StaffAccountActions from "@/components/staff/staff-account-actions";

type StaffMobileCardProps = {
  member: {
    id: string;
    full_name: string | null;
    role: string | null;
    is_active: boolean;
    created_at: string;
    email: string;
    phone: string | null;
    driverStatus?: string;
  };
  isCurrentUser: boolean;
};

export default function StaffMobileCard({
  member,
  isCurrentUser,
}: StaffMobileCardProps) {
  const [editing, setEditing] = useState(false);

  if (editing) {
    return (
      <div className="px-5 py-5">
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <div className="mb-5">
            <h3 className="text-sm font-semibold text-slate-950">
              Edit staff member
            </h3>

            <p className="mt-1 text-xs text-slate-500">
              Update {member.full_name ?? "this staff member"}.
            </p>
          </div>

          <EditStaffForm
            staff={{
              id: member.id,
              full_name: member.full_name,
              role: member.role,
              is_active: member.is_active,
              phone: member.phone,
            }}
            onCancel={() => setEditing(false)}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="px-5 py-5">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="font-medium text-slate-900">
            {member.full_name ?? "Unnamed user"}
          </p>

          <p className="mt-1 break-all text-sm text-slate-500">
            {member.email}
          </p>
        </div>

        <span
          className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${getRoleClasses(
            member.role ?? ""
          )}`}
        >
          {formatRole(member.role ?? "unknown")}
        </span>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-slate-50 p-3">
          <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
            Account
          </p>

          <p className="mt-1 text-sm font-medium text-slate-700">
            {member.is_active ? "Active" : "Inactive"}
          </p>
        </div>

        <div className="rounded-xl bg-slate-50 p-3">
          <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
            Joined
          </p>

          <p className="mt-1 text-sm font-medium text-slate-700">
            {formatDate(member.created_at)}
          </p>
        </div>
      </div>

      {member.role === "driver" && (
        <div className="mt-3 rounded-xl bg-slate-50 p-3">
          <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
            Driver status
          </p>

          <p className="mt-1 text-sm font-medium text-slate-700">
            {formatDriverStatus(member.driverStatus)}
          </p>
        </div>
      )}

      <div className="mt-4 flex items-center justify-end gap-2">
        {!isCurrentUser && (
          <>
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Edit
            </button>

            <StaffAccountActions
              staffId={member.id}
              isActive={member.is_active}
              isCurrentUser={false}
            />
          </>
        )}

        {isCurrentUser && (
          <span className="text-xs text-slate-400">
            Current account
          </span>
        )}
      </div>
    </div>
  );
}

function formatRole(role: string) {
  switch (role) {
    case "admin":
      return "Administrator";
    case "dispatcher":
      return "Dispatcher";
    case "driver":
      return "Driver";
    default:
      return role;
  }
}

function getRoleClasses(role: string) {
  switch (role) {
    case "admin":
      return "bg-purple-50 text-purple-700 ring-purple-200";
    case "dispatcher":
      return "bg-blue-50 text-blue-700 ring-blue-200";
    case "driver":
      return "bg-amber-50 text-amber-700 ring-amber-200";
    default:
      return "bg-slate-50 text-slate-600 ring-slate-200";
  }
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en-NG", {
    dateStyle: "medium",
  }).format(new Date(date));
}

function formatDriverStatus(status: string | undefined) {
  switch (status) {
    case "available":
      return "Available";
    case "busy":
      return "Busy";
    case "off_duty":
      return "Off duty";
    default:
      return "No driver record";
  }
}