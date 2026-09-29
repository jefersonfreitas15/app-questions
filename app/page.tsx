import { FiltersSidebar } from "@/components/simulado/filters-sidebar";
import {
  CadernoQuestoes,
  PainelDesempenho,
  BotaoNovaQuestao,
  SeletorTema,
} from "@/components/simulado/question-card";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const filtrosAtivos = await searchParams;

  const banca = filtrosAtivos.banca || "";
  const orgao = filtrosAtivos.orgao || "";
  const ano = filtrosAtivos.ano || "";
  const disciplina = filtrosAtivos.disciplina || "";
  const assunto = filtrosAtivos.assunto || "";

  const temFiltroAtivo = Boolean(banca || orgao || ano || disciplina || assunto);

  // 1. Busca das questões filtradas com contagem exata no banco
  let query = supabase
    .from("questoes")
    .select("*, alternativas(*)", { count: "exact" })
    .order("id", { ascending: false })
    .limit(100);

  if (banca) query = query.eq("banca", banca);
  if (orgao) query = query.eq("orgao", orgao);
  if (ano) query = query.eq("ano", Number(ano));
  if (disciplina) query = query.eq("disciplina", disciplina);
  if (assunto) query = query.eq("assunto", assunto);

  // 2. Cruzamento dinâmico dos filtros em cascata (sem depender de alteração no SQL)
  const buscarMetadadosCascata = async () => {
    const criarQueryMeta = (ignorarCampo: string) => {
      let q = supabase
        .from("questoes")
        .select("banca, orgao, ano, disciplina, assunto")
        .limit(5000);

      if (banca && ignorarCampo !== "banca") q = q.eq("banca", banca);
      if (orgao && ignorarCampo !== "orgao") q = q.eq("orgao", orgao);
      if (ano && ignorarCampo !== "ano") q = q.eq("ano", Number(ano));
      if (disciplina && ignorarCampo !== "disciplina") q = q.eq("disciplina", disciplina);
      if (assunto && ignorarCampo !== "assunto") q = q.eq("assunto", assunto);

      return q;
    };

    const [resBanca, resOrgao, resAno, resDisc, resAssunto] = await Promise.all([
      criarQueryMeta("banca"),
      criarQueryMeta("orgao"),
      criarQueryMeta("ano"),
      criarQueryMeta("disciplina"),
      criarQueryMeta("assunto"),
    ]);

    const extrairUnicos = (dados: any[] | null, chave: string, decrescente = false) => {
      if (!dados) return [];
      const valores = Array.from(
        new Set(
          dados
            .map((item) => (item[chave] != null ? String(item[chave]).trim() : ""))
            .filter(Boolean)
        )
      );
      return decrescente
        ? valores.sort((a, b) => b.localeCompare(a, "pt-BR", { numeric: true }))
        : valores.sort((a, b) => a.localeCompare(b, "pt-BR"));
    };

    return {
      banca: extrairUnicos(resBanca.data, "banca"),
      orgao: extrairUnicos(resOrgao.data, "orgao"),
      ano: extrairUnicos(resAno.data, "ano", true),
      disciplina: extrairUnicos(resDisc.data, "disciplina"),
      assunto: extrairUnicos(resAssunto.data, "assunto"),
    };
  };

  const [questoesRes, opcoesBaseRes, opcoesCascata, respostasRes] = await Promise.all([
    query,
    !temFiltroAtivo ? supabase.rpc("obter_opcoes_filtros") : Promise.resolve({ data: null }),
    temFiltroAtivo ? buscarMetadadosCascata() : Promise.resolve(null),
    supabase.from("respostas_usuarios").select("*"),
  ]);

  const questoesFiltradas = questoesRes.data || [];
  const totalExibido = questoesRes.count ?? questoesFiltradas.length;

  const opcoesData = temFiltroAtivo ? opcoesCascata : opcoesBaseRes.data;

  const opcoesDoBanco = {
    banca: opcoesData?.banca || [],
    orgao: opcoesData?.orgao || [],
    ano: (opcoesData?.ano || []).map(String),
    disciplina: opcoesData?.disciplina || [],
    assunto: opcoesData?.assunto || [],
  };

  const initialRespostas = respostasRes.data || [];

  return (
    <div
      id="simulado-root"
      className="min-h-svh bg-[#F8FAFC] text-slate-900 transition-colors duration-200"
    >
      {/* Cabeçalho com a Identidade Visual Qpro Concursos */}
      <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-3.5">
          {/* Logo e Título */}
          <div className="flex items-center justify-between sm:justify-start gap-3.5">
            <div className="flex items-center gap-3.5">
              <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-600 text-white shadow-md shadow-indigo-200/80">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  className="h-6 w-6 text-white"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M8 2v3" />
                  <path d="M12 2v3" />
                  <path d="M16 2v3" />
                  <rect
                    x="4"
                    y="4"
                    width="16"
                    height="18"
                    rx="3"
                    className="fill-white/10"
                  />
                  <path d="M8 10h8" />
                  <path d="M8 14h5" />
                  <path d="M8 18h3" />
                </svg>
                <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-[10px] font-extrabold text-white ring-2 ring-white shadow-xs">
                  ✓
                </span>
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-lg sm:text-xl font-extrabold tracking-tight text-slate-900">
                    <span className="text-indigo-600">Q</span>pro
                  </h1>
                  <span className="rounded-md bg-indigo-50 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider text-indigo-700 border border-indigo-200/60">
                    Concursos
                  </span>
                </div>
                <p className="text-xs font-medium text-slate-500 mt-0.5">
                  Plataforma Inteligente de Questões
                </p>
              </div>
            </div>

            {/* Ações visíveis apenas em mobile ao lado do logo se houver espaço, ou integradas */}
            <div className="flex sm:hidden items-center gap-1.5">
              <SeletorTema />
            </div>
          </div>

          {/* Botões de Ação (Responsivos: linha em telas médias/grandes, ajustados em telemóvel) */}
          <div className="flex items-center justify-between sm:justify-end gap-2 pt-1 sm:pt-0 border-t border-slate-100 sm:border-0">
            <div className="hidden sm:flex items-center gap-2">
              <SeletorTema />
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto [&>*]:flex-1 sm:[&>*]:flex-none">
              <BotaoNovaQuestao />
            </div>
          </div>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        <PainelDesempenho
          initialRespostas={initialRespostas}
          questions={questoesFiltradas}
        />
        <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
          <FiltersSidebar dbOptions={opcoesDoBanco} />
          <CadernoQuestoes
            questions={questoesFiltradas}
            totalCount={totalExibido}
            filtros={{
              banca,
              orgao,
              ano,
              disciplina,
              assunto,
            }}
          />
        </div>
      </main>
    </div>
  );
}