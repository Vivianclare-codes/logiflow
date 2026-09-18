"use client";

import { useActionState, useState } from "react";

import {
  updateStaff,
  type UpdateStaffState,
} from "@/app/staff/actions";

type StaffMember = {
  id: string;
  full_name: string | null;
  role: string | null;
  is_active: boolean;
  phone?: string | null;
};

type EditStaffFormProps = {
  staff: StaffMember;
  onCancel: () => void;
};

const initialState: UpdateStaffState = {
  success: false,
  message: "",
};

export default function EditStaffForm({
  staff,
  onCancel,
}: EditStaffFormProps) {
  const [state, formAction, isPending] = useActionState(
    updateStaff,
    initialState
  );

  const [role, setRole] = useState(staff.role ?? "dispatcher");

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="staffId" value={staff.id} />

      <div>
        <label
          htmlFor={`fullName-${staff.id}`}
          className="mb-2 block text-sm font-medium text-slate-900"
        >
          Full name
        </label>

        <input
          id={`fullName-${staff.id}`}
          name="fullName"
          type="text"
          defaultValue={staff.full_name ?? ""}
          required
          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
        />

        {state.errors?.fullName?.map((error) => (
          <p key={error} className="mt-1 text-sm text-red-600">
            {error}
          </p>
        ))}
      </div>

      <div>
        <label
          htmlFor={`role-${staff.id}`}
          className="mb-2 block text-sm font-medium text-slate-900"
        >
          Role
        </label>

        <select
          id={`role-${staff.id}`}
          name="role"
          value={role}
          onChange={(event) => setRole(event.target.value)}
          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
        >
          <option value="driver">Driver</option>
          <option value="dispatcher">Dispatcher</option>
          <option value="admin">Administrator</option>
        </select>

        {state.errors?.role?.map((error) => (
          <p key={error} className="mt-1 text-sm text-red-600">
            {error}
          </p>
        ))}
      </div>

      {role === "driver" && (
        <div>
          <label
            htmlFor={`phone-${staff.id}`}
            className="mb-2 block text-sm font-medium text-slate-900"
          >
            Phone number
          </label>

          <input
            id={`phone-${staff.id}`}
            name="phone"
            type="tel"
            defaultValue={staff.phone ?? ""}
            required
            placeholder="08012345678"
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
          />

          {state.errors?.phone?.map((error) => (
            <p key={error} className="mt-1 text-sm text-red-600">
              {error}
            </p>
          ))}
        </div>
      )}

      {state.message && (
        <div
          className={`rounded-xl border px-4 py-3 text-sm ${
            state.success
              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
              : "border-red-200 bg-red-50 text-red-700"
          }`}
        >
          {state.message}
        </div>
      )}

      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={isPending}
          className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? "Saving..." : "Save changes"}
        </button>
      </div>
    </form>
  );
}