import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { exigirAdmin } from "../../../../lib/admin";

export const maxDuration = 60;

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15MB

export async function POST(request: Request) {
  try {
    if (!(await exigirAdmin())) {
      return NextResponse.json({ error: "Acesso não autorizado." }, { status: 403 });
    }

    if (!GEMINI_API_KEY) {
      return NextResponse.json({ error: "Chave GEMINI_API_KEY não configurada no servidor." }, { status: 500 });
    }

    const formData = await request.formData();
    const provaFile = formData.get("prova") as File | null;
    const gabaritoFile = formData.get("gabarito") as File | null;

    if (!provaFile || !gabaritoFile) {
      return NextResponse.json({ error: "Envie ambos os arquivos: Prova e Gabarito em PDF." }, { status: 400 });
    }

    if (provaFile.size > MAX_FILE_SIZE || gabaritoFile.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "Cada arquivo PDF deve ter no máximo 15MB." }, { status: 400 });
    }

    const provaBuffer = Buffer.from(await provaFile.arrayBuffer());
    const gabaritoBuffer = Buffer.from(await gabaritoFile.arrayBuffer());

    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: { responseMimeType: "application/json" },
    });

    const prompt = `Você é um extrator especialista em provas de concursos públicos brasileiros.
Analise os dois PDFs anexados (o Caderno de Prova e o Gabarito Oficial).

Instruções:
1. Extraia o texto integral das questões e de suas respectivas alternativas.
2. Cruze com o Gabarito Oficial para marcar 'is_correta: true' na alternativa certa.
3. Identifique banca, órgão, ano e disciplina de forma precisa.

Retorne EXCLUSIVAMENTE um array JSON no seguinte formato:
[
  {
    "banca": "Nome da banca",
    "orgao": "Órgão do concurso",
    "ano": 2026,
    "disciplina": "Nome da matéria",
    "assunto": "Assunto principal da questão",
    "enunciado": "Enunciado da questão...",
    "explicacao": "Gabarito ou comentário resumido se houver",
    "alternativas": [
      { "texto": "Texto alternativa A", "is_correta": false },
      { "texto": "Texto alternativa B", "is_correta": true }
    ]
  }
]`;

    const result = await model.generateContent([
      prompt,
      { inlineData: { data: provaBuffer.toString("base64"), mimeType: "application/pdf" } },
      { inlineData: { data: gabaritoBuffer.toString("base64"), mimeType: "application/pdf" } },
    ]);

    let respostaTexto = result.response.text();
    respostaTexto = respostaTexto.replace(/```json/gi, "").replace(/```/g, "").trim();

    const questoesJSON = JSON.parse(respostaTexto);

    if (!Array.isArray(questoesJSON)) {
      throw new Error("A IA não retornou um array de questões estruturado.");
    }

    return NextResponse.json({ questoes: questoesJSON });
  } catch (err: any) {
    console.error("Erro em /api/admin/processar-pdf:", err);
    return NextResponse.json(
      { error: err.message || "Falha ao processar os PDFs com Inteligência Artificial." },
      { status: 500 }
    );
  }
}