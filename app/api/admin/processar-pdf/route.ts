import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { GoogleGenerativeAI } from '@google/generative-ai';

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

    // Lê os ficheiros PDF e converte diretamente para Base64 (Formato que o Gemini lê nativamente)
    const provaBuffer = Buffer.from(await provaFile.arrayBuffer());
    const gabaritoBuffer = Buffer.from(await gabaritoFile.arrayBuffer());
    
    const provaBase64 = provaBuffer.toString('base64');
    const gabaritoBase64 = gabaritoBuffer.toString('base64');

    // Configura o Gemini para forçar uma resposta em JSON perfeito
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-pro", // Deixe exatamente assim
      generationConfig: { responseMimeType: "application/json" }
    });

    const prompt = `
      Você é um especialista em extração de dados de concursos públicos brasileiros.
      Em anexo, envio-lhe dois arquivos PDF nativos: o primeiro é o Caderno de Prova e o segundo é o Gabarito Oficial.
      
      Sua tarefa:
      1. Leia as questões da Prova e as suas alternativas.
      2. Cruze com as respostas do Gabarito para descobrir qual é a alternativa correta.
      3. Extraia e devolva ESTRITAMENTE um array JSON com as questões formatadas.
      
      Formato EXATO obrigatório do JSON:
      [
        {
          "enunciado": "Texto completo da pergunta da prova",
          "banca": "Nome da Banca Organizadora (se achar, senão 'Desconhecida')",
          "orgao": "Órgão do concurso (ex: Polícia Civil, Tribunal de Contas)",
          "ano": 2024,
          "disciplina": "Tente adivinhar a disciplina (ex: Português, Direito Administrativo)",
          "alternativas": [
            { "texto": "Texto da alternativa A", "letra": "A", "is_correct": false },
            { "texto": "Texto da alternativa B", "letra": "B", "is_correct": true }
          ]
        }
      ]
    `;

    // Envia o prompt de texto + os 2 PDFs anexados diretamente para a "cabeça" da IA
    const result = await model.generateContent([
      prompt,
      { inlineData: { data: provaBase64, mimeType: "application/pdf" } },
      { inlineData: { data: gabaritoBase64, mimeType: "application/pdf" } }
    ]);

    const respostaTexto = result.response.text();
    
    // Tenta interpretar o JSON retornado pelo Gemini
    let questoesJSON;
    try {
      questoesJSON = JSON.parse(respostaTexto);
    } catch (parseError) {
      console.error("Gemini não retornou um JSON válido:", respostaTexto);
      return NextResponse.json({ error: 'O Gemini falhou a formatar as questões em JSON.' }, { status: 500 });
    }

    let inseridas = 0;

    // Grava no Supabase (Tabelas 'questoes' e 'alternativas')
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

      if (qError) {
        console.error("Erro ao inserir questão:", qError);
        continue;
      }

      // Adiciona o ID da questão a cada alternativa e grava
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