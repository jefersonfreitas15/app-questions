import { NextResponse, type NextRequest } from "next/server";
import { type EmailOtpType } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token_hash = searchParams.get("token_hash") || searchParams.get("token");
  const rawType = searchParams.get("type");
  const next = searchParams.get("next") || "/app";

  // Se o tipo vier como 'magiclink', converte para 'email' (o padrão aceito pelo verifyOtp)
  const type: EmailOtpType =
    rawType === "magiclink" || rawType === "signup" || rawType === "invite"
      ? (rawType as EmailOtpType)
      : "email";

  const destinoFinal = next.startsWith("/") && !next.startsWith("//") ? next : "/app";

  if (token_hash) {
    const cookieStore = request.cookies;
    let response = NextResponse.redirect(new URL(destinoFinal, request.url));

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookieOptions: { name: "sb-qpro-auth" },
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              request.cookies.set(name, value);
              response.cookies.set(name, value, options);
            });
          },
        },
      }
    );

    // 1. Tenta validar com o tipo recebido
    let { error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    });

    // 2. Se falhar, tenta com o tipo 'email' como fallback seguro
    if (error && type !== "email") {
      const retry = await supabase.auth.verifyOtp({
        type: "email",
        token_hash,
      });
      error = retry.error;
    }

    if (!error) {
      // Sessão autenticada e cookies gravados na resposta
      return response;
    }

            console.error("Erro no verifyOtp:", error.message);
  }

  return NextResponse.redirect(new URL("/login?erro=link_expirado", request.url));
}