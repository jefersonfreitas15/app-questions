"use client";

import React, { useState, useEffect } from "react";
import { supabaseBrowser } from "@/lib/supabase/browser";
import { QuestionCard } from "./question-card";
import { useTema } from "./tema-context";

interface CadernoQuestoesProps {
  questions: any[];
  totalCount: number;
  perfil: { logado: boolean; plano: string; creditos: number };
  filtros: { banca?: string; orgao?: string; ano?: string; disciplina?: string; assunto?: string };
}

export function CadernoQuestoes({ questions, totalCount, perfil, filtros }: CadernoQuestoesProps) {
  const tema = useTema();
  const supabase = supabaseBrowser();

  const [modo, setModo] = useState<"todas" | "erros" | "favoritas">("todas");
  const [indice, setIndice] = useState(0);

  const [questoesFavoritas, setQuestoesFavoritas] = useState<any[]>([]);
  const [questoesErros, setQuestoesErros] = useState<any[]>([]);
  const [carregandoAbas, setCarregandoAbas] = useState(false);

  // Carrega lista de Erros ou Favoritas sob demanda
  const carregarListasEspeciais = async () => {
    if (!perfil.logado) return;
    setCarregandoAbas(true);

    try {
      if (modo === "favoritas") {
        const { data } = await supabase
          .from("favoritas")
          .select("questao_id, questoes(*, alternativas(*))");
        const formatadas = (data || []).map((f: any) => f.questoes).filter(Boolean);
        setQuestoesFavoritas(formatadas);
      } else if (modo === "erros") {
        const { data } = await supabase
          .from("respostas_usuarios")
          .select("questao_id, acertou, questoes(*, alternativas(*))")
          .eq("acertou", false);
        
        // Remove duplicatas mantendo apenas questões que o usuário errou
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
    modo === "favoritas" ? questoesFavoritas : modo === "erros" ? questoesErros : questions;
  const total = modo === "todas" ? totalCount : listaAtual.length;
  const questaoAtiva = listaAtual[indice];

  return (
    <div className="flex flex-col gap-4">
      <div
        className="border border-slate-200/50 rounded-2xl p-2.5 shadow-xs flex items-center justify-between gap-2"
        style={{ backgroundColor: tema.cartao || "#FFFFFF", color: tema.fonte || "inherit" }}
      >
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setModo("todas")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              modo === "todas" ? "bg-indigo-600 text-white shadow-xs" : "hover:bg-slate-100"
            }`}
          >
            📚 Todas as Questões
          </button>

          <button
            type="button"
            onClick={() => setModo("erros")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              modo === "erros" ? "bg-rose-600 text-white shadow-xs" : "text-rose-600 hover:bg-rose-50"
            }`}
          >
            ⚠️ Caderno de Erros
          </button>

          <button
            type="button"
            onClick={() => setModo("favoritas")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              modo === "favoritas" ? "bg-amber-500 text-white shadow-xs" : "text-amber-600 hover:bg-amber-50"
            }`}
          >
            ⭐ Favoritas
          </button>
        </div>
      </div>

      {total === 0 || carregandoAbas ? (
        <div className="border border-slate-200/50 rounded-2xl p-10 text-center text-sm opacity-70">
          {carregandoAbas ? "Carregando caderno..." : "Nenhuma questão encontrada nesta seção."}
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between border border-slate-200/50 rounded-2xl p-3 bg-white">
            <span className="text-xs font-bold">
              Questão {indice + 1} de {total}
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={indice === 0}
                onClick={() => setIndice((prev) => Math.max(0, prev - 1))}
                className="px-3 py-1.5 rounded-lg border text-xs font-semibold disabled:opacity-30"
              >
                ← Anterior
              </button>
              <button
                type="button"
                disabled={indice >= listaAtual.length - 1}
                onClick={() => setIndice((prev) => Math.min(listaAtual.length - 1, prev + 1))}
                className="px-4 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-semibold disabled:opacity-30"
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