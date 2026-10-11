import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";
const MODELO = process.env.GEMINI_MODELO_COMENTARIO || "gemini-3.5-flash-lite";
const LIMITE_DIARIO_POR_ALUNO = 100;
const LETRAS = "ABCDEFGHIJ";

export async function POST(req: Request) {
  const admin = supabaseAdmin as any;
  let travada: string | null = null;

  try {
    const supabase = await supabaseServer();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Faça login para ver o comentário do professor." }, { status: 401 });
    }

    const { questaoId } = await req.json();
    if (!questaoId) return NextResponse.json({ error: "Questão inválida." }, { status: 400 });

    const { data: q } = await admin
      .from("questoes")
      .select("id, banca, disciplina, assunto, enunciado, explicacao, comentario_status, alternativas(texto, is_correta, ordem)")
      .eq("id", questaoId)
      .maybeSingle();

    if (!q) return NextResponse.json({ error: "Questão não encontrada." }, { status: 404 });

    // 1. Já tem comentário salvo: devolve sem custo
    if (q.explicacao && String(q.explicacao).trim()) {
      return NextResponse.json({ explicacao: q.explicacao, ia: q.comentario_status === "ia" });
    }
    if (q.comentario_status === "revisar" || q.comentario_status === "sem_gabarito") {
      return NextResponse.json({ explicacao: null, status: q.comentario_status });
    }

    // 2. Limite diário por aluno (proteção contra abuso)
    const desde = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { count } = await admin
      .from("comentarios_ia_log")
      .select("id", { count: "exact", head: true })
      .eq("usuario_id", user.id)
      .gte("criado_em", desde);
    if ((count ?? 0) >= LIMITE_DIARIO_POR_ALUNO) {
      return NextResponse.json(
        { error: "Você atingiu o limite diário de comentários novos. Tente novamente amanhã." },
        { status: 429 }
      );
    }

    // 3. Trava: evita gerar duas vezes a mesma questão ao mesmo tempo
    const doisMinAtras = new Date(Date.now() - 2 * 60 * 1000).toISOString();
    const { data: trava } = await admin
      .from("questoes")
      .update({ comentario_status: "gerando", comentario_em: new Date().toISOString() })
      .eq("id", q.id)
      .or(`comentario_status.is.null,and(comentario_status.eq.gerando,comentario_em.lt.${doisMinAtras})`)
      .select("id");
    if (!trava?.length) return NextResponse.json({ gerando: true }, { status: 202 });
    travada = q.id;

    // 4. Monta o pedido com o gabarito oficial
    const alternativas = [...(q.alternativas || [])].sort((a: any, b: any) => (a.ordem ?? 0) - (b.ordem ?? 0));
    const idxCorreta = alternativas.findIndex((a: any) => a.is_correta);
    if (idxCorreta < 0) {
      await admin.from("questoes").update({ comentario_status: "sem_gabarito" }).eq("id", q.id);
      travada = null;
      return NextResponse.json({ explicacao: null, status: "sem_gabarito" });
    }

    const listaAlt = alternativas.map((a: any, i: number) => `${LETRAS[i]}) ${String(a.texto || "").trim()}`).join("\n");
    const gabarito = LETRAS[idxCorreta];

    const prompt = `Você é um professor experiente de cursinho preparatório para concursos públicos no Brasil.

Questão${q.banca ? ` da banca ${q.banca}` : ""} | Disciplina: ${q.disciplina || "-"} | Assunto: ${q.assunto || "-"}

ENUNCIADO:
${String(q.enunciado || "").trim()}

ALTERNATIVAS:
${listaAlt}

GABARITO OFICIAL: ${gabarito}

Tarefas:
1. Verifique se o gabarito oficial está correto.
2. Escreva o comentário do professor:
   - Comece com "Gabarito: ${gabarito}."
   - Explique por que a alternativa ${gabarito} está correta.
   - Depois explique, letra por letra, por que cada uma das outras está errada.
   - Cite lei, súmula, doutrina ou regra gramatical apenas quando tiver certeza. Nunca invente número de artigo ou de lei.
   - Linguagem clara e direta, no máximo 250 palavras, texto simples sem markdown.

Responda SOMENTE com JSON neste formato:
{"concorda_gabarito": true, "comentario": "..."}`;

    if (!GEMINI_API_KEY) throw new Error("Chave da API do Gemini não configurada.");

    const resp = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODELO}:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: "application/json", temperature: 0.3 },
        }),
      }
    );
    if (!resp.ok) throw new Error(`Gemini ${resp.status}: ${await resp.text()}`);

    const json = await resp.json();
    const bruto = String(json?.candidates?.[0]?.content?.parts?.[0]?.text || "")
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .trim();
    const resultado = JSON.parse(bruto);
    const comentario = String(resultado?.comentario || "").trim();

    await admin.from("comentarios_ia_log").insert({ usuario_id: user.id, questao_id: q.id });

    // 5. IA discordou do gabarito: marca para revisão em vez de mostrar algo errado
    if (resultado?.concorda_gabarito === false || !comentario) {
      await admin
        .from("questoes")
        .update({ comentario_status: "revisar", comentario_revisao: comentario || null })
        .eq("id", q.id);
      travada = null;
      return NextResponse.json({ explicacao: null, status: "revisar" });
    }

    await admin.from("questoes").update({ explicacao: comentario, comentario_status: "ia" }).eq("id", q.id);
    travada = null;
    return NextResponse.json({ explicacao: comentario, ia: true });
  } catch (err: any) {
    console.error("comentario-ia:", err?.message || err);
    if (travada) await admin.from("questoes").update({ comentario_status: null }).eq("id", travada);
    return NextResponse.json({ error: "Não foi possível gerar o comentário agora. Tente novamente." }, { status: 500 });
  }
}