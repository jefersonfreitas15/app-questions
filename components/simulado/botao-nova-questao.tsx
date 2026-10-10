"use client";

import React, { useState } from "react";
import { Sparkles, Loader2 } from "lucide-react";

export function BotaoNovaQuestao() {
  const [modalAberto, setModalAberto] = useState(false);
  const [disciplina, setDisciplina] = useState("Direito Administrativo");
  const [assunto, setAssunto] = useState("");
  const [quantidade, setQuantidade] = useState(5);
  const [gerando, setGerando] = useState(false);
  const [erro, setErro] = useState("");

  const handleGerar = async (e: React.FormEvent) => {
    e.preventDefault();
    setGerando(true);
    setErro("");

    try {
      const res = await fetch("/api/gerar-ia", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ disciplina, assunto, quantidade }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Falha ao gerar questões.");

      setModalAberto(false);
      window.location.href = `/app?disciplina=${encodeURIComponent(disciplina)}`;
    } catch (err: any) {
      setErro(err.message || "Erro de conexão.");
    } finally {
      setGerando(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setModalAberto(true)}
        className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 shadow-sm transition-all active:scale-95"
      >
        <Sparkles className="w-3.5 h-3.5" />
        <span>Gerar com IA</span>
      </button>

      {modalAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 text-slate-900">
            <div className="flex justify-between items-center mb-4 pb-2 border-b">
              <h3 className="font-extrabold text-base flex items-center gap-2 text-indigo-600">
                <Sparkles className="w-4 h-4" /> Gerar Questões Inéditas
              </h3>
              <button
                type="button"
                onClick={() => setModalAberto(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {erro && (
              <div className="mb-3 p-2.5 text-xs rounded-xl bg-rose-50 border border-rose-200 text-rose-600">
                {erro}
              </div>
            )}

            <form onSubmit={handleGerar} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase mb-1 text-slate-700">Disciplina</label>
                <input
                  type="text"
                  required
                  value={disciplina}
                  onChange={(e) => setDisciplina(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl text-sm outline-none focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase mb-1 text-slate-700">Assunto (Opcional)</label>
                <input
                  type="text"
                  placeholder="Ex: Atos Administrativos, Licitação..."
                  value={assunto}
                  onChange={(e) => setAssunto(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl text-sm outline-none focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase mb-1 text-slate-700">Quantidade</label>
                <div className="grid grid-cols-5 gap-2">
                  {[1, 2, 3, 4, 5].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setQuantidade(num)}
                      className={`py-2 text-xs font-bold rounded-xl border ${
                        quantidade === num
                          ? "bg-indigo-600 text-white border-indigo-600"
                          : "bg-slate-50 text-slate-700 border-slate-200"
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setModalAberto(false)}
                  className="px-4 py-2 text-xs font-bold border rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={gerando}
                  className="px-4 py-2 text-xs font-bold bg-indigo-600 text-white rounded-xl hover:bg-indigo-500 flex items-center gap-1.5 disabled:opacity-50"
                >
                  {gerando && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  {gerando ? "Gerando..." : "Gerar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}