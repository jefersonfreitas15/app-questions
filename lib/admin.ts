import "server-only";
import { supabaseServer } from "@/lib/supabase/server";

export async function exigirAdmin() {
  const supabase = await supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  const lista = (process.env.ADMIN_EMAILS ?? "")
    .split(",").map((s) => s.trim().toLowerCase()).filter(Boolean);
  if (!user?.email || !lista.includes(user.email.toLowerCase())) return null;
  return user;
}