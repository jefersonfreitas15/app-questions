import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { GoogleGenerativeAI } from '@google/generative-ai';
// @ts-ignore
import pdfParse from 'pdf-parse';

const supabase = createClient(
  process.env.SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_ROLE_KEY as string
);

// Inicializa o Gemini com a chave da Vercel
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const provaFile = formData.get('prova') as File;
    const gabaritoFile = formData.get('gabarito') as File;

    if (!provaFile || !gabaritoFile) {
      return NextResponse.json({ error: 'Faltam ficheiros (prova ou gabarito).' }, { status: 400 });
    }

    // Lê os ficheiros PDF para texto
    const provaBuffer = Buffer.from(await provaFile.arrayBuffer());
    const gabaritoBuffer = Buffer.from(await gabaritoFile.arrayBuffer());
    
    const provaData = await pdfParse(provaBuffer);
    const gabaritoData = await pdfParse(gabaritoBuffer);

    // Configura o Gemini para forçar uma resposta em JSON perfeito
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      generationConfig: { responseMimeType: "application/json" }
    });

    const prompt = `
      Você é um especialista em extração de dados de concursos públicos brasileiros.
      Abaixo, forneço o texto extraído de um Caderno de Prova (PDF) e o texto do Gabarito.
      
      Sua tarefa:
      1. Leia as questões da Prova e suas alternativas.
      2. Cruze com as respostas do Gabarito para descobrir qual é a alternativa correta.
      3. Extraia e devolva ESTRITAMENTE um array JSON com as questões formatadas.
      
      Formato EXATO obrigatório do JSON:
      [
        {
          "enunciado": "Texto completo da pergunta da prova",
          "banca": "Nome da Banca Organizadora (se achar, senão 'Desconhecida')",
          "orgao": "Órgão do concurso (ex: Polícia Civil, Tribunal de Contas)",
          "ano": 2024,
          "alternativas": [
            { "texto": "Texto da alternativa A", "letra": "A", "is_correct": false },
            { "texto": "Texto da alternativa B", "letra": "B", "is_correct": true }
          ]
        }
      ]

      --- TEXTO DA PROVA ---
      ${provaData.text.substring(0, 50000)}

      --- TEXTO DO GABARITO ---
      ${gabaritoData.text.substring(0, 10000)}
    `;

    // Processa com o Gemini
    const result = await model.generateContent(prompt);
    const questoesJSON = JSON.parse(result.response.text());

    let inseridas = 0;

    // Grava no Supabase (Tabelas 'questoes' e 'alternativas')
    for (const q of questoesJSON) {
      // Ajuste os nomes dos campos abaixo (ex: 'enunciado', 'banca') caso a sua tabela do Supabase use nomes diferentes
      const { data: questaoData, error: qError } = await supabase
        .from('questoes')
        .insert([{ 
          enunciado: q.enunciado, 
          banca: q.banca, 
          orgao: q.orgao, 
          ano: q.ano 
        }])
        .select('id')
        .single();

      if (qError) {
        console.error("Erro ao inserir questão:", qError);
        continue;
      }

      // Adiciona o ID da questão a cada alternativa e grava
      const altsParaInserir = q.alternativas.map((a: any) => ({
        questao_id: questaoData.id,
        texto: a.texto,
        letra: a.letra,
        is_correct: a.is_correct // No seu Supabase pode ser 'correta' em vez de 'is_correct'
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