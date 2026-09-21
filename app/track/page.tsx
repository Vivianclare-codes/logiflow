import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Route } from "lucide-react";

export default async function TrackPage({
  searchParams,
}: {
  searchParams: Promise<{ tracking?: string }>;
}) {
  const params = await searchParams;
  const tracking = params.tracking?.trim();

  if (tracking) {
    redirect(`/track/${encodeURIComponent(tracking.toUpperCase())}`);
  }

  return (
    <main className="min-h-screen bg-white text-slate-950">
      {/* Header */}
      <header className="border-b border-slate-200/80 bg-white">
        <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-10">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="flex size-9 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm shadow-blue-600/20">
              <Route className="size-5" strokeWidth={2.5} />
            </span>

            <span className="text-[17px] font-bold tracking-tight text-slate-950">
              LogiFlow
            </span>
          </Link>

          <Link
            href="/login"
            className="text-sm font-semibold text-slate-700 transition-colors hover:text-blue-600"
          >
            Staff Login
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-slate-200 bg-slate-50/70">
        <div className="absolute -right-32 -top-32 size-96 rounded-full bg-blue-100/60 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-28 lg:px-10">
          <div className="mx-auto max-w-2xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">
              <span className="size-1.5 rounded-full bg-blue-600" />
              Shipment tracking
            </div>

            <h1 className="text-4xl font-bold tracking-[-0.045em] text-slate-950 sm:text-5xl">
              Track your shipment.
            </h1>

            <p className="mx-auto mt-5 max-w-lg text-base leading-7 text-slate-600 sm:text-lg">
              Enter your tracking number to see the latest status and shipment
              history.
            </p>

            <div className="mx-auto mt-8 max-w-xl rounded-2xl border border-slate-200 bg-white p-3 shadow-xl shadow-slate-900/5 sm:p-4">
              <form action="/track" method="GET" className="flex flex-col gap-3 sm:flex-row">
                <input
                  id="tracking"
                  name="tracking"
                  placeholder="Enter tracking number e.g. LG-0025"
                  className="h-12 min-w-0 flex-1 rounded-lg border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                />

                <button
                  type="submit"
                  className="inline-flex h-12 items-center justify-center rounded-lg bg-blue-600 px-5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                >
                  Track shipment
                  <ArrowRight className="ml-2 size-4" />
                </button>
              </form>
            </div>

            <p className="mt-5 text-xs font-medium text-slate-400">
              No account required.
            </p>
          </div>
        </div>
      </section>

      {/* Simple reassurance */}
      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20 lg:px-10">
        <div className="mx-auto max-w-xl text-center">
          <div className="mx-auto flex size-11 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
            <Route className="size-5" />
          </div>

          <h2 className="mt-5 text-xl font-bold tracking-tight text-slate-950">
            Stay updated from pickup to delivery.
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-600">
            Your shipment timeline shows the progress recorded by the
            logistics team.
          </p>
        </div>
      </section>
    </main>
  );
}