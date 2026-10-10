import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";
import crypto from "node:crypto";

export const runtime = "nodejs";

const admin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: { persistSession: false },
  }
);

const resend = new Resend(process.env.RESEND_API_KEY);
const SITE = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  process.env.SITE_URL ||
  "https://qproconcursos.tech"
).replace(/\/$/, "");

const FROM = "Qpro Concursos <suporte@qproconcursos.tech>";

type Produto = "vitalicio" | "creditos" | "mapas";
const PRODUTOS: Record<string, Produto> = {
  "c2414c10-bc54-11f1-bcba-e798de11d8b0": "vitalicio",
  "e82bc990-c10f-11f1-a884-dd6e9186beaf": "creditos",
  "4956db20-bed0-11f1-a201-45f9f5ba0c3c": "mapas",
};

const CREDITOS_POR_CENTAVOS: Record<number, number> = {
  1990: 100,
  3700: 300,
  8990: 1000,
};
const BONUS_VITALICIO = 10;

const esc = (s: string) =>
  s.replace(
    /[&<>"']/g,
    (c) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      }[c]!)
  );

const iguais = (a: string, b: string) => {
  const x = Buffer.from(a),
    y = Buffer.from(b);
  return x.length === y.length && crypto.timingSafeEqual(x, y);
};

const layout = (titulo: string, corpo: string) => `
<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;border:1px solid #e2e8f0;border-radius:12px;background:#f8fafc">
  <h1 style="color:#4f46e5;text-align:center">${titulo}</h1>${corpo}
  <p style="text-align:center;color:#94a3b8;font-size:12px;margin-top:24px">Dúvidas? Responda a este e-mail. Bons estudos!</p>
</div>`;

const botao = (href: string, txt: string) =>
  `<p style="text-align:center;margin:28px 0"><a href="${href}" style="background:#4f46e5;color:#fff;padding:14px 28px;text-decoration:none;border-radius:8px;font-weight:bold;display:inline-block;">${txt}</a></p>`;

async function gerarLinkMagico(email: string): Promise<string> {
  try {
    const { data, error } = await admin.auth.admin.generateLink({
      type: "magiclink",
      email: email,
      options: {
        redirectTo: `${SITE}/app`,
      },
    });

    if (error || !data?.properties?.action_link) {
      console.warn("Falha ao gerar action_link, fallback para login:", error);
      return `${SITE}/login`;
    }

    // Se o Supabase gerar o link apontando para o seu próprio domínio, convertemos para confirmação direta na sua rota
    const actionLink = data.properties.action_link;
    const url = new URL(actionLink);
    const tokenHash = url.searchParams.get("token_hash") || url.searchParams.get("token");
    const type = url.searchParams.get("type") || "magiclink";

    if (tokenHash) {
      return `${SITE}/auth/confirm?token_hash=${tokenHash}&type=${type}&next=/app`;
    }

    return actionLink;
  } catch (err) {
    console.error("Erro ao gerar link mágico:", err);
    return `${SITE}/login`;
  }
}

function montarEmail(
  produto: Produto,
  nome: string,
  creditos: number,
  linkAcesso: string
) {
  const n = esc(nome);
  const linkDriveMapas =
    process.env.LINK_MAPAS_DRIVE ||
    "https://drive.google.com/drive/folders/1yB0pL8gFEAoxCPBuhp0Qun8-fDj4wXQ-?usp=drive_link";

  if (produto === "vitalicio") {
    return {
      subject: "👑 Seu acesso vitalício ao Qpro foi liberado!",
      html: layout(
        "Pagamento aprovado!",
        `<p style="color:#475569">Olá, <strong>${n}</strong>! Seu acesso vitalício está ativo e já inclui <strong>${creditos} créditos</strong> para o Gerador de Questões com Inteligência Artificial.</p>
        <p style="color:#475569">Clique no botão abaixo para entrar instantaneamente na plataforma:</p>
        ${botao(linkAcesso, "Acessar o Qpro")}
        <p style="color:#94a3b8;font-size:11px;text-align:center;">Se o botão não funcionar, cole o link no seu navegador: <br><a href="${linkAcesso}">${linkAcesso}</a></p>`
      ),
    };
  }

  if (produto === "creditos") {
    return {
      subject: `⚡ Seus ${creditos} créditos de IA foram liberados!`,
      html: layout(
        "Recarga de IA aprovada!",
        `<p style="color:#475569">Olá, <strong>${n}</strong>! <strong>${creditos} créditos</strong> foram adicionados ao seu saldo com sucesso.</p>
        <p style="color:#475569">Clique abaixo para continuar seus simulados:</p>
        ${botao(linkAcesso, "Acessar o Qpro")}
        <p style="color:#94a3b8;font-size:11px;text-align:center;">Link direto: <a href="${linkAcesso}">${linkAcesso}</a></p>`
      ),
    };
  }

  return {
    subject: "🗺️ Seu pacote de Mapas Mentais chegou!",
    html: layout(
      "Aqui estão seus Mapas!",
      `<p style="color:#475569">Olá, <strong>${n}</strong>! Obrigado pela compra dos Mapas Mentais.</p>
      <p style="color:#475569">Clique no botão abaixo para abrir a pasta completa no Google Drive:</p>
      ${botao(linkDriveMapas, "Acessar Pasta no Drive")}`
    ),
  };
}

