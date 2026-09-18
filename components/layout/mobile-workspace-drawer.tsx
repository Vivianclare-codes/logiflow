"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import {
  Activity,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  Route,
  Truck,
  UserRound,
  Users,
  X,
} from "lucide-react";

import { supabase } from "@/lib/supabase/client";

const navigation = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Shipments",
    href: "/shipments",
    icon: Package,
  },
  {
    label: "Customers",
    href: "/customers",
    icon: Users,
  },
  {
    label: "Drivers",
    href: "/drivers",
    icon: UserRound,
  },
  {
    label: "Vehicles",
    href: "/vehicles",
    icon: Truck,
  },
    {
    label: "Activity",
    href: "/activity",
    icon: Activity,
  },
];

function Logo() {
  return (
    <Link
      href="/dashboard"
      className="flex items-center gap-2.5"
      aria-label="LogiFlow dashboard"
    >
      <span className="flex size-9 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm shadow-blue-600/20">
        <Route
          className="size-5"
          strokeWidth={2.5}
        />
      </span>

      <span className="text-[17px] font-bold tracking-tight text-slate-950">
        LogiFlow
      </span>
    </Link>
  );
}

export function MobileWorkspaceDrawer({
  activeHref,
}: {
  activeHref: string;
}) {
  const router = useRouter();

  const [menuOpen, setMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] =
    useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!menuOpen) {
      document.body.style.overflow = "";
      return;
    }

    document.body.style.overflow = "hidden";

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setMenuOpen(false);
      }
    }

    document.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      document.body.style.overflow = "";
      document.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [menuOpen]);

  async function handleLogout() {
    setIsLoggingOut(true);

    const { error } =
      await supabase.auth.signOut();

    if (error) {
      console.error(
        "Logout error:",
        error
      );

      setIsLoggingOut(false);
      return;
    }

    router.push("/login");
    router.refresh();
  }

  const drawer = (
    <>
      {/* Mobile overlay */}
      {menuOpen && (
        <div
          className="fixed inset-0 z-[9998] bg-slate-950/30 lg:hidden"
          onClick={() => setMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-[9999] w-[min(19rem,88vw)] border-r border-slate-200 bg-white px-5 py-6 shadow-2xl transition-transform lg:hidden ${
          menuOpen
            ? "translate-x-0"
            : "-translate-x-full"
        }`}
        aria-label="Mobile navigation"
        aria-hidden={!menuOpen}
      >
        <div className="flex items-center justify-between">
          <Logo />

          <button
            type="button"
            onClick={() => setMenuOpen(false)}
            className="flex size-10 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-50"
            aria-label="Close menu"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="mt-12">
          <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
            Workspace
          </p>

          <nav
            className="space-y-1"
            aria-label="Staff navigation"
          >
            {navigation.map(
              ({
                label,
                href,
                icon: Icon,
              }) => {
                const isActive =
                  href === activeHref;

                return (
                  <Link
                    key={label}
                    href={href}
                    onClick={() =>
                      setMenuOpen(false)
                    }
                    className={`flex min-h-11 w-full items-center gap-3 rounded-lg px-3 text-sm font-semibold transition ${
                      isActive
                        ? "bg-blue-50 text-blue-700"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-950"
                    }`}
                  >
                    <Icon
                      className={`size-[18px] ${
                        isActive
                          ? "text-blue-600"
                          : "text-slate-400"
                      }`}
                    />

                    {label}
                  </Link>
                );
              }
            )}
          </nav>
        </div>

        <div className="mt-8 border-t border-slate-100 pt-5">
          <button
            type="button"
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="flex min-h-11 w-full items-center gap-3 rounded-lg px-3 text-sm font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-950 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <LogOut className="size-[18px] text-slate-400" />

            {isLoggingOut
              ? "Logging out..."
              : "Log out"}
          </button>
        </div>
      </aside>
    </>
  );

  return (
    <>
      {/* Menu button stays in the header */}
      <button
        type="button"
        onClick={() => setMenuOpen(true)}
        className="flex size-10 items-center justify-center rounded-lg border border-slate-200 text-slate-700"
        aria-label="Open menu"
        aria-expanded={menuOpen}
      >
        <Menu className="size-5" />
      </button>

      {/* Drawer is rendered at document.body level */}
      {mounted &&
        createPortal(
          drawer,
          document.body
        )}
    </>
  );
}