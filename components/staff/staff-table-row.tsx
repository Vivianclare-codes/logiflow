"use client";

import { useState } from "react";

import EditStaffForm from "@/components/staff/edit-staff-form";
import StaffAccountActions from "@/components/staff/staff-account-actions";

type StaffTableRowProps = {
  member: {
    id: string;
    full_name: string | null;
    role: string | null;
    is_active: boolean;
    created_at: string;
    email: string;
    phone: string | null;
  };
  isCurrentUser: boolean;
};

export default function StaffTableRow({
  member,
  isCurrentUser,
}: StaffTableRowProps) {
  const [editing, setEditing] = useState(false);

  if (editing) {
    return (
      <tr>
        <td colSpan={6} className="px-6 py-5">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
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
        </td>
      </tr>
    );
  }

  return (
    <tr className="transition hover:bg-slate-50/70">
      <td className="px-6 py-4">
        <p className="font-medium text-slate-900">
          {member.full_name ?? "Unnamed user"}
        </p>
      </td>

      <td className="px-6 py-4 text-sm text-slate-600">
        {member.email}
      </td>

      <td className="px-6 py-4">
        <span
          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${getRoleClasses(
            member.role ?? ""
          )}`}
        >
          {formatRole(member.role ?? "unknown")}
        </span>
      </td>

      <td className="px-6 py-4">
        <span
          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${
            member.is_active
              ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
              : "bg-slate-100 text-slate-500 ring-slate-200"
          }`}
        >
          {member.is_active ? "Active" : "Inactive"}
        </span>
      </td>

      <td className="px-6 py-4 text-sm text-slate-500">
        {formatDate(member.created_at)}
      </td>

      <td className="px-6 py-4">
        <div className="flex items-start justify-end gap-2">
          {!isCurrentUser && (
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Edit
            </button>
          )}

          <StaffAccountActions
            staffId={member.id}
            isActive={member.is_active}
            isCurrentUser={isCurrentUser}
          />
        </div>
      </td>
    </tr>
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