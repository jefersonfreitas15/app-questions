import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { exigirAdmin } from "@/lib/admin";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const runtime = "nodejs";
const MAX_QUESTOES = 500;
const LETRAS = ["A", "B", "C", "D", "E"] as const;

function pegar(q: Record<string, any>, ...chaves: string[]) {
  const mapa = new Map(Object.keys(q).map((k) => [k.toLowerCase(), q[k]]));
  for (const c of chaves) {
    const v = mapa.get(c.toLowerCase());
    if (v !== undefined && v !== null && String(v).trim() !== "") return String(v).trim();
  }
  return "";
}

function normalizar(q: Record<string, any>) {
  const enunciado = pegar(q, "enunciado");
  if (!enunciado) return { erro: "enunciado vazio" };

  let alternativas: { texto: string; is_correta: boolean }[] = [];
  if (Array.isArray(q.alternativas)) {
    alternativas = q.alternativas
      .map((a: any) => ({
        texto: String(a?.texto ?? "").trim(),
        is_correta: Boolean(a?.is_correta ?? a?.is_correct),
      }))
      .filter((a) => a.texto);
  } else {
    const gab = pegar(q, "gabarito").toUpperCase().match(/[A-E]/)?.[0];
    if (!gab) return { erro: "gabarito ausente ou inválido" };
    for (const l of LETRAS) {
      const texto = pegar(q, `alternativa_${l}`);
      if (!texto) {
        if (l === gab) return { erro: `gabarito ${gab} sem texto` };
        continue;
      }
      alternativas.push({ texto, is_correta: l === gab });
    }
  }

  if (alternativas.length < 2) return { erro: "menos de 2 alternativas" };
  if (alternativas.filter((a) => a.is_correta).length !== 1)
    return { erro: "deve haver exatamente 1 alternativa correta" };

  const anoNum = Number(pegar(q, "ano"));
  const ano = Number.isInteger(anoNum) && anoNum >= 1990 && anoNum <= new Date().getFullYear() + 1 ? anoNum : null;
  const banca = pegar(q, "banca").toUpperCase();
  const orgao = pegar(q, "orgao", "órgão").toUpperCase();

  const hash = crypto
    .createHash("sha256")
    .update([banca, ano ?? "", enunciado.replace(/\s+/g, " ").toLowerCase()].join("|"))
    .digest("hex");

  return {
    ok: {
      banca, orgao, ano,
      disciplina: pegar(q, "disciplina") || "Geral",
      assunto: pegar(q, "assunto"),
      enunciado,
      explicacao: pegar(q, "comentario_professor", "comentario", "explicacao"),
      hash, alternativas,
    },
  };
}

export async function POST(request: Request) {
  if (!(await exigirAdmin()))
    return NextResponse.json({ error: "Acesso negado." }, { status: 403 });

  let bruto: unknown;
  try { bruto = await request.json(); }
  catch { return NextResponse.json({ error: "JSON inválido." }, { status: 400 }); }

  const lista = Array.isArray(bruto) ? bruto : [bruto];
  if (lista.length === 0 || lista.length > MAX_QUESTOES)
    return NextResponse.json({ error: `Envie de 1 a ${MAX_QUESTOES} questões por vez.` }, { status: 400 });

  const validas: any[] = [];
  const invalidas: { posicao: number; motivo: string }[] = [];
  lista.forEach((item, i) => {
    if (!item || typeof item !== "object") return invalidas.push({ posicao: i + 1, motivo: "item não é objeto" });
    const r = normalizar(item as Record<string, any>);
    if ("erro" in r) invalidas.push({ posicao: i + 1, motivo: r.erro! });
    else validas.push(r.ok);
  });

  if (validas.length === 0)
    return NextResponse.json({ error: "Nenhuma questão válida.", invalidas }, { status: 422 });

  const { data, error } = await supabaseAdmin.rpc("importar_questoes", { p_lista: validas });
  if (error) {
    console.error("importar_questoes:", error.message);
    return NextResponse.json({ error: "Falha ao gravar no banco." }, { status: 500 });
  }
  return NextResponse.json({ ...(data as object), invalidas });
}