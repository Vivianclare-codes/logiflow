"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  CheckCircle2,
  LockKeyhole,
  Mail,
  Route,
} from "lucide-react";
import { supabase } from "@/lib/supabase/client";

function Logo() {
  return (
    <div className="flex items-center gap-2.5" aria-label="LogiFlow">
      <span className="flex size-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm shadow-blue-600/20">
        <Route className="size-5" strokeWidth={2.5} />
      </span>

      <span className="text-lg font-bold tracking-tight text-slate-950">
        LogiFlow
      </span>
    </div>
  );
}

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");

    if (!email || !password) {
      setError("Enter your work email and password to continue.");
      return;
    }

    setIsLoading(true);

    const { error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (loginError) {
      setError(loginError.message);
      setIsLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <main className="min-h-screen bg-white text-slate-950">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col lg:grid lg:grid-cols-[0.95fr_1.05fr]">
        {/* Left side - desktop only */}
        <section className="relative hidden overflow-hidden border-r border-slate-200 bg-slate-50 px-10 py-12 lg:flex lg:flex-col lg:justify-between xl:px-16">
          <div
            aria-hidden="true"
            className="absolute -left-28 -top-32 size-96 rounded-full bg-blue-100/70 blur-3xl"
          />

          <div
            aria-hidden="true"
            className="absolute -bottom-40 -right-20 size-96 rounded-full bg-indigo-100/50 blur-3xl"
          />

          <div className="relative">
            <Logo />

            <div className="mt-24 max-w-md">
              <p className="mb-5 text-sm font-semibold uppercase tracking-[0.16em] text-blue-600">
                Operations, connected
              </p>

              <h1 className="text-5xl font-bold leading-[1.05] tracking-[-0.05em] text-slate-950 xl:text-6xl">
                Keep every delivery moving.
              </h1>

              <p className="mt-6 max-w-sm text-base leading-7 text-slate-600">
                Manage shipments, coordinate drivers, and keep your entire
                logistics operation moving from one focused workspace.
              </p>
            </div>
          </div>

          <div className="relative space-y-4 text-sm text-slate-600">
            {[
              "Shipments and deliveries in one place",
              "Clear workspaces for every team",
              "Built for dependable daily operations",
            ].map((item) => (
              <div key={item} className="flex items-center gap-3">
                <CheckCircle2 className="size-4 shrink-0 text-blue-600" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Login section */}
        <section className="flex min-h-screen flex-col justify-center px-5 py-10 sm:px-10 lg:min-h-0 lg:px-16 xl:px-24">
          <div className="mx-auto w-full max-w-md">
            {/* Mobile logo */}
            <div className="mb-10 lg:hidden">
              <Logo />
            </div>

            <div className="mb-8">
              <div className="mb-6 flex size-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <LockKeyhole className="size-5" />
              </div>

              <h2 className="text-3xl font-bold tracking-[-0.035em] text-slate-950">
                Welcome back
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                Sign in to your LogiFlow workspace.
              </p>
            </div>

            <form onSubmit={handleLogin} className="flex flex-col gap-5">
              {/* Email */}
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="email"
                  className="text-sm font-semibold text-slate-700"
                >
                  Work email
                </label>

                <div className="relative">
                  <Mail
                    aria-hidden="true"
                    className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@company.com"
                    required
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    disabled={isLoading}
                    className="h-12 w-full rounded-md border border-slate-300 bg-white pl-10 pr-3 text-base text-slate-950 shadow-none outline-none placeholder:text-slate-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 disabled:cursor-not-allowed disabled:bg-slate-50"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="password"
                  className="text-sm font-semibold text-slate-700"
                >
                  Password
                </label>

                <div className="relative">
                  <LockKeyhole
                    aria-hidden="true"
                    className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    id="password"
                    type="password"
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    required
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    disabled={isLoading}
                    className="h-12 w-full rounded-md border border-slate-300 bg-white pl-10 pr-3 text-base text-slate-950 shadow-none outline-none placeholder:text-slate-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 disabled:cursor-not-allowed disabled:bg-slate-50"
                  />
                </div>
              </div>

              {/* Error */}
              {error && (
                <div
                  role="alert"
                  aria-live="polite"
                  className="rounded-md border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700"
                >
                  {error}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={isLoading}
                className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-blue-600 text-sm font-semibold text-white shadow-sm shadow-blue-600/20 transition hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isLoading ? "Signing in..." : "Log in"}

                {!isLoading && (
                  <ArrowRight
                    aria-hidden="true"
                    className="size-4"
                  />
                )}
              </button>
            </form>

            <p className="mt-8 border-t border-slate-200 pt-6 text-center text-xs leading-5 text-slate-500">
              Authorized staff only. If you need access, contact your LogiFlow
              administrator.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}