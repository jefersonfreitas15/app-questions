import fs from "fs";
import path from "path";
import { createClient } from "@supabase/supabase-js";

// 1. Carrega as variáveis do ficheiro .env.local automaticamente
const envPath = path.resolve(process.cwd(), ".env.local");
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf-8");
  envContent.split(/\r?\n/).forEach((line) => {
    const match = line.match(/^([^=:#]+?)[=:](.*)/);
    if (match) {
      const key = match[1].trim();
      const value = match[2].trim().replace(/^['"]|['"]$/g, "");
      if (!process.env[key]) process.env[key] = value;
    }
  });
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error(
    "❌ Erro: NEXT_PUBLIC_SUPABASE_URL ou NEXT_PUBLIC_SUPABASE_ANON_KEY não encontrados no .env.local"
  );
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const LETRAS = ["A", "B", "C", "D", "E", "F"];

const BASE_TEORICA = {
  "Direito Constitucional":
    "em conformidade com o texto expresso da Constituição Federal de 1988 e a jurisprudência pacificada do Supremo Tribunal Federal (STF)",
  "Direito Administrativo":
    "à luz dos princípios do regime jurídico-administrativo, da Lei nº 14.133/2021 (Nova Lei de Licitações) e do entendimento doutrinário e jurisprudencial dos Tribunais Superiores e Cortes de Contas",
  "Administração Financeira e Orçamentária":
    "segundo as normas de Finanças Públicas (Lei nº 4.320/1964, Lei Complementar nº 101/2000 - LRF e Manual de Contabilidade Aplicada ao Setor Público - MCASP)",
  "Controle Externo":
    "consoante as competências constitucionais dos Tribunais de Contas (arts. 70 a 75 da CF/88) e a jurisprudência consolidada do TCU e dos Tribunais de Contas Estaduais",
  "Contabilidade Pública":
    "de acordo com as Normas Brasileiras de Contabilidade Aplicadas ao Setor Público (NBC TSP) e as diretrizes do MCASP/STN",
  "Língua Portuguesa":
    "de acordo com as regras da norma-padrão da língua portuguesa, a gramática normativa e as relações de coesão, coerência e semântica textual cobradas pela banca",
  "Raciocínio Lógico":
    "aplicando as propriedades fundamentais da lógica proposicional, tabelas-verdade, equivalências lógicas e análise combinatória/quantitativa",
  "Informática":
    "conforme os conceitos técnicos de arquitetura de sistemas, segurança da informação, redes de computadores e ferramentas de produtividade vigentes",
  "Engenharia Civil":
    "em observância às normas técnicas da ABNT (NBRs), ao Decreto nº 7.983/2013 (SINAPI/SICRO) e à jurisprudência técnica do TCU sobre auditoria de obras públicas",
  "Auditor Fiscal / Tributário":
    "nos termos do Sistema Tributário Nacional (CF/88), do Código Tributário Nacional (Lei nº 5.172/1966) e da jurisprudência dos Tribunais Superiores",
};

async function gerarComGemini(questao, altCorreta, todasAlternativas) {
  if (!GEMINI_API_KEY) return null;

  try {
    const listaAlts = (todasAlternativas || [])
      .map((a) => `${a.letraCalculada}) ${a.texto}`)
      .join("\n");

    const prompt = `Você é um professor especialista em concursos públicos. Redija uma fundamentação direta, técnica e didática (em 1 parágrafo de 3 a 5 linhas, sem markdown de títulos) explicando por que o gabarito desta questão da banca ${questao.banca || "examinadora"} (${questao.orgao || ""} - ${questao.ano || ""}), disciplina "${questao.disciplina || ""}", assunto "${questao.assunto || ""}", é a alternativa ${altCorreta?.letraCalculada || ""}: "${altCorreta?.texto || ""}".\n\nEnunciado: ${questao.enunciado}\n\nAlternativas:\n${listaAlts}`;

    const resp = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      }
    );

    if (!resp.ok) return null;
    const json = await resp.json();
    const texto = json?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    return texto || null;
  } catch {
    return null;
  }
}

function montarFundamentacaoEstruturada(questao, altCorreta, todasAlternativas) {
  const disciplina = questao.disciplina || "Conhecimentos Gerais";
  const assunto = questao.assunto || "conteúdo programático do edital";
  const banca = questao.banca || "banca examinadora";
  const orgao = questao.orgao ? ` (${questao.orgao} - ${questao.ano || ""})` : "";

  const complementoTeorico =
    BASE_TEORICA[disciplina] ||
    "em estrita observância aos parâmetros técnicos, normativos e doutrinários exigidos em provas de concursos públicos";

  const ehCertoErrado =
    todasAlternativas?.length === 2 &&
    todasAlternativas.some((a) =>
      ["certo", "errado", "c", "e"].includes(
        (a.texto || "").trim().toLowerCase()
      )
    );

  if (ehCertoErrado && altCorreta) {
    const julgamento = altCorreta.texto.toUpperCase();
    return `Gabarito Oficial: ${julgamento}. Na avaliação da banca ${banca}${orgao} acerca de ${disciplina} — especificamente no tópico de ${assunto} —, o item foi julgado como ${julgamento} ${complementoTeorico}. A proposição apresentada no enunciado ${
      julgamento.startsWith("C")
        ? "reproduz com exatidão os preceitos técnicos e legais aplicáveis à matéria, sem incorrer em extrapolação ou inversão conceitual."
        : "apresenta incorreção técnica ou desvio em relação à norma/jurisprudência de regência, razão pela qual o item está incorreto."
    }`;
  }

  if (altCorreta) {
    const letra = altCorreta.letraCalculada || "Correta";
    const textoCorreto = (altCorreta.texto || "").trim();
    return `Gabarito Oficial: Alternativa ${letra}. No estudo de ${disciplina} (tópico: ${assunto}), cobrado pela banca ${banca}${orgao}, a assertiva correta é "${textoCorreto}". Tal conclusão fundamenta-se ${complementoTeorico}, uma vez que esta alternativa sintetiza com precisão o requisito técnico/legal exigido pelo comando da questão, enquanto as demais opções apresentam distorções conceituais, exceções inaplicáveis ou contrariedade direta à norma de regência.`;
  }

  return `Análise Técnica (${disciplina} — ${assunto}): Questão elaborada pela banca ${banca}${orgao}, avaliando o domínio técnico ${complementoTeorico}. Recomenda-se atenção aos conceitos-chave do enunciado e à distinção entre a regra geral e as exceções previstas na legislação e na jurisprudência aplicáveis.`;
}

async function executar() {
  console.log("🚀 Iniciando varredura de questões sem Fundamentação do Professor...");

  let totalAtualizadas = 0;
  let lote = 1;
  const TAMANHO_LOTE = 200;

  while (true) {
    const { data: questoes, error } = await supabase
      .from("questoes")
      .select("id, enunciado, banca, orgao, ano, disciplina, assunto, explicacao, alternativas(*)")
      .or("explicacao.is.null,explicacao.eq.")
      .limit(TAMANHO_LOTE);

    if (error) {
      console.error("❌ Erro ao buscar questões:", error.message);
      break;
    }

    if (!questoes || questoes.length === 0) {
      break;
    }

    console.log(
      `📦 Processando Lote #${lote} (${questoes.length} questões sem fundamentação)...`
    );

    for (const q of questoes) {
      const alternativasOrdenadas = (q.alternativas || [])
        .sort((a, b) => (a.id || 0) - (b.id || 0))
        .map((alt, idx) => ({
          ...alt,
          letraCalculada: alt.letra || LETRAS[idx] || String(idx + 1),
        }));

      const altCorreta = alternativasOrdenadas.find(
        (a) => a.is_correta === true || a.correta === true
      );

      let novaExplicacao = await gerarComGemini(
        q,
        altCorreta,
        alternativasOrdenadas
      );
      if (!novaExplicacao) {
        novaExplicacao = montarFundamentacaoEstruturada(
          q,
          altCorreta,
          alternativasOrdenadas
        );
      }

      const { error: updateError } = await supabase
        .from("questoes")
        .update({ explicacao: novaExplicacao })
        .eq("id", q.id);

      if (updateError) {
        console.error(
          `⚠️ Erro ao atualizar questão ID ${q.id}:`,
          updateError.message
        );
      } else {
        totalAtualizadas++;
      }
    }

    console.log(`✅ Até agora: ${totalAtualizadas} fundamentações guardadas na base de dados.`);
    lote++;
  }

  console.log(
    `\n🎉 Concluído! Total de questões atualizadas com Fundamentação do Professor: ${totalAtualizadas}`
  );
}

executar();