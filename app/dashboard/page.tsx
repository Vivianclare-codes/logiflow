import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("full_name, role")
    .eq("id", user.id)
    .single();

  if (error) {
    console.error("Profile fetch error:", error);
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-2">
      <h1 className="text-3xl font-bold">
        Welcome to LogiFlow
      </h1>

      <p>{profile?.full_name}</p>
      <p className="capitalize text-muted-foreground">
        {profile?.role}
      </p>
    </main>
  );
}