"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Boxes, LockKeyhole, Mail } from "lucide-react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { supabase } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      return;
    }

    router.push("/dashboard");
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-muted/30 px-4 py-10 sm:px-6">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(15,23,42,0.08),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(30,64,175,0.08),transparent_32%)]"
      />

      <div className="relative flex w-full max-w-md flex-col items-center gap-6">
        <div className="flex items-center gap-2.5 text-primary">
          <div className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
            <Boxes aria-hidden="true" />
          </div>
          <span className="text-xl font-semibold tracking-tight">
            LogiFlow
          </span>
        </div>

        <Card className="w-full border-border/70 bg-card/95 shadow-xl shadow-slate-950/5 backdrop-blur-sm">
          <CardHeader className="gap-2 px-7 pt-7 sm:px-8 sm:pt-8">
            <div className="mb-3 flex size-11 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
              <LockKeyhole aria-hidden="true" />
            </div>

            <CardTitle className="text-2xl tracking-tight">
              Sign in to LogiFlow
            </CardTitle>

            <CardDescription>
              Enter your staff credentials to access operations.
            </CardDescription>
          </CardHeader>

          <CardContent className="px-7 sm:px-8">
            <form
              onSubmit={handleLogin}
              className="flex flex-col gap-5"
            >
              <div className="flex flex-col gap-2">
                <Label htmlFor="email">Work email</Label>

                <div className="relative">
                  <Mail
                    aria-hidden="true"
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  />

                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@company.com"
                    required
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="password">Password</Label>

                <div className="relative">
                  <LockKeyhole
                    aria-hidden="true"
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  />

                  <Input
                    id="password"
                    type="password"
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    required
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {error && (
                <Alert variant="destructive" aria-live="polite">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button type="submit" className="h-11 w-full">
                Log in
                <ArrowRight aria-hidden="true" data-icon="inline-end" />
              </Button>
            </form>
          </CardContent>

          <CardFooter className="justify-center px-7 pb-7 pt-1 sm:px-8 sm:pb-8">
            <p className="text-center text-xs leading-relaxed text-muted-foreground">
              Authorized staff only. If you need access, contact your
              LogiFlow administrator.
            </p>
          </CardFooter>
        </Card>

        <p className="text-xs text-muted-foreground">
          Operations management, connected.
        </p>
      </div>
    </main>
  );
}