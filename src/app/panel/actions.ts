"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function signOut(): Promise<never> {
  const supabase = await createClient();
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error("signOut failed", error.message);
  }
  // Aunque falle el aviso al servidor, se borran las cookies y se sale igual.
  redirect("/login");
}
