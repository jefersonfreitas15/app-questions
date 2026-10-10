import { NextResponse } from "next/server";
import { Resend } from "resend";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const runtime = "nodejs";

const resend = new Resend(process.env.RESEND_API_KEY);
const SITE = (process.env.NEXT_PUBLIC_SITE_URL || "https://qproconcursos.tech").replace(/\/$/, "");
const FROM = "Qpro Concursos <suporte@qproconcursos.tech>";

export async function POST(req: Request) {
  const resposta = NextResponse.json({ ok: true }); // mesma resposta sempre, por segurança

  try {
    const { email: bruto } = await req.json();
    const email = String(bruto || "").trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return resposta;

    const admin = supabaseAdmin as any;

     // Limite: 1 link a cada 5 minutos e no máximo 5 por dia por e-mail
 const agora = Date.now();
 const { count: recentes } = await admin
   .from("envios_login")
   .select("id", { count: "exact", head: true })
   .eq("email", email)
   .gte("criado_em", new Date(agora - 5 * 60 * 1000).toISOString());
 const { count: hoje } = await admin
   .from("envios_login")
   .select("id", { count: "exact", head: true })
   .eq("email", email)
   .gte("criado_em", new Date(agora - 24 * 60 * 60 * 1000).toISOString());

 if ((recentes ?? 0) >= 1 || (hoje ?? 0) >= 5) {
   console.warn("login-link: limite atingido para", email);
   return resposta;
 }

    const { data, error } = await admin.auth.admin.generateLink({
      type: "magiclink",
      email,
      options: { redirectTo: `${SITE}/app` },
    });

    const tokenHash = data?.properties?.hashed_token;
    if (error || !tokenHash) {
      console.error("login-link: falha ao gerar link:", error);
      return resposta;
    }

    const link = `${SITE}/auth/confirm?token_hash=${tokenHash}&type=email&next=/app`;

    const { error: erroEnvio } = await resend.emails.send({
      from: FROM,
      to: [email],
      subject: "Seu link de acesso ao Qpro",
      html: `
        <div style="font-family:Arial,sans-serif;max-width:480px;margin:auto;padding:24px;background:#f8fafc;border-radius:16px">
          <h2 style="color:#4f46e5;text-align:center">Acesse o Qpro</h2>
          <p>Clique no botão abaixo para entrar na plataforma. O link vale por 1 hora e só pode ser usado uma vez.</p>
          <p style="text-align:center;margin:28px 0">
            <a href="${link}" style="background:#4f46e5;color:#fff;padding:14px 28px;border-radius:10px;text-decoration:none;font-weight:bold">Entrar no Qpro</a>
          </p>
          <p style="font-size:12px;color:#64748b">Se você não pediu este acesso, ignore este e-mail.</p>
        </div>`,
    });
     await admin.from("envios_login").insert({ email });

    if (erroEnvio) console.error("login-link: erro no Resend:", erroEnvio);
  } catch (err) {
    console.error("login-link: erro inesperado:", err);
  }

  return resposta;
}