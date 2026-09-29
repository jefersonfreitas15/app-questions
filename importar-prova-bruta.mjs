import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

function carregarVariaveisAmbiente() {
  const caminhoEnv = path.resolve(process.cwd(), '.env.local');
  if (!fs.existsSync(caminhoEnv)) {
    console.error('❌ Arquivo .env.local não encontrado.');
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
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function processarProvaBruta() {
  const caminhoTxt = path.resolve(process.cwd(), 'prova-bruta.txt');
  if (!fs.existsSync(caminhoTxt)) {
    console.error('❌ Crie o arquivo prova-bruta.txt na raiz do projeto.');
    process.exit(1);
  }

  const texto = fs.readFileSync(caminhoTxt, 'utf-8');

  // Divide o arquivo em blocos separados por "---"
  const blocos = texto
    .split(/\n-{3,}\n/)
    .map((b) => b.trim())
    .filter(Boolean);

  console.log(`📄 Lendo ${blocos.length} blocos de questões do arquivo prova-bruta.txt...\n`);

  let inseridas = 0;
  let duplicadas = 0;

  for (let i = 0; i < blocos.length; i++) {
    const linhas = blocos[i].split('\n').map((l) => l.trim()).filter(Boolean);

    let banca = 'FGV';
    let orgao = 'GERAL';
    let ano = 2025;
    let disciplina = 'Conhecimentos Específicos';
    let assunto = 'Geral';
    let gabarito = 'A';
    let explicacao = '';
    const linhasConteudo = [];

    // Lê os cabeçalhos opcionais ou usa os padrões
    for (const linha of linhas) {
      if (linha.toUpperCase().startsWith('BANCA:')) {
        banca = linha.substring(6).trim();
      } else if (linha.toUpperCase().startsWith('ORGAO:') || linha.toUpperCase().startsWith('ÓRGÃO:')) {
        orgao = linha.substring(6).trim();
      } else if (linha.toUpperCase().startsWith('ANO:')) {
        ano = Number(linha.substring(4).trim()) || 2025;
      } else if (linha.toUpperCase().startsWith('DISCIPLINA:')) {
        disciplina = linha.substring(11).trim();
      } else if (linha.toUpperCase().startsWith('ASSUNTO:')) {
        assunto = linha.substring(8).trim();
      } else if (linha.toUpperCase().startsWith('GABARITO:')) {
        gabarito = linha.substring(9).trim().toUpperCase().charAt(0);
      } else if (linha.toUpperCase().startsWith('COMENTARIO:') || linha.toUpperCase().startsWith('COMENTÁRIO:')) {
        explicacao = linha.substring(11).trim();
      } else {
        linhasConteudo.push(linha);
      }
    }

    // Separa o enunciado das alternativas A), B), C), D), E)
    const enunciadoPartes = [];
    const alternativasExtraidas = [];
    let letraAtual = null;
    let textoAltAtual = '';

    const regexAlt = /^[\(\[]?([A-E])[\)\]\.\-]\s+(.*)$/i;

    for (const linha of linhasConteudo) {
      const match = linha.match(regexAlt);
      if (match) {
        if (letraAtual) {
          alternativasExtraidas.push({
            letra: letraAtual.toUpperCase(),
            texto: textoAltAtual.trim(),
            is_correta: letraAtual.toUpperCase() === gabarito,
          });
        }
        letraAtual = match[1];
        textoAltAtual = match[2];
      } else {
        if (letraAtual) {
          textoAltAtual += ' ' + linha;
        } else {
          enunciadoPartes.push(linha);
        }
      }
    }

    if (letraAtual) {
      alternativasExtraidas.push({
        letra: letraAtual.toUpperCase(),
        texto: textoAltAtual.trim(),
        is_correta: letraAtual.toUpperCase() === gabarito,
      });
    }

    const enunciadoFinal = enunciadoPartes.join(' ').trim();

    if (!enunciadoFinal || alternativasExtraidas.length < 2) {
      console.log(`⚠️ Bloco #${i + 1} ignorado (formato incompleto).`);
      continue;
    }

    const { data: novaQuestao, error: erroQ } = await supabase
      .from('questoes')
      .insert([
        {
          banca,
          orgao,
          ano,
          disciplina,
          assunto,
          enunciado: enunciadoFinal,
          explicacao: explicacao || `Gabarito Oficial: Alternativa ${gabarito}.`,
        },
      ])
      .select('id')
      .single();

    if (erroQ) {
      if (erroQ.code === '23505') {
        duplicadas++;
        console.log(`⏩ Bloco #${i + 1} já existe no banco (ignorado).`);
      } else {
        console.error(`❌ Erro no bloco #${i + 1}:`, erroQ.message);
      }
      continue;
    }

    await supabase.from('alternativas').insert(
      alternativasExtraidas.map((a) => ({
        questao_id: novaQuestao.id,
        texto: a.texto,
        is_correta: a.is_correta,
      }))
    );

    inseridas++;
    console.log(`✅ Bloco #${i + 1} importado: [${disciplina}] Gabarito ${gabarito}`);
  }

  console.log(`\n🎉 Finalizado! Novas: ${inseridas} | Duplicadas ignoradas: ${duplicadas}\n`);
}

processarProvaBruta();