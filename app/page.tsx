import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

import {
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  CircleUserRound,
  Globe2,
  Menu,
  Package,
  Route,
  Truck,
  Users,
} from "lucide-react";

const features = [
  {
    title: "Shipments",
    description:
      "Create, manage, and track shipments from pickup to delivery.",
    icon: Package,
    tone: "blue",
  },
  {
    title: "Drivers",
    description:
      "Manage drivers and give them a focused workspace for their deliveries.",
    icon: Users,
    tone: "indigo",
  },
  {
    title: "Vehicles",
    description: "Keep track of your fleet and its availability.",
    icon: Truck,
    tone: "cyan",
  },
  {
    title: "Customers",
    description:
      "Keep customer and shipment information organized in one place.",
    icon: CircleUserRound,
    tone: "violet",
  },
];

const steps = [
  [
    "01",
    "Create shipment",
    "Add shipment details, pickup information, and destination.",
  ],
  [
    "02",
    "Assign driver & vehicle",
    "Dispatch the shipment to an available driver and vehicle.",
  ],
  [
    "03",
    "Track progress",
    "Follow status updates as the shipment moves through its journey.",
  ],
  [
    "04",
    "Complete delivery",
    "Record proof of delivery and complete the shipment.",
  ],
];

function Logo() {
  return (
    <Link
      href="/"
      className="flex items-center gap-2.5"
      aria-label="LogiFlow home"
    >
      <span className="flex size-9 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm shadow-blue-600/20">
        <Route className="size-5" strokeWidth={2.5} />
      </span>

      <span className="text-[17px] font-bold tracking-tight text-slate-950">
        LogiFlow
      </span>
    </Link>
  );
}

