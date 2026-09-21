import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CheckCircle2, Route } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

type PageProps = {
  params: Promise<{
    trackingNumber: string;
  }>;
};

function formatStatus(status: string) {
  return status.replaceAll("_", " ");
}

export default async function TrackingResultPage({
  params,
}: PageProps) {
  const { trackingNumber } = await params;

  const supabase = await createClient();

  const { data: shipment, error: shipmentError } =
    await supabase.rpc("get_public_shipment", {
      p_tracking_number: trackingNumber.toUpperCase(),
    });

  if (shipmentError) {
    console.error("Public shipment lookup error:", shipmentError);
    notFound();
  }

  const publicShipment = shipment?.[0];

  if (!publicShipment) {
    notFound();
  }

  const { data: events, error: eventsError } =
    await supabase.rpc("get_public_shipment_events", {
      p_tracking_number: trackingNumber.toUpperCase(),
    });

  if (eventsError) {
    console.error("Public shipment events error:", eventsError);
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
            href="/track"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-600 transition-colors hover:text-blue-600"
          >
            <ArrowLeft className="size-4" />
            Track another
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-5 py-10 sm:px-8 sm:py-16 lg:px-10">
        {/* Heading */}
        <div className="mb-8">
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-blue-600">
            Shipment tracking
          </p>

          <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-[-0.035em] text-slate-950 sm:text-4xl">
                {publicShipment.tracking_number}
              </h1>

              <p className="mt-2 text-sm text-slate-500">
                Current shipment status
              </p>
            </div>

            <span className="inline-flex w-fit items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-sm font-semibold capitalize text-blue-700">
              <span className="size-1.5 rounded-full bg-blue-600" />
              {formatStatus(publicShipment.status)}
            </span>
          </div>
        </div>

        {/* Route card */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 bg-slate-50/70 px-6 py-4">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Shipment route
            </p>
          </div>

          <div className="grid sm:grid-cols-2">
            <div className="border-b border-slate-200 p-6 sm:border-b-0 sm:border-r">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                Pickup
              </p>

              <p className="mt-2 text-base font-bold text-slate-900">
                {publicShipment.pickup_city}
              </p>
            </div>

            <div className="p-6">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                Destination
              </p>

              <p className="mt-2 text-base font-bold text-slate-900">
                {publicShipment.destination_city}
              </p>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <section className="mt-12">
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-blue-600">
            Shipment history
          </p>

          <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-950">
            Delivery timeline
          </h2>

          <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            {events && events.length > 0 ? (
              <div className="space-y-0">
                {events.map(
                  (
                    event: {
                      status: string;
                      description: string;
                      created_at: string;
                    },
                    index: number
                  ) => {
                    const isLast = index === events.length - 1;

                    return (
                      <div
                        key={`${event.created_at}-${index}`}
                        className="relative flex gap-4"
                      >
                        {!isLast && (
                          <div className="absolute left-[11px] top-8 h-[calc(100%-8px)] w-px bg-blue-100" />
                        )}

                        <div className="relative z-10 flex size-6 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                          <CheckCircle2 className="size-3.5" />
                        </div>

                        <div className={isLast ? "pb-0" : "pb-8"}>
                          <p className="font-bold capitalize text-slate-900">
                            {formatStatus(event.status)}
                          </p>

                          <p className="mt-1 text-sm leading-6 text-slate-600">
                            {event.description}
                          </p>

                          <p className="mt-2 text-xs font-medium text-slate-400">
                            {new Date(event.created_at).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    );
                  }
                )}
              </div>
            ) : (
              <p className="text-sm text-slate-500">
                No shipment history is available yet.
              </p>
            )}
          </div>
        </section>

        {/* CTA */}
        <div className="mt-12 rounded-2xl border border-blue-100 bg-blue-50/60 p-6 text-center sm:p-8">
          <p className="text-sm font-semibold text-blue-900">
            Need to track another shipment?
          </p>

          <Link
            href="/track"
            className="mt-4 inline-flex h-10 items-center justify-center rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white shadow-sm shadow-blue-600/20 transition hover:bg-blue-700"
          >
            Track another shipment
            <ArrowLeft className="ml-2 size-4 rotate-180" />
          </Link>
        </div>
      </div>
    </main>
  );
}