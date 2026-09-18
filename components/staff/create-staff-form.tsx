"use client";

import { useActionState, useState } from "react";
import Link from "next/link";

import {
  createStaff,
  type CreateStaffState,
} from "@/app/staff/actions";

const initialState: CreateStaffState = {
  success: false,
  message: "",
};

export default function CreateStaffForm() {
  const [state, formAction, isPending] = useActionState(
    createStaff,
    initialState
  );

  const [role, setRole] = useState("driver");

  return (
    <form action={formAction} className="space-y-5">
      <div>
        <label
          htmlFor="fullName"
          className="mb-2 block text-sm font-medium text-slate-900"
        >
          Full name
        </label>

        <input
          id="fullName"
          name="fullName"
          type="text"
          placeholder="e.g. Chinedu Okafor"
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
          htmlFor="email"
          className="mb-2 block text-sm font-medium text-slate-900"
        >
          Email address
        </label>

        <input
          id="email"
          name="email"
          type="email"
          placeholder="driver@logiflow.test"
          required
          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
        />

        {state.errors?.email?.map((error) => (
          <p key={error} className="mt-1 text-sm text-red-600">
            {error}
          </p>
        ))}
      </div>

      <div>
        <label
          htmlFor="password"
          className="mb-2 block text-sm font-medium text-slate-900"
        >
          Temporary password
        </label>

        <input
          id="password"
          name="password"
          type="password"
          placeholder="At least 8 characters"
          required
          minLength={8}
          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
        />

        <p className="mt-1 text-xs text-slate-500">
          Give the staff member this password securely.
        </p>

        {state.errors?.password?.map((error) => (
          <p key={error} className="mt-1 text-sm text-red-600">
            {error}
          </p>
        ))}
      </div>

      <div>
        <label
          htmlFor="role"
          className="mb-2 block text-sm font-medium text-slate-900"
        >
          Role
        </label>

        <select
          id="role"
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
            htmlFor="phone"
            className="mb-2 block text-sm font-medium text-slate-900"
          >
            Phone number
          </label>

          <input
            id="phone"
            name="phone"
            type="tel"
            placeholder="08012345678"
            required
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

      <div className="flex items-center justify-end gap-3">
        <Link
          href="/staff"
          className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
        >
          Cancel
        </Link>

        <button
          type="submit"
          disabled={isPending}
          className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? "Creating..." : "Create staff"}
        </button>
      </div>
    </form>
  );
}