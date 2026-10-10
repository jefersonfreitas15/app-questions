import { FiltersSidebar } from "@/components/simulado/filters-sidebar";
import {
  CadernoQuestoes,
  PainelDesempenho,
  BotaoNovaQuestao,
  SeletorTema,
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
  const { data: { user } } = await supabase.auth.getUser();

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
      ? supabase.from("perfis").select("plano, creditos_ia").eq("id", user.id).maybeSingle()
      : Promise.resolve({ data: null, error: null }),
  ]);

  const questoes = questoesRes.data || [];
  const total = questoesRes.count ?? questoes.length;

  const opcoesData = (opcoesRes.data ?? {}) as Record<string, any>;
  const opcoesDoBanco = {
    banca: Array.isArray(opcoesData.banca) ? opcoesData.banca : [],
    orgao: Array.isArray(opcoesData.orgao) ? opcoesData.orgao : [],
    ano: Array.isArray(opcoesData.ano) ? opcoesData.ano.map(String) : [],
    disciplina: Array.isArray(opcoesData.disciplina) ? opcoesData.disciplina : [],
    assunto: Array.isArray(opcoesData.assunto) ? opcoesData.assunto : [],
  };

  const perfil = {
    logado: Boolean(user),
    plano: perfilRes.data?.plano ?? "gratis",
    creditos: perfilRes.data?.creditos_ia ?? 0,
  };

  return (
    <div id="simulado-root" className="min-h-svh bg-[#F8FAFC] text-slate-900">
      <header className="sticky top-0 z-30 border-b bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3.5">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold text-slate-900">
              <span className="text-indigo-600">Q</span>pro Concursos
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <SeletorTema />
            <BotaoNovaQuestao />
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
  );
}