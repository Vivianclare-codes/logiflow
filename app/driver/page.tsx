import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

export default async function DriverEntryPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, is_active")
    .eq("id", user.id)
    .single();

  if (!profile) {
    await supabase.auth.signOut();
    redirect("/login");
  }

  if (!profile.is_active) {
    await supabase.auth.signOut();
    redirect("/login");
  }

  if (profile.role !== "driver") {
    redirect("/dashboard");
  }

  redirect("/driver/dashboard");
}