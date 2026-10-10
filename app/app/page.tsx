import { FiltersSidebar } from "@/components/simulado/filters-sidebar";
import {
  CadernoQuestoes,
  PainelDesempenho,
  BotaoNovaQuestao,
  SeletorTema,
  TemaProvider,
} from "@/components/simulado";
import { supabaseServer } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

const getParam = (param: string | string[] | undefined): string => {
  if (Array.isArray(param)) return param[0] || "";
  return param || "";
};

export default async function Page({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;

  const banca = getParam(params.banca);
  const orgao = getParam(params.orgao);
  const ano = getParam(params.ano);
  const disciplina = getParam(params.disciplina);
  const assunto = getParam(params.assunto);

  const supabase = await supabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let query = supabase
    .from("questoes")
    .select("*, alternativas(*)", { count: "exact" })
    .order("id", { ascending: false })
    .range(0, 99);

  if (banca) query = query.eq("banca", banca);
  if (orgao) query = query.eq("orgao", orgao);
  if (ano && !isNaN(Number(ano))) query = query.eq("ano", Number(ano));
  if (disciplina) query = query.eq("disciplina", disciplina);
  if (assunto) query = query.eq("assunto", assunto);

  const [questoesRes, opcoesRes, statsRes, perfilRes] = await Promise.all([
    query,
    supabase.rpc("obter_opcoes_filtros", {
      p_banca: banca || null,
      p_orgao: orgao || null,
      p_ano: ano ? Number(ano) : null,
      p_disciplina: disciplina || null,
      p_assunto: assunto || null,
    }),
    user
      ? supabase.rpc("estatisticas_usuario")
      : Promise.resolve({ data: [], error: null }),
    user
      ? supabase
          .from("perfis")
          .select("plano, creditos_ia")
          .eq("id", user.id)
          .maybeSingle()
      : Promise.resolve({ data: null, error: null }),
  ]);

  const questoes = questoesRes.data || [];
  const total = questoesRes.count ?? questoes.length;

  const opcoesData = (opcoesRes.data ?? {}) as Record<string, any>;
  const opcoesDoBanco = {
    banca: Array.isArray(opcoesData.banca) ? opcoesData.banca : [],
    orgao: Array.isArray(opcoesData.orgao) ? opcoesData.orgao : [],
    ano: Array.isArray(opcoesData.ano) ? opcoesData.ano.map(String) : [],
    disciplina: Array.isArray(opcoesData.disciplina)
      ? opcoesData.disciplina
      : [],
    assunto: Array.isArray(opcoesData.assunto) ? opcoesData.assunto : [],
  };

  const perfil = {
    logado: Boolean(user),
    plano: perfilRes.data?.plano ?? "gratis",
    creditos: perfilRes.data?.creditos_ia ?? 0,
  };

  return (
    <TemaProvider>
      <div
        id="simulado-root"
        className="min-h-svh transition-colors duration-200"
      >
        <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/95 backdrop-blur-xs">
          <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-3.5">
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

              <div className="flex sm:hidden items-center gap-1.5">
                <SeletorTema />
              </div>
            </div>

            <div className="flex items-center justify-between sm:justify-end gap-2 pt-1 sm:pt-0 border-t border-slate-100 sm:border-0">
              <div className="hidden sm:flex items-center gap-2">
                <SeletorTema />
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto [&>*]:flex-1 sm:[&>*]:flex-none">
                <BotaoNovaQuestao perfil={perfil} />
              </div>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
          <PainelDesempenho
            estatisticas={statsRes.data || []}
            logado={perfil.logado}
          />
          <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
            <FiltersSidebar dbOptions={opcoesDoBanco} />
            <CadernoQuestoes
              questions={questoes}
              totalCount={total}
              perfil={perfil}
              filtros={{ banca, orgao, ano, disciplina, assunto }}
            />
          </div>
        </main>
      </div>
    </TemaProvider>
  );
}