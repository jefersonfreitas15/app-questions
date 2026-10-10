"use client";

import React, { useState, useEffect } from "react";
import { supabaseBrowser } from "@/lib/supabase/browser";
import { QuestionCard } from "./question-card";
import { useTema } from "./tema-context";

interface CadernoQuestoesProps {
  questions: any[];
  totalCount: number;
  perfil: { logado: boolean; plano: string; creditos: number };
  filtros: {
    banca?: string;
    orgao?: string;
    ano?: string;
    disciplina?: string;
    assunto?: string;
  };
}

export function CadernoQuestoes({
  questions = [],
  totalCount = 0,
  perfil,
  filtros,
}: CadernoQuestoesProps) {
  const tema = useTema();
  const supabase = supabaseBrowser();

  const [modo, setModo] = useState<"todas" | "erros" | "favoritas">("todas");
  const [indicesAbas, setIndicesAbas] = useState({
    todas: 0,
    erros: 0,
    favoritas: 0,
  });

  const indiceAtual = indicesAbas[modo];

  const atualizarIndice = (novoValor: number | ((prev: number) => number)) => {
    setIndicesAbas((prev) => {
      const valorAntigo = prev[modo];
      const final =
        typeof novoValor === "function" ? novoValor(valorAntigo) : novoValor;
      return { ...prev, [modo]: Math.max(0, final) };
    });
  };

  const [cacheRemoto, setCacheRemoto] = useState<Record<number, any>>({});
  const [carregandoRemoto, setCarregandoRemoto] = useState(false);
  const [irParaInput, setIrParaInput] = useState("");

  const [questoesFavoritas, setQuestoesFavoritas] = useState<any[]>([]);
  const [questoesErros, setQuestoesErros] = useState<any[]>([]);
  const [carregandoAbas, setCarregandoAbas] = useState(false);

  // Chave única para resetar cache quando os filtros mudarem
  const chaveFiltros = `${filtros?.banca || ""}-${filtros?.orgao || ""}-${
    filtros?.ano || ""
  }-${filtros?.disciplina || ""}-${filtros?.assunto || ""}`;

  useEffect(() => {
    setIndicesAbas({ todas: 0, erros: 0, favoritas: 0 });
    setCacheRemoto({});
  }, [chaveFiltros]);

  // Carrega lista de Erros ou Favoritas
  const carregarListasEspeciais = async () => {
    setCarregandoAbas(true);
    try {
      if (perfil.logado) {
        if (modo === "favoritas") {
          const { data } = await (supabase as any)
            .from("favoritas")
            .select("questao_id, questoes(*, alternativas(*))");
          const formatadas = (data || [])
            .map((f: any) => f.questoes)
            .filter(Boolean);
          setQuestoesFavoritas(formatadas);
        } else if (modo === "erros") {
          const { data } = await (supabase as any)
            .from("respostas_usuarios")
            .select("questao_id, acertou, questoes(*, alternativas(*))")
            .eq("acertou", false);

          const mapa = new Map();
          (data || []).forEach((r: any) => {
            if (r.questoes) mapa.set(r.questao_id, r.questoes);
          });
          setQuestoesErros(Array.from(mapa.values()));
        }
      } else {
        // Fallback local do visitante
        try {
          const favIds: string[] = JSON.parse(
            localStorage.getItem("visitante_favs") || "[]"
          );
          if (modo === "favoritas" && favIds.length > 0) {
            const { data } = await (supabase as any)
              .from("questoes")
              .select("*, alternativas(*)")
              .in("id", favIds);
            setQuestoesFavoritas(data || []);
          }
        } catch {}
      }
    } finally {
      setCarregandoAbas(false);
    }
  };

  useEffect(() => {
    if (modo !== "todas") {
      carregarListasEspeciais();
    }
  }, [modo]);

  // Busca páginas remotas quando o usuário navega além das 100 primeiras
  useEffect(() => {
    if (modo !== "todas") return;

    if (indiceAtual < questions.length || cacheRemoto[indiceAtual]) {
      return;
    }

    let cancelado = false;
    const buscarBloco = async () => {
      setCarregandoRemoto(true);
      try {
        const blocoInicio = Math.floor(indiceAtual / 20) * 20;
        const blocoFim = blocoInicio + 19;

        let q = (supabase as any)
          .from("questoes")
          .select("*, alternativas(*)");

        if (filtros?.banca) q = q.eq("banca", filtros.banca);
        if (filtros?.orgao) q = q.eq("orgao", filtros.orgao);
        if (filtros?.ano) q = q.eq("ano", Number(filtros.ano));
        if (filtros?.disciplina) q = q.eq("disciplina", filtros.disciplina);
        if (filtros?.assunto) q = q.eq("assunto", filtros.assunto);

        q = q.order("id", { ascending: false }).range(blocoInicio, blocoFim);

        const { data } = await q;

        if (!cancelado && data) {
          setCacheRemoto((prev) => {
            const novo = { ...prev };
            if (data.length === 0) {
              novo[indiceAtual] = { _vazio: true };
            } else {
              data.forEach((item: any, idx: number) => {
                novo[blocoInicio + idx] = item;
              });
            }
            return novo;
          });
        }
      } catch (err) {
        console.error("Erro ao buscar página:", err);
      } finally {
        if (!cancelado) setCarregandoRemoto(false);
      }
    };

    buscarBloco();
    return () => {
      cancelado = true;
    };
  }, [indiceAtual, questions.length, cacheRemoto, chaveFiltros, modo]);

  const listaAtual =
    modo === "favoritas"
      ? questoesFavoritas
      : modo === "erros"
      ? questoesErros
      : questions;

  const total =
    modo === "todas"
      ? totalCount && totalCount > questions.length
        ? totalCount
        : questions.length
      : listaAtual.length;

  const indiceSeguro = total > 0 ? Math.min(indiceAtual, total - 1) : 0;

  let questaoAtiva =
    modo === "todas"
      ? indiceSeguro < questions.length
        ? questions[indiceSeguro]
        : cacheRemoto[indiceSeguro]
      : listaAtual[indiceSeguro];

  if (questaoAtiva && questaoAtiva._vazio) {
    questaoAtiva = null;
  }

  // Paginação original
  const gerarPaginacao = () => {
    if (total <= 6) {
      return Array.from({ length: total }, (_, i) => i);
    }
    if (indiceSeguro < 4) {
      return [0, 1, 2, 3, 4, "...", total - 1];
    }
    if (indiceSeguro >= total - 4) {
      return [0, "...", total - 5, total - 4, total - 3, total - 2, total - 1];
    }
    return [0, "...", indiceSeguro - 1, indiceSeguro, indiceSeguro + 1, "...", total - 1];
  };

  const itensPaginacao = gerarPaginacao();

  const handleIrParaQuestao = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseInt(irParaInput, 10);
    if (!isNaN(num) && num >= 1 && num <= total) {
      atualizarIndice(num - 1);
      setIrParaInput("");
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Abas */}
      <div
        className="border border-slate-200/60 rounded-2xl p-2.5 shadow-xs flex flex-wrap items-center justify-between gap-2"
        style={{
          backgroundColor: tema.cartao || "#FFFFFF",
          color: tema.fonte || "inherit",
        }}
      >
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setModo("todas")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              modo === "todas"
                ? "bg-indigo-600 text-white shadow-xs shadow-indigo-200"
                : "border border-transparent hover:border-current opacity-70 hover:opacity-100"
            }`}
          >
            <span>📚</span>
            <span>Todas as Questões</span>
          </button>

          <button
            type="button"
            onClick={() => setModo("erros")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              modo === "erros"
                ? "bg-rose-600 text-white shadow-xs shadow-rose-200"
                : "bg-rose-500/10 text-rose-500 border border-rose-500/30 hover:bg-rose-500/20"
            }`}
          >
            <span>⚠️</span>
            <span>Caderno de Erros</span>
            <span
              className={`px-1.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                modo === "erros"
                  ? "bg-white/20 text-white"
                  : "bg-rose-500/20 text-rose-500"
              }`}
            >
              {questoesErros.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setModo("favoritas")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              modo === "favoritas"
                ? "bg-amber-500 text-white shadow-xs shadow-amber-200"
                : "bg-amber-500/10 text-amber-500 border border-amber-500/30 hover:bg-amber-500/20"
            }`}
          >
            <span>⭐</span>
            <span>Favoritas</span>
            <span
              className={`px-1.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                modo === "favoritas"
                  ? "bg-white/20 text-white"
                  : "bg-amber-500/20 text-amber-500"
              }`}
            >
              {questoesFavoritas.length}
            </span>
          </button>
        </div>

        <span className="text-[11px] font-medium px-2 hidden sm:inline opacity-60">
          ✂️ Dica: use a tesourinha nas alternativas para descartar opções
        </span>
      </div>

      {total === 0 || carregandoAbas ? (
        <div
          className="border border-slate-200/60 rounded-2xl p-10 text-center shadow-xs"
          style={{
            backgroundColor: tema.cartao || "#FFFFFF",
            color: tema.fonte || "inherit",
          }}
        >
          <p className="text-base font-semibold">
            {carregandoAbas
              ? "⏳ Carregando o caderno..."
              : modo === "erros"
              ? "🎉 Parabéns! Seu Caderno de Erros está limpo!"
              : modo === "favoritas"
              ? "⭐ Você ainda não favoritou nenhuma questão."
              : "Nenhuma questão encontrada para estes filtros."}
          </p>
        </div>
      ) : (
        <>
          {/* Barra de Paginação Numérica */}
          <div
            className="border border-slate-200/60 rounded-2xl p-3.5 sm:p-4 shadow-xs flex flex-wrap items-center justify-between gap-3"
            style={{
              backgroundColor: tema.cartao || "#FFFFFF",
              color: tema.fonte || "inherit",
            }}
          >
            <div className="flex items-center gap-1.5 flex-wrap">
              {itensPaginacao.map((item, idx) => {
                if (item === "...") {
                  return (
                    <span
                      key={`ellipsis-${idx}`}
                      className="w-7 h-9 flex items-center justify-center text-xs font-bold select-none opacity-50"
                    >
                      ...
                    </span>
                  );
                }

                const pageIndex = item as number;
                const ativo = pageIndex === indiceSeguro;

                return (
                  <button
                    key={`page-${pageIndex}`}
                    type="button"
                    onClick={() => atualizarIndice(pageIndex)}
                    className={`min-w-9 h-9 px-2.5 rounded-xl text-xs font-bold transition-all duration-200 active:scale-90 border ${
                      ativo
                        ? "bg-gradient-to-tr from-indigo-600 to-violet-500 text-white border-indigo-600 shadow-sm shadow-indigo-200 scale-105"
                        : "border-slate-200/80 hover:border-indigo-500 hover:text-indigo-600"
                    }`}
                    style={
                      !ativo
                        ? {
                            backgroundColor: tema.cartao || "#FFFFFF",
                            color: tema.fonte || "inherit",
                          }
                        : undefined
                    }
                  >
                    {(pageIndex + 1).toLocaleString("pt-BR")}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {total > 10 && (
                <form
                  onSubmit={handleIrParaQuestao}
                  className="flex items-center gap-1"
                >
                  <input
                    type="number"
                    min={1}
                    max={total}
                    placeholder="Ir nº..."
                    value={irParaInput}
                    onChange={(e) => setIrParaInput(e.target.value)}
                    style={{
                      backgroundColor: tema.fundo || "#F8FAFC",
                      color: tema.fonte || "inherit",
                    }}
                    className="w-20 px-2.5 py-1.5 rounded-xl border border-slate-200/70 text-xs font-medium outline-none focus:border-indigo-500"
                  />
                </form>
              )}

              <button
                type="button"
                onClick={() => atualizarIndice((prev) => Math.max(0, prev - 1))}
                disabled={indiceSeguro === 0}
                style={{
                  backgroundColor: tema.cartao || "#FFFFFF",
                  color: tema.fonte || "inherit",
                }}
                className="px-3.5 py-2 rounded-xl border border-slate-200/80 text-xs font-semibold hover:opacity-80 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                ← Anterior
              </button>
              <button
                type="button"
                onClick={() =>
                  atualizarIndice((prev) => Math.min(total - 1, prev + 1))
                }
                disabled={indiceSeguro >= total - 1}
                className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-500 shadow-xs shadow-indigo-200 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                Próxima →
              </button>
            </div>
          </div>

          {carregandoRemoto && !questaoAtiva ? (
            <div
              className="border border-slate-200/60 rounded-2xl p-12 text-center text-sm font-medium shadow-xs"
              style={{
                backgroundColor: tema.cartao || "#FFFFFF",
                color: tema.fonte || "inherit",
                opacity: 0.8,
              }}
            >
              ⏳ Carregando a questão {(indiceSeguro + 1).toLocaleString("pt-BR")}...
            </div>
          ) : (
            <QuestionCard
              key={`${modo}-${questaoAtiva?.id || indiceSeguro}`}
              question={questaoAtiva}
              numeroAtual={indiceSeguro + 1}
              totalQuestoes={total}
              logado={perfil.logado}
              plano={perfil.plano}
              onRespostaSalva={carregarListasEspeciais}
            />
          )}
        </>
      )}
    </div>
  );
}