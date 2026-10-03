import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { GoogleGenerativeAI } from '@google/generative-ai';

const supabase = createClient(
  process.env.SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_ROLE_KEY as string
);

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
            { "texto": "Texto da alternativa A", "letra": "A", "is_correct": false },
            { "texto": "Texto da alternativa B", "letra": "B", "is_correct": true }
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
    
    // LIMPEZA CRÍTICA: Remove a formatação markdown que a IA pode inserir
    respostaTexto = respostaTexto.replace(/```json/g, '').replace(/```/g, '').trim();

    const questoesJSON = JSON.parse(respostaTexto);

    let inseridas = 0;

    for (const q of questoesJSON) {
      const { data: questaoData, error: qError } = await supabase
        .from('questoes')
        .insert([{ 
          enunciado: q.enunciado, 
          banca: q.banca, 
          orgao: q.orgao, 
          ano: q.ano,
          disciplina: q.disciplina || 'Geral'
        }])
        .select('id')
        .single();

      if (qError) continue;

      const altsParaInserir = q.alternativas.map((a: any) => ({
        questao_id: questaoData.id,
        texto: a.texto,
        letra: a.letra,
        is_correta: a.is_correct || a.is_correta
      }));

      const { error: aError } = await supabase
        .from('alternativas')
        .insert(altsParaInserir);

      if (!aError) inseridas++;
    }

    return NextResponse.json({ success: true, questoesInseridas: inseridas });

  } catch (err: any) {
    console.error("Erro no processamento:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}