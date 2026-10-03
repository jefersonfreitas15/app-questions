import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const maxDuration = 60;

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const disciplina = (body.disciplina || "Direito Administrativo").trim();
    const assunto = (body.assunto || "").trim();
    const quantidade = Math.min(Math.max(Number(body.quantidade) || 5, 1), 5);

    const assuntoFormatado = assunto ? assunto : "Assuntos gerais da disciplina";
    const bancas = ["FGV", "FCC", "Cebraspe", "Vunesp"];
    const bancaSorteada = bancas[Math.floor(Math.random() * bancas.length)];
    const fatorAleatorio = Math.random().toString(36).substring(2, 15) + Date.now();

    if (GEMINI_API_KEY) {
      const prompt = `[ID: ${fatorAleatorio}] - BANCAS: Simule ${bancaSorteada}.
Gere ${quantidade} questão(ões) inédita(s) sobre "${disciplina}", tema "${assuntoFormatado}".
REGRA VITAL: Crie uma situação ou caso prático NUNCA antes usado. A resposta deve exigir interpretação avançada.

Retorne APENAS um array JSON:
[
  {
    "banca": "Simulação ${bancaSorteada}",
    "orgao": "Qpro",
    "ano": 2026,
    "disciplina": "${disciplina}",
    "assunto": "${assuntoFormatado}",
    "enunciado": "Texto da questão...",
    "explicacao": "Gabarito comentado...",
    "alternativas": [
      { "texto": "Alt A", "is_correta": false },
      { "texto": "Alt B", "is_correta": true },
      { "texto": "Alt C", "is_correta": false },
      { "texto": "Alt D", "is_correta": false },
      { "texto": "Alt E", "is_correta": false }
    ]
  }
]`;

      let resp;
      let maxTentativas = 3;
      let tempoEspera = 2000; // Começa a esperar 2 segundos

      // Loop de tentativa automática (Retry Mechanism)
      for (let tentativa = 1; tentativa <= maxTentativas; tentativa++) {
        resp = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=${GEMINI_API_KEY}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            cache: "no-store",
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: { responseMimeType: "application/json", temperature: 0.95 },
            }),
          }
        );

        // Se o Google estiver sobrecarregado (503), espera e tenta de novo
        if (resp.status === 503) {
          if (tentativa === maxTentativas) {
            throw new Error(`Google Gemini sobrecarregado após ${maxTentativas} tentativas. Tente novamente em alguns minutos.`);
          }
          await new Promise(resolve => setTimeout(resolve, tempoEspera));
          tempoEspera *= 2; // Dobra o tempo de espera (2s, depois 4s)
          continue;
        }

        // Se der outro erro (ex: chave inválida), aborta imediatamente
        if (!resp.ok) throw new Error(await resp.text());
        
        // Se a resposta for OK, sai do loop
        break; 
      }

      const data = await resp?.json();
      const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
      const cleanText = rawText.replace(/```json/g, "").replace(/```/g, "").trim();
      
      const parsed = JSON.parse(cleanText);

      return NextResponse.json(
        { questoes: parsed.slice(0, quantidade) },
        {
          headers: {
            'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0',
          }
        }
      );
    }

    throw new Error("Chave GEMINI não configurada no servidor.");
    
  } catch (err: any) {
    return NextResponse.json({ error: err?.message }, { status: 500 });
  }
}