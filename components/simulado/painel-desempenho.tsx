"use client";

import React, { useState } from "react";
import { useTema } from "@/components/simulado/tema-context";

export interface EstatisticaDisciplina {
  disciplina: string;
  total: number;
  acertos: number;
}

interface PainelDesempenhoProps {
  estatisticas: EstatisticaDisciplina[];
  logado: boolean;
}

export function PainelDesempenho({ estatisticas, logado }: PainelDesempenhoProps) {
  const tema = useTema();
  const [mostrarPorDisciplina, setMostrarPorDisciplina] = useState(false);

  const totalRespondidas = estatisticas.reduce((acc, curr) => acc + Number(curr.total), 0);
  const totalAcertos = estatisticas.reduce((acc, curr) => acc + Number(curr.acertos), 0);
  const totalErros = totalRespondidas - totalAcertos;
  const taxaAcerto = totalRespondidas > 0 ? Math.round((totalAcertos / totalRespondidas) * 100) : 0;

  return (
    <div className="mb-6">
      <div className="flex flex-wrap justify-between items-center gap-2 mb-2.5">
        <span
          className="text-xs font-semibold uppercase tracking-wider"
          style={{ color: tema.fonte || "#64748b", opacity: 0.8 }}
        >
          📊 Seu progresso acumulado {logado ? "(Nuvem)" : "(Visitante)"}
        </span>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setMostrarPorDisciplina(!mostrarPorDisciplina)}
            className={`text-xs font-semibold px-3 py-1.5 rounded-xl border transition-all flex items-center gap-1.5 ${
              mostrarPorDisciplina
                ? "bg-indigo-600 text-white border-indigo-600 shadow-xs shadow-indigo-200"
                : "border-current hover:opacity-70"
            }`}
            style={!mostrarPorDisciplina ? { color: tema.fonte || "inherit", opacity: 0.9 } : undefined}
          >
            <span>📈</span>
            <span>{mostrarPorDisciplina ? "Ocultar por Disciplina" : "Desempenho por Disciplina"}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-4">
        <div
          className="border border-slate-200/50 rounded-2xl p-4 shadow-xs"
          style={{ backgroundColor: tema.cartao || "#FFFFFF", color: tema.fonte || "inherit" }}
        >
          <span className="text-[11px] font-bold text-indigo-500 uppercase tracking-wide">Resolvidas</span>
          <p className="text-2xl font-extrabold mt-1">{totalRespondidas}</p>
        </div>

        <div
          className="border border-emerald-200/50 rounded-2xl p-4 shadow-xs"
          style={{ backgroundColor: tema.cartao || "#FFFFFF", color: tema.fonte || "inherit" }}
        >
          <span className="text-[11px] font-bold text-emerald-500 uppercase tracking-wide">Acertos</span>
          <p className="text-2xl font-extrabold text-emerald-500 mt-1">{totalAcertos}</p>
        </div>

        <div
          className="border border-rose-200/50 rounded-2xl p-4 shadow-xs"
          style={{ backgroundColor: tema.cartao || "#FFFFFF", color: tema.fonte || "inherit" }}
        >
          <span className="text-[11px] font-bold text-rose-500 uppercase tracking-wide">Erros</span>
          <p className="text-2xl font-extrabold text-rose-500 mt-1">{totalErros}</p>
        </div>

        <div
          className="border border-slate-200/50 rounded-2xl p-4 shadow-xs flex flex-col justify-between"
          style={{ backgroundColor: tema.cartao || "#FFFFFF", color: tema.fonte || "inherit" }}
        >
          <div>
            <span className="text-[11px] font-bold text-violet-500 uppercase tracking-wide">Aproveitamento</span>
            <p className="text-2xl font-extrabold mt-1">{taxaAcerto}%</p>
          </div>
          <div className="w-full h-1.5 rounded-full overflow-hidden mt-2" style={{ backgroundColor: tema.fundo || "#F1F5F9" }}>
            <div
              className="bg-gradient-to-r from-indigo-500 to-emerald-400 h-full rounded-full transition-all duration-700 ease-out"
              style={{ width: `${taxaAcerto}%` }}
            />
          </div>
        </div>
      </div>

      {mostrarPorDisciplina && (
        <div
          className="mt-4 border border-slate-200/50 rounded-2xl p-5 shadow-xs"
          style={{ backgroundColor: tema.cartao || "#FFFFFF", color: tema.fonte || "inherit" }}
        >
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
            <h3 className="text-sm font-bold flex items-center gap-2">📚 Raio-X por Disciplina</h3>
            <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full">
              {estatisticas.length} {estatisticas.length === 1 ? "matéria" : "matérias"}
            </span>
          </div>

          {estatisticas.length === 0 ? (
            <p className="text-xs opacity-60 text-center py-4">Nenhuma questão resolvida até ao momento.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {estatisticas.map((item) => {
                const total = Number(item.total);
                const acertos = Number(item.acertos);
                const perc = total > 0 ? Math.round((acertos / total) * 100) : 0;
                return (
                  <div
                    key={item.disciplina}
                    className="p-3.5 rounded-xl border border-slate-200/40 flex flex-col justify-between gap-2"
                    style={{ backgroundColor: tema.fundo || "#F8FAFC" }}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold truncate">{item.disciplina}</span>
                      <span className="text-xs font-extrabold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-200">
                        {perc}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-200/50 h-2 rounded-full overflow-hidden">
                      <div className="bg-indigo-600 h-full rounded-full" style={{ width: `${perc}%` }} />
                    </div>
                    <div className="flex items-center justify-between text-[11px] opacity-80 pt-0.5">
                      <span>Total: {total}</span>
                      <div className="flex gap-2">
                        <span className="text-emerald-500 font-semibold">✓ {acertos}</span>
                        <span className="text-rose-500 font-semibold">✕ {total - acertos}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}