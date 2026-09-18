"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { toggleStaffActive } from "@/app/staff/actions";

type StaffAccountActionsProps = {
  staffId: string;
  isActive: boolean;
  isCurrentUser: boolean;
};

export default function StaffAccountActions({
  staffId,
  isActive,
  isCurrentUser,
}: StaffAccountActionsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState("");

  function handleToggle() {
    const confirmed = window.confirm(
      isActive
        ? "Are you sure you want to deactivate this staff account?"
        : "Are you sure you want to reactivate this staff account?"
    );

    if (!confirmed) {
      return;
    }

    setMessage("");

    startTransition(async () => {
      const result = await toggleStaffActive(staffId, !isActive);

      if (!result.success) {
        setMessage(result.message);
        return;
      }

      router.refresh();
    });
  }

  if (isCurrentUser) {
    return (
      <span className="text-xs text-slate-400">
        Current account
      </span>
    );
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <button
        type="button"
        onClick={handleToggle}
        disabled={isPending}
        className={`rounded-lg px-3 py-2 text-xs font-medium transition disabled:cursor-not-allowed disabled:opacity-60 ${
          isActive
            ? "border border-red-200 bg-white text-red-600 hover:bg-red-50"
            : "border border-emerald-200 bg-white text-emerald-700 hover:bg-emerald-50"
        }`}
      >
        {isPending
          ? "Saving..."
          : isActive
            ? "Deactivate"
            : "Reactivate"}
      </button>

      {message && (
        <p className="max-w-52 text-right text-xs text-red-600">
          {message}
        </p>
      )}
    </div>
  );
}