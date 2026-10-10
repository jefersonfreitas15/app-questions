import { FiltersSidebar } from "@/components/simulado/filters-sidebar";
import {
  CadernoQuestoes,
  PainelDesempenho,
  BotaoNovaQuestao,
  SeletorTema,
} from "@/components/simulado/question-card";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

// Função utilitária para prevenir que parâmetros duplicados na URL (Array) quebrem a aplicação
const getParam = (param: string | string[] | undefined): string => {
  if (Array.isArray(param)) return param[0] || "";
  return param || "";
};

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;

  // 1. Extração Segura e Tipada dos Parâmetros
  const banca = getParam(params.banca);
  const orgao = getParam(params.orgao);
  const ano = getParam(params.ano);
  const disciplina = getParam(params.disciplina);
  const assunto = getParam(params.assunto);
  
  // Extração da página atual para cálculo de paginação no servidor
  const currentPage = parseInt(getParam(params.page)) || 1;
  const itemsPerPage = 20;
  const from = (currentPage - 1) * itemsPerPage;
  const to = from + itemsPerPage - 1;

  // 2. Construção Dinâmica da Query de Questões (com range para paginação)
  let query = supabase
    .from("questoes")
    .select("*, alternativas(*)", { count: "exact" });

  if (banca) query = query.eq("banca", banca);
  if (orgao) query = query.eq("orgao", orgao);
  if (disciplina) query = query.eq("disciplina", disciplina);
  if (assunto) query = query.eq("assunto", assunto);
  
  // Validação estrita para evitar envio de "NaN" ao PostgreSQL
  const anoNumerico = parseInt(ano);
  if (!isNaN(anoNumerico)) {
    query = query.eq("ano", anoNumerico);
  }

  // Ordenação padronizada e aplicação da paginação matemática
  query = query.order("id", { ascending: false }).range(from, to);

  // 3. Execução Paralela Otimizada com Tratamento de Erros
  // NOTA: A busca global de 'respostas_usuarios' foi removida por questões de privacidade/segurança.
  const [questoesResponse, filtrosResponse] = await Promise.all([
    query,
    supabase.rpc("obter_filtros_cascata", {
      p_banca: banca || null,
      p_orgao: orgao || null,
      p_ano: !isNaN(anoNumerico) ? anoNumerico : null,
      p_disciplina: disciplina || null,
      p_assunto: assunto || null,
    })
  ]);

  if (questoesResponse.error) {
    console.error("Falha ao buscar questões:", questoesResponse.error);
  }

  if (filtrosResponse.error) {
    console.error("Falha ao buscar filtros em cascata:", filtrosResponse.error);
  }

  // 4. Preparação de Dados para Injeção no Cliente
  const questoesFiltradas = questoesResponse.data || [];
  const totalExibido = questoesResponse.count ?? 0;
  const opcoesCascata = filtrosResponse.data;

  // Mapeamento defensivo para evitar quebras se a RPC retornar nulo
  const opcoesDoBanco = {
    banca: Array.isArray(opcoesCascata?.banca) ? opcoesCascata.banca : [],
    orgao: Array.isArray(opcoesCascata?.orgao) ? opcoesCascata.orgao : [],
    ano: Array.isArray(opcoesCascata?.ano) ? opcoesCascata.ano.map(String) : [],
    disciplina: Array.isArray(opcoesCascata?.disciplina) ? opcoesCascata.disciplina : [],
    assunto: Array.isArray(opcoesCascata?.assunto) ? opcoesCascata.assunto : [],
  };

  return (
    <div id="simulado-root" className="min-h-svh bg-[#F8FAFC] text-slate-900 transition-colors duration-200">
      <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-3.5">
          
          <div className="flex items-center justify-between sm:justify-start gap-3.5">
            <div className="flex items-center gap-3.5">
              <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-600 text-white shadow-md shadow-indigo-200/80">
                <svg
                  viewBox="0 0 24 24" fill="none" className="h-6 w-6 text-white"
                  stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                >
                  <path d="M8 2v3" /><path d="M12 2v3" /><path d="M16 2v3" />
                  <rect x="4" y="4" width="16" height="18" rx="3" className="fill-white/10" />
                  <path d="M8 10h8" /><path d="M8 14h5" /><path d="M8 18h3" />
                </svg>
                <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-[10px] font-extrabold text-white ring-2 ring-white shadow-xs">
                  ✓
                </span>
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-lg sm:text-xl font-extrabold tracking-tight text-slate-900">
                    <span className="text-indigo-600" aria-label="Q">Q</span>pro
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

            <div className="flex sm:hidden items-center gap-1.5">
              {/* Mantém-se apenas as ações vitais no mobile para evitar duplicação do DOM */}
            </div>
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-2 pt-1 sm:pt-0 border-t border-slate-100 sm:border-0">
            <div className="flex items-center gap-2">
              <SeletorTema />
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto [&>*]:flex-1 sm:[&>*]:flex-none">
              <BotaoNovaQuestao />
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        <PainelDesempenho questions={questoesFiltradas} />
        
        <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
          <FiltersSidebar dbOptions={opcoesDoBanco} />
          <CadernoQuestoes
            questions={questoesFiltradas}
            totalCount={totalExibido}
            filtros={{ banca, orgao, ano, disciplina, assunto }}
          />
        </div>
      </main>
    </div>
  );
}