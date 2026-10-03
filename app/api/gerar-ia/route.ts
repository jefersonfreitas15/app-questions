import { NextResponse } from "next/server";

// 1. FORÇA O NEXT.JS A NUNCA GUARDAR EM CACHE (Garante execução limpa a cada clique)
export const dynamic = 'force-dynamic';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const disciplina = (body.disciplina || "Direito Administrativo").trim();
    const assunto = (body.assunto || "").trim();
    const quantidade = Math.min(Math.max(Number(body.quantidade) || 5, 1), 5);

    const assuntoFormatado = assunto ? assunto : "Assuntos gerais da disciplina";

    // 2. Fator de aleatoriedade forte para forçar a IA a criar textos diferentes
    const fatorAleatorio = Math.random().toString(36).substring(2, 10) + Date.now();

    if (GEMINI_API_KEY) {
      const prompt = `Você é um examinador sênior de concursos públicos (bancas FGV, Cebraspe, FCC).
[ID da Geração Interna: ${fatorAleatorio}] - OBRIGATÓRIO: Crie uma questão completamente diferente de qualquer outra que você já tenha criado.

Gere exatamente ${quantidade} questão(ões) INÉDITA(S) e de alto nível sobre a disciplina "${disciplina}", focada estritamente no tema: "${assuntoFormatado}".

REGRAS OBRIGATÓRIAS:
- Vá direto ao ponto! NUNCA inicie a questão com frases genéricas como "Acerca do conteúdo programático", "Sobre a jurisprudência", ou "No que tange aos conceitos fundamentais". 
- O enunciado deve mergulhar diretamente no tema (ex: "Acerca da anulação de atos administrativos...", "Determinado servidor público cometeu...").
- Crie um cenário prático ou um caso hipotético desafiador e DIFERENTE DO HABITUAL, exigindo interpretação da lei.
- Cada questão deve ter 5 alternativas (A a E), sendo APENAS UMA correta.

Retorne APENAS um JSON válido no formato de array abaixo, sem blocos markdown:
[
  {
    "banca": "Qpro IA",
    "orgao": "Simulado Inteligente",
    "ano": 2026,
    "disciplina": "${disciplina}",
    "assunto": "${assuntoFormatado}",
    "enunciado": "Texto da questão contextualizada, indo direto ao tema sem introduções genéricas...",
    "explicacao": "Fundamentação detalhada explicando por que a alternativa correta está certa e por que as outras estão erradas...",
    "alternativas": [
      { "texto": "Texto da alternativa A", "is_correta": false },
      { "texto": "Texto da alternativa B", "is_correta": true },
      { "texto": "Texto da alternativa C", "is_correta": false },
      { "texto": "Texto da alternativa D", "is_correta": false },
      { "texto": "Texto da alternativa E", "is_correta": false }
    ]
  }
]`;

      const resp = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { 
              responseMimeType: "application/json",
              temperature: 1.0 // 3. Aumentado para 1.0 para máxima criatividade e zero repetição
            },
          }),
        }
      );

      if (!resp.ok) {
        const erroGoogle = await resp.text();
        throw new Error(`Bloqueio do Google (Status ${resp.status}): ${erroGoogle}`);
      }

      const data = await resp.json();
      const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
      
      const cleanText = rawText.replace(/```json/g, "").replace(/```/g, "").trim();
      
      let parsed;
      try {
        parsed = JSON.parse(cleanText);
      } catch (e) {
        throw new Error("O Gemini devolveu um texto que não é JSON válido: " + cleanText);
      }

      if (Array.isArray(parsed) && parsed.length > 0) {
        return NextResponse.json({ questoes: parsed.slice(0, quantidade) });
      } else {
        throw new Error("O Gemini devolveu uma lista vazia.");
      }
    }

    throw new Error("A chave GEMINI_API_KEY não está a ser reconhecida pelo servidor da Vercel.");
    
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Erro desconhecido na geração com IA" },
      { status: 500 }
    );
  }
}