async function garantirUsuario(email: string): Promise<string> {
  const { data: existente } = await admin.rpc("id_por_email", {
    p_email: email,
  });
  if (existente) return existente as string;

  const { data, error } = await admin.auth.admin.createUser({
    email,
    email_confirm: true,
  });
  if (error || !data.user) throw error ?? new Error("createUser falhou");
  return data.user.id;
}

export async function POST(request: Request) {
  try {
    const token = new URL(request.url).searchParams.get("token") ?? "";
    const esperado = process.env.KIWIFY_WEBHOOK_TOKEN ?? "";
    if (!esperado || !iguais(token, esperado)) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const order = body?.order || body;
    const status = String(order?.order_status || order?.status || "");
    const customer = order?.Customer || order?.customer || {};
    const email = String(
      customer?.email || order?.email || ""
    )
      .trim()
      .toLowerCase();
    const nome = String(
      customer?.first_name || customer?.full_name || "Concurseiro(a)"
    ).split(" ")[0];
    const transactionId = String(order?.order_id || order?.id || "");
    const prod = order?.Product || order?.product || {};
    const productId = String(
      prod?.product_id || prod?.id || order?.product_id || ""
    );
    const centavos = Number(
      order?.Commissions?.charge_amount ??
        order?.Payment?.amount ??
        order?.amount ??
        0
    );

    if (!email || !transactionId) {
      return NextResponse.json(
        { error: "payload incompleto" },
        { status: 400 }
      );
    }

    if (!["approved", "paid"].includes(status)) {
      return NextResponse.json({ ok: true, ignorado: status });
    }

    const produto = PRODUTOS[productId];
    if (!produto) return NextResponse.json({ ok: true, ignorado: "produto" });

    const creditos =
      produto === "vitalicio"
        ? BONUS_VITALICIO
        : produto === "creditos"
        ? CREDITOS_POR_CENTAVOS[centavos] ?? 0
        : 0;

    let { data: compra } = await admin
      .from("compras")
      .select("*")
      .eq("transaction_id", transactionId)
      .eq("produto", produto)
      .maybeSingle();

    if (!compra) {
      const { data, error } = await admin
        .from("compras")
        .insert({
          transaction_id: transactionId,
          email,
          produto,
          creditos,
          status:
            produto === "creditos" && creditos === 0
              ? "revisar"
              : "aprovada",
        })
        .select()
        .single();
      if (error) throw error;
      compra = data;
    }

    if (produto !== "mapas") {
      const { data: reivindicada } = await admin
        .from("compras")
        .update({ concedida: true })
        .eq("id", compra.id)
        .eq("concedida", false)
        .select("id");

      if (reivindicada?.length) {
        try {
          const uid = await garantirUsuario(email);
          const { error } = await admin.rpc("conceder_compra", {
            p_user: uid,
            p_produto: produto,
            p_creditos: creditos,
          });
          if (error) throw error;
        } catch (e) {
          await admin
            .from("compras")
            .update({ concedida: false })
            .eq("id", compra.id);
          throw e;
        }
      }
    }

    if (!compra.email_enviado) {
      const linkAcesso = await gerarLinkMagico(email);
      const { subject, html } = montarEmail(
        produto,
        nome,
        creditos,
        linkAcesso
      );
      const { error } = await resend.emails.send({
        from: FROM,
        to: [email],
        subject,
        html,
      });

      if (error) throw new Error(`resend: ${error.message}`);
      await admin
        .from("compras")
        .update({ email_enviado: true })
        .eq("id", compra.id);
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("ERRO NO WEBHOOK:", err);
    return NextResponse.json({ error: "erro interno" }, { status: 500 });
  }
}