import { NextResponse } from "next/server";

// 1. Desativação total do cache na rota
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const disciplina = (body.disciplina || "Direito Administrativo").trim();
    const assunto = (body.assunto || "").trim();
    const quantidade = Math.min(Math.max(Number(body.quantidade) || 5, 1), 5);

    const assuntoFormatado = assunto ? assunto : "Assuntos gerais da disciplina";

    // 2. Sorteio automático de banca para forçar a IA a mudar o estilo da pergunta
    const bancas = ["FGV (Foco em casos práticos e historinhas)", "FCC (Foco em letra da lei e pequenas pegadinhas)", "Cebraspe (Foco em doutrina e jurisprudência)", "Vunesp (Foco em situações do quotidiano administrativo)"];
    const bancaSorteada = bancas[Math.floor(Math.random() * bancas.length)];
    
    // Fator de entropia (aleatoriedade extrema)
    const fatorAleatorio = Math.random().toString(36).substring(2, 15) + Date.now();

    if (GEMINI_API_KEY) {
      const prompt = `Você é um banco de dados de concursos.
ID Único de Geração: ${fatorAleatorio}

Sua tarefa: Gerar ${quantidade} questão(ões) INÉDITA(S) sobre a disciplina "${disciplina}", tema "${assuntoFormatado}".

INSTRUÇÕES DE QUEBRA DE PADRÃO (MUITO IMPORTANTE):
1. Estilo OBRIGATÓRIO desta requisição: ${bancaSorteada}. Adeque o texto perfeitamente a este estilo.
2. Aborde uma nuance, exceção à regra ou caso prático MUITO ESPECÍFICO do tema. Fuja dos conceitos básicos que todo mundo conhece.
3. Se usar um caso prático, invente nomes de personagens, cidades ou situações completamente novos.
4. NUNCA repita a mesma estrutura ou os mesmos exemplos de gerações anteriores.

Retorne APENAS um JSON válido no formato de array abaixo, sem blocos markdown:
[
  {
    "banca": "Simulação ${bancaSorteada.split(" ")[0]}",
    "orgao": "Qpro Inéditas",
    "ano": 2026,
    "disciplina": "${disciplina}",
    "assunto": "${assuntoFormatado}",
    "enunciado": "Texto da questão...",
    "explicacao": "Gabarito comentado...",
    "alternativas": [
      { "texto": "Alternativa A", "is_correta": false },
      { "texto": "Alternativa B", "is_correta": true },
      { "texto": "Alternativa C", "is_correta": false },
      { "texto": "Alternativa D", "is_correta": false },
      { "texto": "Alternativa E", "is_correta": false }
    ]
  }
]`;

      // 3. Corrigido para gemini-1.5-flash e adicionado "cache: 'no-store'" no fetch
      const resp = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          cache: "no-store", // <-- A MARTELADA FINAL NO CACHE DO NEXT.JS
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { 
              responseMimeType: "application/json",
              temperature: 0.95
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