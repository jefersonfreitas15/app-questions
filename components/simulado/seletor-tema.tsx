"use client";

import React, { useState, useEffect } from "react";
import { Palette } from "lucide-react";

const TEMAS_PRONTOS = [
  {
    nome: "Gelo Padrão",
    fundo: "#F8FAFC",
    cartao: "#FFFFFF",
    fonte: "#1E293B",
  },
  {
    nome: "Papel Creme (Kindle)",
    fundo: "#F5F2EB",
    cartao: "#FCFBF7",
    fonte: "#2C2623",
  },
  {
    nome: "Azul Porcelana",
    fundo: "#EEF4F8",
    cartao: "#FFFFFF",
    fonte: "#1E3A5F",
  },
  {
    nome: "Verde Suave",
    fundo: "#EFF6F2",
    cartao: "#FFFFFF",
    fonte: "#1B3B2B",
  },
  {
    nome: "Modo Noturno",
    fundo: "#0F172A",
    cartao: "#1E293B",
    fonte: "#F1F5F9",
  },
];

export function SeletorTema() {
  const [aberto, setAberto] = useState(false);
  const [corFundo, setCorFundo] = useState("#F8FAFC");
  const [corCartao, setCorCartao] = useState("#FFFFFF");
  const [corFonte, setCorFonte] = useState("#1E293B");

  useEffect(() => {
    try {
      const salvo = localStorage.getItem("simulado_tema_cores");
      if (salvo) {
        const parsed = JSON.parse(salvo);
        if (parsed.fundo && parsed.cartao && parsed.fonte) {
          setCorFundo(parsed.fundo);
          setCorCartao(parsed.cartao);
          setCorFonte(parsed.fonte);
          document.body.style.backgroundColor = parsed.fundo;
          document.body.style.color = parsed.fonte;
        }
      }
    } catch {}
  }, []);

  const salvarCores = (
    novoFundo: string,
    novoCartao: string,
    novaFonte: string
  ) => {
    setCorFundo(novoFundo);
    setCorCartao(novoCartao);
    setCorFonte(novaFonte);

    try {
      localStorage.setItem(
        "simulado_tema_cores",
        JSON.stringify({ fundo: novoFundo, cartao: novoCartao, fonte: novaFonte })
      );
      document.body.style.backgroundColor = novoFundo;
      document.body.style.color = novaFonte;
      window.dispatchEvent(new Event("qpro-tema-alterado"));
    } catch {}
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setAberto(!aberto)}
        title="Personalizar cores de fundo e fonte"
        className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition-all text-xs font-bold shadow-2xs active:scale-95"
      >
        <Palette className="w-3.5 h-3.5 text-indigo-600" />
        <span className="hidden sm:inline">Aparência</span>
      </button>

      {aberto && (
        <div
          className="absolute right-0 mt-2 w-72 rounded-2xl border border-slate-200/80 shadow-2xl z-50 p-4 animate-in fade-in zoom-in-95 duration-150"
          style={{ backgroundColor: corCartao, color: corFonte }}
        >
          <div className="flex items-center justify-between border-b border-slate-200/40 pb-2.5 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider opacity-70">
              Conforto Visual
            </span>
            <button
              type="button"
              onClick={() => setAberto(false)}
              className="text-xs font-bold opacity-60 hover:opacity-100"
            >
              ✕
            </button>
          </div>

          <p className="text-xs font-semibold mb-2 opacity-80">
            Temas de Leitura (1 clique):
          </p>
          <div className="grid grid-cols-1 gap-1.5 mb-4">
            {TEMAS_PRONTOS.map((t) => {
              const selecionado =
                corFundo.toLowerCase() === t.fundo.toLowerCase();
              return (
                <button
                  key={t.nome}
                  type="button"
                  onClick={() => salvarCores(t.fundo, t.cartao, t.fonte)}
                  className={`flex items-center justify-between px-3 py-2 rounded-xl border text-xs font-medium transition-all ${
                    selecionado
                      ? "border-indigo-500 ring-2 ring-indigo-500/20 font-bold"
                      : "border-slate-200/60 hover:border-slate-300"
                  }`}
                  style={{ backgroundColor: t.fundo, color: t.fonte }}
                >
                  <span>{t.nome}</span>
                  <div className="flex items-center gap-1">
                    <span
                      className="w-3.5 h-3.5 rounded-full border border-black/10"
                      style={{ backgroundColor: t.fundo }}
                    />
                    <span
                      className="w-3.5 h-3.5 rounded-full border border-black/10"
                      style={{ backgroundColor: t.cartao }}
                    />
                    <span
                      className="w-3.5 h-3.5 rounded-full border border-black/10"
                      style={{ backgroundColor: t.fonte }}
                    />
                  </div>
                </button>
              );
            })}
          </div>

          <div className="border-t border-slate-200/40 pt-3">
            <p className="text-xs font-semibold mb-2 opacity-80">
              Cores Personalizadas:
            </p>
            <div className="flex flex-col gap-2">
              <label className="flex items-center justify-between text-xs cursor-pointer">
                <span>Fundo Geral</span>
                <input
                  type="color"
                  value={corFundo}
                  onChange={(e) => salvarCores(e.target.value, corCartao, corFonte)}
                  className="w-7 h-6 rounded cursor-pointer border-0"
                />
              </label>
              <label className="flex items-center justify-between text-xs cursor-pointer">
                <span>Fundo dos Cartões</span>
                <input
                  type="color"
                  value={corCartao}
                  onChange={(e) => salvarCores(corFundo, e.target.value, corFonte)}
                  className="w-7 h-6 rounded cursor-pointer border-0"
                />
              </label>
              <label className="flex items-center justify-between text-xs cursor-pointer">
                <span>Cor do Texto</span>
                <input
                  type="color"
                  value={corFonte}
                  onChange={(e) => salvarCores(corFundo, corCartao, e.target.value)}
                  className="w-7 h-6 rounded cursor-pointer border-0"
                />
              </label>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}