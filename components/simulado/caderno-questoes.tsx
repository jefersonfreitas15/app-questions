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
  questions,
  totalCount,
  perfil,
  filtros,
}: CadernoQuestoesProps) {
  const tema = useTema();
  const supabase = supabaseBrowser();

  const [modo, setModo] = useState<"todas" | "erros" | "favoritas">("todas");
  const [indice, setIndice] = useState(0);
  const [irParaInput, setIrParaInput] = useState("");

  const [questoesFavoritas, setQuestoesFavoritas] = useState<any[]>([]);
  const [questoesErros, setQuestoesErros] = useState<any[]>([]);
  const [carregandoAbas, setCarregandoAbas] = useState(false);

  const carregarListasEspeciais = async () => {
    if (!perfil.logado) return;
    setCarregandoAbas(true);

    try {
      if (modo === "favoritas") {
        const { data } = await (supabase as any)
          .from("favoritas")
          .select("questao_id, questoes(*, alternativas(*))");
        const formatadas = (data || []).map((f: any) => f.questoes).filter(Boolean);
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
    } finally {
      setCarregandoAbas(false);
    }
  };

  useEffect(() => {
    setIndice(0);
    if (modo !== "todas") {
      carregarListasEspeciais();
    }
  }, [modo]);

  const listaAtual =
    modo === "favoritas"
      ? questoesFavoritas
      : modo === "erros"
      ? questoesErros
      : questions;

  const total = modo === "todas" ? totalCount : listaAtual.length;
  const questaoAtiva = listaAtual[indice];

  // ALGORITMO ORIGINAL DE PAGINAÇÃO EM PÍLULAS
  const gerarPaginacao = () => {
    if (total <= 6) {
      return Array.from({ length: total }, (_, i) => i);
    }
    if (indice < 4) {
      return [0, 1, 2, 3, 4, "...", total - 1];
    }
    if (indice >= total - 4) {
      return [0, "...", total - 5, total - 4, total - 3, total - 2, total - 1];
    }
    return [0, "...", indice - 1, indice, indice + 1, "...", total - 1];
  };

  const itensPaginacao = gerarPaginacao();

  const handleIrParaQuestao = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseInt(irParaInput, 10);
    if (!isNaN(num) && num >= 1 && num <= total) {
      setIndice(num - 1);
      setIrParaInput("");
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* ABAS SUPERIORES COM DESIGN ORIGINAL */}
      <div
        className="border border-slate-200/50 rounded-2xl p-2.5 shadow-xs flex flex-wrap items-center justify-between gap-2"
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
          className="border border-slate-200/50 rounded-2xl p-10 text-center shadow-xs"
          style={{
            backgroundColor: tema.cartao || "#FFFFFF",
            color: tema.fonte || "inherit",
          }}
        >
          <p className="text-base font-semibold">
            {carregandoAbas
              ? "⏳ Carregando o caderno..."
              : "Nenhuma questão encontrada para estes filtros."}
          </p>
        </div>
      ) : (
        <>
          {/* BARRA DE PAGINAÇÃO NUMÉRICA ORIGINAL */}
          <div
            className="border border-slate-200/50 rounded-2xl p-3.5 sm:p-4 shadow-xs flex flex-wrap items-center justify-between gap-3"
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
                const ativo = pageIndex === indice;

                return (
                  <button
                    key={`page-${pageIndex}`}
                    type="button"
                    onClick={() => setIndice(pageIndex)}
                    className={`min-w-9 h-9 px-2.5 rounded-xl text-xs font-bold transition-all duration-200 active:scale-90 border ${
                      ativo
                        ? "bg-gradient-to-tr from-indigo-600 to-violet-500 text-white border-indigo-600 shadow-sm shadow-indigo-200 scale-105"
                        : "border-slate-200 bg-white text-slate-700 hover:border-indigo-500 hover:text-indigo-600"
                    }`}
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
                    className="w-20 px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-medium outline-none focus:border-indigo-500"
                  />
                </form>
              )}

              <button
                type="button"
                onClick={() => setIndice((prev) => Math.max(0, prev - 1))}
                disabled={indice === 0}
                className="px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold hover:border-slate-300 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                ← Anterior
              </button>
              <button
                type="button"
                onClick={() =>
                  setIndice((prev) => Math.min(listaAtual.length - 1, prev + 1))
                }
                disabled={indice >= listaAtual.length - 1}
                className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-500 shadow-xs shadow-indigo-200 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                Próxima →
              </button>
            </div>
          </div>

          <QuestionCard
            key={questaoAtiva?.id || indice}
            question={questaoAtiva}
            numeroAtual={indice + 1}
            totalQuestoes={total}
            logado={perfil.logado}
            plano={perfil.plano}
            onRespostaSalva={carregarListasEspeciais}
          />
        </>
      )}
    </div>
  );
}