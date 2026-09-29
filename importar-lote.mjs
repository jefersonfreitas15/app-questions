import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

// 1. Lê automaticamente as chaves do seu arquivo .env.local
function carregarVariaveisAmbiente() {
  const caminhoEnv = path.resolve(process.cwd(), '.env.local');
  if (!fs.existsSync(caminhoEnv)) {
    console.error('❌ Arquivo .env.local não encontrado na raiz do projeto.');
    process.exit(1);
  }

  const conteudo = fs.readFileSync(caminhoEnv, 'utf-8');
  const variaveis = {};

  conteudo.split('\n').forEach((linha) => {
    const limpa = linha.trim();
    if (limpa && !limpa.startsWith('#')) {
      const [chave, ...resto] = limpa.split('=');
      if (chave && resto.length > 0) {
        variaveis[chave.trim()] = resto.join('=').trim().replace(/^['"]|['"]$/g, '');
      }
    }
  });

  return variaveis;
}

const env = carregarVariaveisAmbiente();
const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ As variáveis NEXT_PUBLIC_SUPABASE_URL ou NEXT_PUBLIC_SUPABASE_ANON_KEY não estão no .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// 2. Função principal de importação em massa
async function importarQuestoes() {
  const caminhoJson = path.resolve(process.cwd(), 'lote-questoes.json');

  if (!fs.existsSync(caminhoJson)) {
    console.error('❌ Arquivo lote-questoes.json não encontrado na raiz do projeto.');
    process.exit(1);
  }

  const dadosBrutos = fs.readFileSync(caminhoJson, 'utf-8');
  const listaQuestoes = JSON.parse(dadosBrutos);

  console.log(`🚀 Iniciando importação de ${listaQuestoes.length} questões para o Qpro Concursos...\n`);

  let inseridas = 0;
  let ignoradasDuplicadas = 0;
  let erros = 0;

  for (let i = 0; i < listaQuestoes.length; i++) {
    const item = listaQuestoes[i];

    // Insere a questão principal
    const { data: novaQuestao, error: erroQuestao } = await supabase
      .from('questoes')
      .insert([
        {
          banca: (item.banca || 'FGV').trim().toUpperCase(),
          orgao: (item.orgao || 'GERAL').trim().toUpperCase(),
          ano: Number(item.ano) || 2025,
          area: item.area || 'Conhecimentos Gerais',
          disciplina: (item.disciplina || 'Conhecimentos Gerais').trim(),
          assunto: (item.assunto || 'Geral').trim(),
          enunciado: item.enunciado.trim(),
          explicacao: (item.explicacao || '').trim(),
        },
      ])
      .select('id')
      .single();

    if (erroQuestao) {
      // Código 23505 no PostgreSQL significa que a questão já existe (índice MD5 único)
      if (erroQuestao.code === '23505') {
        ignoradasDuplicadas++;
        console.log(`⏩ [${i + 1}/${listaQuestoes.length}] Já existe no banco (ignorada): "${item.enunciado.substring(0, 45)}..."`);
        continue;
      } else {
        erros++;
        console.error(`❌ [${i + 1}/${listaQuestoes.length}] Erro ao inserir questão:`, erroQuestao.message);
        continue;
      }
    }

    // Insere as alternativas vinculadas à questão recém-criada
    if (Array.isArray(item.alternativas) && item.alternativas.length > 0) {
      const payloadAlternativas = item.alternativas.map((alt) => ({
        questao_id: novaQuestao.id,
        texto: alt.texto.trim(),
        is_correta: Boolean(alt.is_correta),
      }));

      const { error: erroAlts } = await supabase
        .from('alternativas')
        .insert(payloadAlternativas);

      if (erroAlts) {
        console.error(`⚠️ Erro nas alternativas da questão ID ${novaQuestao.id}:`, erroAlts.message);
      }
    }

    inseridas++;
    console.log(`✅ [${i + 1}/${listaQuestoes.length}] Importada com sucesso: [${item.disciplina}] ${item.assunto}`);
  }

  console.log('\n==================================================');
  console.log(`🎉 RESUMO DA IMPORTAÇÃO (QPRO CONCURSOS):`);
  console.log(`   ✅ Novas questões cadastradas: ${inseridas}`);
  console.log(`   ⏩ Duplicadas ignoradas:       ${ignoradasDuplicadas}`);
  console.log(`   ❌ Erros:                      ${erros}`);
  console.log('==================================================\n');
}

importarQuestoes();