export default async function HomePage() {
  const supabase = await createClient();

  const { data: stats, error: statsError } = await supabase.rpc(
    "get_public_dashboard_stats"
  );

  if (statsError) {
    console.error("Landing page stats error:", statsError);
  }

  const dashboardStats = stats?.[0] ?? {
    active_shipments: 0,
    in_transit: 0,
    delivered: 0,
    pending_pickup: 0,
  };

  return (
    <main className="min-h-screen overflow-hidden bg-white text-slate-950">
      {/* Header */}
      <header className="border-b border-slate-200/80 bg-white">
        <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-10">
          <Logo />

          {/* Desktop navigation */}
          <nav
            className="hidden items-center gap-8 md:flex"
            aria-label="Main navigation"
          >
            <Link
              href="#features"
              className="text-sm font-medium text-slate-600 transition-colors hover:text-blue-600"
            >
              Features
            </Link>

            <Link
              href="#workflow"
              className="text-sm font-medium text-slate-600 transition-colors hover:text-blue-600"
            >
              How it works
            </Link>

            <Link
              href="/track"
              className="text-sm font-medium text-slate-600 transition-colors hover:text-blue-600"
            >
              Track shipment
            </Link>
          </nav>

          {/* Desktop actions */}
          <div className="hidden items-center gap-4 md:flex">
            <Link
              href="/login"
              className="text-sm font-semibold text-slate-700 transition-colors hover:text-blue-600"
            >
              Login
            </Link>

            <Link
              href="/login"
              className="inline-flex h-10 items-center justify-center rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white shadow-sm shadow-blue-600/20 transition hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
            >
              Get Started
              <ArrowRight className="ml-2 size-4" />
            </Link>
          </div>

          {/* Mobile navigation */}
          <details className="relative md:hidden">
            <summary className="flex size-10 cursor-pointer list-none items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:bg-slate-50 [&::-webkit-details-marker]:hidden">
              <Menu className="size-5" />
              <span className="sr-only">Open menu</span>
            </summary>

            <nav
              className="absolute right-0 top-14 z-50 w-64 rounded-2xl border border-slate-200 bg-white p-3 shadow-2xl"
              aria-label="Mobile navigation"
            >
              <Link
                href="#features"
                className="block rounded-xl px-4 py-3 text-sm font-medium text-slate-700 transition-colors hover:bg-blue-50 hover:text-blue-700"
              >
                Features
              </Link>

              <Link
                href="#workflow"
                className="block rounded-xl px-4 py-3 text-sm font-medium text-slate-700 transition-colors hover:bg-blue-50 hover:text-blue-700"
              >
                How it works
              </Link>

              <Link
                href="/track"
                className="block rounded-xl px-4 py-3 text-sm font-medium text-slate-700 transition-colors hover:bg-blue-50 hover:text-blue-700"
              >
                Track shipment
              </Link>

              <Link
                href="/login"
                className="mt-1 block rounded-xl px-4 py-3 text-sm font-medium text-slate-700 transition-colors hover:bg-blue-50 hover:text-blue-700"
              >
                Login
              </Link>

              <Link
                href="/login"
                className="mt-2 block rounded-xl bg-blue-600 px-4 py-3 text-center text-sm font-semibold text-white transition-colors hover:bg-blue-700"
              >
                Get Started
              </Link>
            </nav>
          </details>
        </div>
      </header>

      {/* Hero */}
      <section className="relative border-b border-slate-200 bg-slate-50/70">
        <div className="mx-auto grid max-w-7xl items-center gap-14 px-5 py-16 sm:px-8 sm:py-24 lg:grid-cols-[0.94fr_1.06fr] lg:gap-16 lg:px-10 lg:py-28">
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">
              <span className="size-1.5 rounded-full bg-blue-600" />
              Logistics operations, simplified
            </div>

            <h1 className="max-w-xl text-4xl font-bold tracking-[-0.045em] text-slate-950 sm:text-6xl sm:leading-[1.03]">
              Logistics operations,{" "}
              <span className="text-blue-600">without the chaos.</span>
            </h1>

            <p className="mt-6 max-w-lg text-base leading-7 text-slate-600 sm:text-lg">
              Manage shipments, coordinate drivers and vehicles, track
              deliveries, and keep your entire logistics operation in one
              place.
            </p>

            {/* Hero actions */}
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Link
                href="/login"
                className="inline-flex h-12 items-center justify-center rounded-lg bg-blue-600 px-5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
              >
                Get Started
                <ArrowRight className="ml-2 size-4" />
              </Link>

              <Link
                href="/login"
                className="inline-flex h-12 items-center justify-center rounded-lg border border-slate-300 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:border-blue-300 hover:bg-blue-50/50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
              >
                Explore the Demo
              </Link>

              <Link
                href="/track"
                className="inline-flex h-12 items-center justify-center rounded-lg border border-slate-300 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:border-blue-300 hover:bg-blue-50/50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
              >
                Track a Shipment
              </Link>
            </div>

            <div className="mt-8 flex flex-wrap gap-x-5 gap-y-2 text-xs font-medium text-slate-500">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="size-4 text-emerald-500" />
                One connected workspace
              </span>

              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="size-4 text-emerald-500" />
                Built for growing teams
              </span>
            </div>
          </div>

          {/* Product preview */}
          <div className="relative mx-auto w-full max-w-[620px] lg:ml-auto">
            <div className="absolute -inset-5 rounded-[2rem] bg-blue-100/50 blur-2xl" />

            <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-900/10">
              {/* Preview header */}
              <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3.5 sm:px-5">
                <div className="flex items-center gap-2">
                  <div className="flex size-7 items-center justify-center rounded-lg bg-blue-600 text-white">
                    <Route className="size-3.5" />
                  </div>

                  <span className="text-xs font-bold text-slate-800">
                    Operations overview
                  </span>
                </div>

                <span className="text-[10px] font-medium text-slate-400">
                  Live preview
                </span>
              </div>

              {/* Real preview metrics */}
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-4 sm:grid-cols-4 sm:p-5">
                {[
                  {
                    label: "Active shipments",
                    value: dashboardStats.active_shipments,
                  },
                  {
                    label: "In transit",
                    value: dashboardStats.in_transit,
                  },
                  {
                    label: "Delivered",
                    value: dashboardStats.delivered,
                  },
                  {
                    label: "Pending pickup",
                    value: dashboardStats.pending_pickup,
                  },
                ].map(({ label, value }) => (
                  <div
                    key={label}
                    className="rounded-xl border border-slate-200 bg-white p-3"
                  >
                    <p className="text-[10px] font-medium text-slate-500">
                      {label}
                    </p>

                    <p className="mt-2 text-xl font-bold tracking-tight text-slate-950">
                      {value}
                    </p>

                    <p className="mt-1 text-[9px] text-slate-400">
                      Live from LogiFlow
                    </p>
                  </div>
                ))}
              </div>

              {/* Preview workflow */}
              <div className="p-4 sm:p-5">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-slate-900">
                      Shipment workflow
                    </p>

                    <p className="mt-0.5 text-[10px] text-slate-500">
                      From pickup to delivery
                    </p>
                  </div>

                  <span className="text-[10px] font-semibold text-blue-600">
                    Preview
                  </span>
                </div>

                <div className="space-y-2">
                  {[
                    [
                      "Shipment created",
                      "Customer and delivery details",
                    ],
                    [
                      "Driver assigned",
                      "Driver + vehicle connected",
                    ],
                    [
                      "In transit",
                      "Shipment progress updated",
                    ],
                    [
                      "Delivered",
                      "Proof of delivery recorded",
                    ],
                  ].map(([title, description], index) => (
                    <div
                      key={title}
                      className="flex items-center gap-3 rounded-lg border border-slate-100 bg-slate-50/70 px-3 py-3"
                    >
                      <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                        <span className="text-[10px] font-bold">
                          {index + 1}
                        </span>
                      </div>

                      <div className="min-w-0">
                        <p className="text-[10px] font-bold text-slate-800">
                          {title}
                        </p>

                        <p className="truncate text-[10px] text-slate-500">
                          {description}
                        </p>
                      </div>

                      <CheckCircle2 className="ml-auto size-4 shrink-0 text-slate-300" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section
        id="features"
        className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-28 lg:px-10"
      >
        <div className="max-w-2xl">
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-blue-600">
            Everything in sync
          </p>

          <h2 className="mt-3 text-3xl font-bold tracking-[-0.035em] text-slate-950 sm:text-4xl">
            Everything your logistics operation needs.
          </h2>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {features.map(
            ({ title, description, icon: Icon, tone }) => (
              <div
                key={title}
                className="group border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg hover:shadow-blue-900/5"
              >
                <div
                  className={`mb-8 flex size-11 items-center justify-center rounded-xl ${
                    tone === "blue"
                      ? "bg-blue-100 text-blue-600"
                      : tone === "indigo"
                        ? "bg-indigo-100 text-indigo-600"
                        : tone === "cyan"
                          ? "bg-cyan-100 text-cyan-600"
                          : "bg-violet-100 text-violet-600"
                  }`}
                >
                  <Icon className="size-5" />
                </div>

                <h3 className="text-base font-bold text-slate-900">
                  {title}
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {description}
                </p>

                <ChevronRight className="mt-6 size-4 text-slate-300 transition group-hover:translate-x-1 group-hover:text-blue-600" />
              </div>
            )
          )}
        </div>
      </section>

      {/* Workflow */}
      <section
        id="workflow"
        className="border-y border-slate-200 bg-slate-50/70"
      >
        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-28 lg:px-10">
          <div className="max-w-2xl">
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-blue-600">
              How LogiFlow works
            </p>

            <h2 className="mt-3 text-3xl font-bold tracking-[-0.035em] text-slate-950 sm:text-4xl">
              From pickup to delivery, connected.
            </h2>

            <p className="mt-4 text-base leading-7 text-slate-600">
              From creating a shipment to completing the delivery, every step
              stays connected.
            </p>
          </div>

          <div className="mt-12 grid gap-8 md:grid-cols-4">
            {steps.map(([number, title, description], index) => (
              <div key={number} className="relative">
                <div className="mb-5 flex items-center gap-3">
                  <span className="text-sm font-bold text-blue-600">
                    {number}
                  </span>

                  {index < 3 && (
                    <div className="hidden h-px flex-1 bg-blue-200 md:block" />
                  )}
                </div>

                <h3 className="text-base font-bold text-slate-900">
                  {title}
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-28 lg:px-10">
        <div className="relative overflow-hidden bg-slate-950 px-6 py-14 text-center sm:px-12 sm:py-20">
          <div className="absolute -right-20 -top-32 size-80 rounded-full bg-blue-600/20 blur-3xl" />

          <div className="relative mx-auto max-w-2xl">
            <Globe2 className="mx-auto mb-5 size-7 text-blue-400" />

            <h2 className="text-3xl font-bold tracking-[-0.035em] text-white sm:text-4xl">
              Ready to simplify your logistics operations?
            </h2>

            <p className="mx-auto mt-4 max-w-lg text-base leading-7 text-slate-300">
              Bring shipments, drivers, vehicles, and customers together in
              one system.
            </p>

            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row sm:flex-wrap">
              <Link
                href="/login"
                className="inline-flex h-12 items-center justify-center rounded-lg bg-blue-600 px-5 text-sm font-semibold text-white transition hover:bg-blue-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400"
              >
                Get Started
                <ArrowRight className="ml-2 size-4" />
              </Link>

              <Link
                href="/login"
                className="inline-flex h-12 items-center justify-center rounded-lg border border-slate-700 px-5 text-sm font-semibold text-white transition hover:border-slate-500 hover:bg-white/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400"
              >
                Explore the Demo
              </Link>

              <Link
                href="/track"
                className="inline-flex h-12 items-center justify-center rounded-lg border border-slate-700 px-5 text-sm font-semibold text-white transition hover:border-slate-500 hover:bg-white/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400"
              >
                Track a Shipment
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200">
        <div className="mx-auto flex max-w-7xl flex-col gap-10 px-5 py-12 sm:px-8 lg:flex-row lg:justify-between lg:px-10">
          <div className="max-w-xs">
            <Logo />

            <p className="mt-4 text-sm leading-6 text-slate-500">
              Manage every mile of your logistics operation from one connected
              workspace.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-12 sm:gap-20">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-900">
                Product
              </p>

              <div className="mt-4 space-y-3">
                <Link
                  href="#features"
                  className="block text-sm text-slate-500 hover:text-blue-600"
                >
                  Features
                </Link>

                <Link
                  href="#workflow"
                  className="block text-sm text-slate-500 hover:text-blue-600"
                >
                  How it works
                </Link>
              </div>
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-900">
                Access
              </p>

              <div className="mt-4 space-y-3">
                <Link
                  href="/track"
                  className="block text-sm text-slate-500 hover:text-blue-600"
                >
                  Track shipment
                </Link>

                <Link
                  href="/login"
                  className="block text-sm text-slate-500 hover:text-blue-600"
                >
                  Login
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-7xl border-t border-slate-100 px-5 py-6 sm:px-8 lg:px-10">
          <p className="text-xs text-slate-400">
            © 2026 LogiFlow. All rights reserved.
          </p>
        </div>
      </footer>
    </main>
  );
}