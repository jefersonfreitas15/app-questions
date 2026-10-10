import { createBrowserClient } from "@supabase/ssr";

export function supabaseBrowser() {
  const url =
    typeof window !== "undefined"
      ? `${window.location.origin}/api-banco`
      : process.env.NEXT_PUBLIC_SUPABASE_URL!;

  return createBrowserClient(
    url,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookieOptions: { name: "sb-qpro-auth" },
    }
  );
}