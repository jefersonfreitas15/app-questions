import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export const maxDuration = 60; 

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const provaFile = formData.get('prova') as File;
    const gabaritoFile = formData.get('gabarito') as File;

    if (!provaFile || !gabaritoFile) {
      return NextResponse.json({ error: 'Faltam ficheiros (prova ou gabarito).' }, { status: 400 });
    }

    const provaBuffer = Buffer.from(await provaFile.arrayBuffer());
    const gabaritoBuffer = Buffer.from(await gabaritoFile.arrayBuffer());
    
    const provaBase64 = provaBuffer.toString('base64');
    const gabaritoBase64 = gabaritoBuffer.toString('base64');

    const model = genAI.getGenerativeModel({ 
      model: "gemini-3.8-flash",
      generationConfig: { responseMimeType: "application/json" }
    });

    const prompt = `
      Você é um especialista em extração de dados de concursos públicos brasileiros.
      Em anexo, envio-lhe dois arquivos PDF nativos: o Caderno de Prova e o Gabarito Oficial.
      
      Sua tarefa (Seja rápido e preciso):
      1. Leia as questões da Prova e as suas alternativas.
      2. Cruze com as respostas do Gabarito para descobrir qual é a alternativa correta.
      3. Extraia e devolva ESTRITAMENTE um array JSON com as questões formatadas.
      
      Formato EXATO obrigatório do JSON:
      [
        {
          "enunciado": "Texto completo da pergunta",
          "banca": "Nome da Banca (ex: FGV, Cebraspe, FCC)",
          "orgao": "Órgão do concurso",
          "ano": 2026,
          "disciplina": "Tente adivinhar a disciplina (ex: Português, Direito Administrativo)",
          "alternativas": [
            { "texto": "Texto da alternativa A", "letra": "A", "is_correta": false },
            { "texto": "Texto da alternativa B", "letra": "B", "is_correta": true }
          ]
        }
      ]
    `;

    const result = await model.generateContent([
      prompt,
      { inlineData: { data: provaBase64, mimeType: "application/pdf" } },
      { inlineData: { data: gabaritoBase64, mimeType: "application/pdf" } }
    ]);

    let respostaTexto = result.response.text();
    respostaTexto = respostaTexto.replace(/```json/g, '').replace(/```/g, '').trim();

    const questoesJSON = JSON.parse(respostaTexto);

    // ALTERAÇÃO: O servidor já não grava no banco. Apenas devolve as questões para o frontend exibir a pré-visualização.
    return NextResponse.json({ questoes: questoesJSON });

  } catch (err: any) {
    console.error("Erro no processamento:", err);
    // Garante que o frontend recebe sempre um JSON limpo, evitando o erro "Unexpected token"
    return NextResponse.json({ error: err.message || "Erro na IA ao processar o PDF." }, { status: 500 });
  }
}