import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";
import crypto from "node:crypto";

export const runtime = "nodejs";

const admin = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
  auth: { persistSession: false },
});
const resend = new Resend(process.env.RESEND_API_KEY);
const SITE = process.env.NEXT_PUBLIC_SITE_URL!;
const FROM = "Qpro Concursos <suporte@qproconcursos.tech>";

type Produto = "vitalicio" | "creditos" | "mapas";
const PRODUTOS: Record<string, Produto> = {
  "c2414c10-bc54-11f1-bcba-e798de11d8b0": "vitalicio",
  "e82bc990-c10f-11f1-a884-dd6e9186beaf": "creditos",
  "4956db20-bed0-11f1-a201-45f9f5ba0c3c": "mapas",
};
const CREDITOS_POR_CENTAVOS: Record<number, number> = { 1990: 100, 3700: 300, 8990: 1000 };
const BONUS_VITALICIO = 10;

const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));

const iguais = (a: string, b: string) => {
  const x = Buffer.from(a), y = Buffer.from(b);
  return x.length === y.length && crypto.timingSafeEqual(x, y);
};

const layout = (titulo: string, corpo: string) => `
<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;border:1px solid #e2e8f0;border-radius:12px;background:#f8fafc">
  <h1 style="color:#4f46e5;text-align:center">${titulo}</h1>${corpo}
  <p style="text-align:center;color:#94a3b8;font-size:12px;margin-top:24px">Dúvidas? Responda este e-mail. Bons estudos!</p>
</div>`;

const botao = (href: string, txt: string) =>
  `<p style="text-align:center;margin:28px 0"><a href="${href}" style="background:#4f46e5;color:#fff;padding:14px 28px;text-decoration:none;border-radius:8px;font-weight:bold">${txt}</a></p>`;

function montarEmail(produto: Produto, nome: string, creditos: number) {
  const n = esc(nome);
  const acesso = `<p style="color:#475569">Para entrar, use o botão abaixo e informe este mesmo e-mail. Você receberá um link de acesso, sem senha.</p>${botao(`${SITE}/login`, "Acessar o Qpro")}`;
  if (produto === "vitalicio")
    return { subject: "👑 Seu acesso vitalício ao Qpro foi liberado!",
      html: layout("Pagamento aprovado!", `<p style="color:#475569">Olá, <strong>${n}</strong>! Seu acesso vitalício está ativo e já inclui ${creditos} créditos de IA.</p>${acesso}`) };
  if (produto === "creditos")
    return { subject: `⚡ Seus ${creditos} créditos de IA foram liberados!`,
      html: layout("Recarga aprovada!", `<p style="color:#475569">Olá, <strong>${n}</strong>! ${creditos} créditos foram adicionados à sua conta.</p>${acesso}`) };
  return { subject: "🗺️ Seu pacote de Mapas Mentais chegou!",
    html: layout("Aqui estão seus Mapas!", `<p style="color:#475569">Olá, <strong>${n}</strong>! Obrigado pela compra.</p>${botao(process.env.LINK_MAPAS_DRIVE!, "Acessar pasta completa")}`) };
}

async function garantirUsuario(email: string): Promise<string> {
  const { data: existente } = await admin.rpc("id_por_email", { p_email: email });
  if (existente) return existente as string;
  const { data, error } = await admin.auth.admin.createUser({ email, email_confirm: true });
  if (error || !data.user) throw error ?? new Error("createUser falhou");
  return data.user.id;
}

async function reverter(transactionId: string) {
  const { data: linhas } = await admin.from("compras").select("*")
    .eq("transaction_id", transactionId).eq("concedida", true).neq("status", "reembolsada");
  for (const c of linhas ?? []) {
    const { data: uid } = await admin.rpc("id_por_email", { p_email: c.email });
    if (uid) await admin.rpc("revogar_compra", { p_user: uid, p_produto: c.produto, p_creditos: c.creditos });
    await admin.from("compras").update({ status: "reembolsada" }).eq("id", c.id);
  }
}

export async function POST(request: Request) {
  try {
    const token = new URL(request.url).searchParams.get("token") ?? "";
    const esperado = process.env.KIWIFY_WEBHOOK_TOKEN ?? "";
    if (!esperado || !iguais(token, esperado))
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });

    const body = await request.json();
    const order = body?.order || body;
    const status = String(order?.order_status || order?.status || "");
    const customer = order?.Customer || order?.customer || {};
    const email = String(customer?.email || order?.email || "").trim().toLowerCase();
    const nome = String(customer?.first_name || customer?.full_name || "Concurseiro(a)").split(" ")[0];
    const transactionId = String(order?.order_id || order?.id || "");
    const prod = order?.Product || order?.product || {};
    const productId = String(prod?.product_id || prod?.id || order?.product_id || "");
    const centavos = Number(order?.Commissions?.charge_amount ?? order?.Payment?.amount ?? order?.amount ?? 0);

    if (!email || !transactionId)
      return NextResponse.json({ error: "payload incompleto" }, { status: 400 });

    console.log("kiwify", { transactionId, productId, status }); // sem dados pessoais

    if (["refunded", "chargedback"].includes(status)) {
      await reverter(transactionId);
      return NextResponse.json({ ok: true, revogada: true });
    }
    if (!["approved", "paid"].includes(status))
      return NextResponse.json({ ok: true, ignorado: status });

    const produto = PRODUTOS[productId];
    if (!produto) return NextResponse.json({ ok: true, ignorado: "produto" });

    const creditos =
      produto === "vitalicio" ? BONUS_VITALICIO
      : produto === "creditos" ? CREDITOS_POR_CENTAVOS[centavos] ?? 0
      : 0;

    let { data: compra } = await admin.from("compras").select("*")
      .eq("transaction_id", transactionId).eq("produto", produto).maybeSingle();

    if (!compra) {
      const { data, error } = await admin.from("compras")
        .insert({ transaction_id: transactionId, email, produto, creditos,
                  status: produto === "creditos" && creditos === 0 ? "revisar" : "aprovada" })
        .select().single();
      if (error) throw error;
      compra = data;
    }

    if (compra.status === "revisar") {
      console.error("Pacote de créditos sem correspondência de valor", { transactionId, centavos });
      return NextResponse.json({ ok: true, revisar: true });
    }

    if (produto !== "mapas") {
      const { data: reivindicada } = await admin.from("compras")
        .update({ concedida: true }).eq("id", compra.id).eq("concedida", false).select("id");
      if (reivindicada?.length) {
        try {
          const uid = await garantirUsuario(email);
          const { error } = await admin.rpc("conceder_compra",
            { p_user: uid, p_produto: produto, p_creditos: creditos });
          if (error) throw error;
        } catch (e) {
          await admin.from("compras").update({ concedida: false }).eq("id", compra.id);
          throw e;
        }
      }
    }

    if (!compra.email_enviado) {
      const { subject, html } = montarEmail(produto, nome, creditos);
      const { error } = await resend.emails.send({ from: FROM, to: [email], subject, html });
      if (error) throw new Error(`resend: ${error.message}`); // 500 faz a Kiwify reenviar
      await admin.from("compras").update({ email_enviado: true }).eq("id", compra.id);
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("ERRO NO WEBHOOK:", err);
    return NextResponse.json({ error: "erro interno" }, { status: 500 });
  }
}