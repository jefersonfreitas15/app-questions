import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { supabaseServer } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { exigirAdmin } from "@/lib/admin";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";

export async function POST(req: Request) {
  try {
    const supabase = await supabaseServer();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Faça login para gerar questões com IA." }, { status: 401 });
    }

    const body = await req.json();
    const disciplina = String(body.disciplina || "Direito Administrativo").trim();
    const assunto = String(body.assunto || "").trim();
    const quantidade = Math.min(Math.max(Number(body.quantidade) || 5, 1), 5);

    // 1. Tenta debitar créditos no banco de dados
    const { data: saldoRestante, error: creditosError } = await supabase.rpc("consumir_creditos", {
      p_qtd: quantidade,
    });

    if (creditosError || saldoRestante === null) {
      return NextResponse.json(
        { error: "Saldo de créditos de IA insuficiente. Recarregue seu pacote para continuar." },
        { status: 402 }
      );
    }

    if (!GEMINI_API_KEY) {
      throw new Error("Chave da API do Gemini não configurada no servidor.");
    }

    const assuntoFormatado = assunto || "Conhecimentos gerais da matéria";
    const bancas = ["FGV", "Cebraspe", "FCC", "Vunesp"];
    const bancaSorteada = bancas[Math.floor(Math.random() * bancas.length)];
    const nonce = crypto.randomBytes(4).toString("hex");

    const prompt = `[ID: ${nonce}] - Banca simulada: ${bancaSorteada}.
Gere exatamente ${quantidade} questão(ões) inédita(s) de concurso público sobre a disciplina "${disciplina}", com foco no assunto "${assuntoFormatado}".
Crie enunciados com situações práticas e raciocínio aprofundado.

Retorne ESTRITAMENTE um array JSON puro (sem marcações markdown fora do JSON):
[
  {
    "enunciado": "Texto completo da questão...",
    "explicacao": "Fundamentação jurídica e gabarito comentado...",
    "alternativas": [
      { "texto": "Assertiva A", "is_correta": false },
      { "texto": "Assertiva B", "is_correta": true },
      { "texto": "Assertiva C", "is_correta": false },
      { "texto": "Assertiva D", "is_correta": false },
      { "texto": "Assertiva E", "is_correta": false }
    ]
  }
]`;

    let rawText = "";
    let tentativas = 0;
    while (tentativas < 2) {
      tentativas++;
      const resp = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              responseMimeType: "application/json",
              temperature: 0.85,
            },
          }),
        }
      );

      if (resp.ok) {
        const json = await resp.json();
        rawText = json?.candidates?.[0]?.content?.parts?.[0]?.text || "";
        break;
      }

      if (tentativas >= 2) {
        const errText = await resp.text();
        throw new Error(`Falha na API Gemini (${resp.status}): ${errText}`);
      }
      await new Promise((r) => setTimeout(r, 2000));
    }

    const cleanJson = rawText.replace(/```json/gi, "").replace(/```/g, "").trim();
    const questoesGeradas = JSON.parse(cleanJson);

    if (!Array.isArray(questoesGeradas) || questoesGeradas.length === 0) {
      throw new Error("A IA não retornou um formato de questões válido.");
    }

    // 2. Prepara e higieniza as questões para gravação via RPC segura
    const anoAtual = new Date().getFullYear();
    const questoesProntas = questoesGeradas.slice(0, quantidade).map((q: any) => {
      const enunciado = String(q.enunciado || "").trim();
      const hash = crypto
        .createHash("sha256")
        .update(`IA|${disciplina}|${enunciado.toLowerCase()}`)
        .digest("hex");

      return {
        banca: `Simulação ${bancaSorteada}`,
        orgao: "Qpro Concursos",
        ano: anoAtual,
        disciplina,
        assunto: assuntoFormatado,
        enunciado,
        explicacao: String(q.explicacao || "").trim(),
        hash,
        alternativas: (q.alternativas || []).map((a: any) => ({
          texto: String(a.texto || "").trim(),
          is_correta: Boolean(a.is_correta),
        })),
      };
    });

    const { data: dbResult, error: dbError } = await (supabaseAdmin.rpc as any)(
  "importar_questoes",
  { p_lista: questoesProntas }
);

    if (dbError) {
      console.error("Erro ao gravar questões de IA:", dbError.message);
      throw new Error("As questões foram geradas, mas ocorreu uma falha ao registrá-las no banco.");
    }

    return NextResponse.json({
      sucesso: true,
      saldoRestante,
      resultado: dbResult,
      questoes: questoesProntas,
    });
  } catch (err: any) {
    console.error("Erro na rota /api/gerar-ia:", err);
    return NextResponse.json({ error: err.message || "Erro interno ao processar IA." }, { status: 500 });
  }
}