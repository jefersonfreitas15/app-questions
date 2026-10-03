import { NextResponse } from "next/server";

// Impede o Next.js de guardar a resposta em cache
export const dynamic = 'force-dynamic';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const disciplina = (body.disciplina || "Direito Administrativo").trim();
    const assunto = (body.assunto || "").trim();
    const quantidade = Math.min(Math.max(Number(body.quantidade) || 5, 1), 5);

    const assuntoFormatado = assunto ? assunto : "Assuntos gerais da disciplina";

    // Fator aleatório para garantir que a IA não recupera sempre a mesma prova
    const fatorAleatorio = Math.random().toString(36).substring(2, 10) + Date.now();

    if (GEMINI_API_KEY) {
      const prompt = `Você é um banco de dados avançado contendo o histórico de todas as provas de concursos públicos do Brasil.
[ID da Geração: ${fatorAleatorio}] - OBRIGATÓRIO: Varie completamente a estrutura desta geração em relação a qualquer outra.

Sua missão é resgatar, recriar ou simular com extrema fidelidade ${quantidade} questão(ões) sobre a disciplina "${disciplina}", focada no tema "${assuntoFormatado}".

DIRETRIZES DE MODELAGEM DAS BANCAS (VARIE O ESTILO):
Você DEVE utilizar um dos 3 modelos clássicos de provas reais brasileiras:
1. MODELO FGV: Crie um texto longo contando uma história prática (ex: "João, servidor público municipal, no exercício de suas funções..."). A resposta exige a aplicação do caso concreto à lei.
2. MODELO FCC: Vá direto à cobrança da "letra da lei" (lei seca). Faça um enunciado direto (ex: "Nos termos da Lei X, é correto afirmar que...") e coloque alternativas com pequenas pegadinhas de prazos ou competências.
3. MODELO CEBRASPE (Múltipla Escolha): Foco em decisões do STF/STJ e doutrina profunda. Enunciado acadêmico e direto.

REGRAS:
- É totalmente permitido recriar questões reais que já caíram em provas passadas.
- NUNCA use o mesmo modelo estrutural da questão anterior. Se acabou de usar o modelo FGV, use o modelo FCC ou Cebraspe na próxima.
- Abandone completamente qualquer introdução genérica. Aja como uma prova real.
- Cada questão deve ter 5 alternativas (A a E), sendo APENAS UMA correta.

Retorne APENAS um JSON válido no formato de array abaixo, sem blocos markdown:
[
  {
    "banca": "Simulação FGV/FCC/Cebraspe",
    "orgao": "Prova Replicada",
    "ano": 2026,
    "disciplina": "${disciplina}",
    "assunto": "${assuntoFormatado}",
    "enunciado": "Texto da questão no exato modelo da banca escolhida...",
    "explicacao": "Gabarito comentado detalhadamente, citando o artigo da lei ou a súmula correspondente...",
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
              temperature: 0.85 // Ajustado para equilibrar originalidade estrutural com precisão técnica
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