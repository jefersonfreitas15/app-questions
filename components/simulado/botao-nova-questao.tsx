"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Sparkles, Loader2 } from "lucide-react";
import { useTema } from "./tema-context";

const LINK_CHECKOUT_PAGAMENTO = "https://pay.kiwify.com.br/VE1GbyL";
const LIMITE_QUESTOES_GRATIS = 5;

export function BotaoNovaQuestao({
  perfil,
}: {
  perfil?: { logado: boolean; plano: string; creditos: number };
}) {
  const tema = useTema();
  const [mounted, setMounted] = useState(false);
  const [resolvidasGratis, setResolvidasGratis] = useState(0);
  const [modalVitalicioAberto, setModalVitalicioAberto] = useState(false);
  const [modalIaAberto, setModalIaAberto] = useState(false);

  const [disciplina, setDisciplina] = useState("Direito Administrativo");
  const [assunto, setAssunto] = useState("");
  const [quantidade, setQuantidade] = useState(5);
  const [gerando, setGerando] = useState(false);
  const [erroIa, setErroIa] = useState("");

  const ehVitalicio = perfil?.plano === "vitalicio";

  const atualizarContagem = () => {
    try {
      const salvas = Number(
        localStorage.getItem("qpro_degustacao_resolvidas") || "0"
      );
      setResolvidasGratis(salvas);
    } catch {}
  };

  useEffect(() => {
    setMounted(true);
    atualizarContagem();

    const abrirOferta = () => setModalVitalicioAberto(true);
    window.addEventListener("abrir-modal-vitalicio", abrirOferta);
    window.addEventListener("atualizar-degustacao", atualizarContagem);

    return () => {
      window.removeEventListener("abrir-modal-vitalicio", abrirOferta);
      window.removeEventListener("atualizar-degustacao", atualizarContagem);
    };
  }, []);

  const restantesGratis = Math.max(0, LIMITE_QUESTOES_GRATIS - resolvidasGratis);

  const handleGerarIa = async (e: React.FormEvent) => {
    e.preventDefault();
    setGerando(true);
    setErroIa("");

    try {
      const res = await fetch("/api/gerar-ia", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ disciplina, assunto, quantidade }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Falha ao gerar questões.");

      setModalIaAberto(false);
      window.location.href = `/app?disciplina=${encodeURIComponent(disciplina)}`;
    } catch (err: any) {
      setErroIa(err.message || "Erro ao conectar à IA.");
    } finally {
      setGerando(false);
    }
  };

  return (
    <>
      <div className="flex items-center gap-2 flex-wrap">
        {ehVitalicio ? (
          <span
            title="Você possui Acesso Vitalício Ilimitado"
            className="flex items-center gap-1.5 bg-amber-500/20 border border-amber-400 text-amber-600 px-3.5 py-2 rounded-xl text-xs font-extrabold shadow-2xs"
          >
            <span>👑</span>
            <span className="hidden md:inline">Acesso Vitalício</span>
          </span>
        ) : (
          <button
            type="button"
            onClick={() => setModalVitalicioAberto(true)}
            className="flex items-center gap-1.5 bg-emerald-600 text-white px-3.5 py-2 rounded-xl text-xs font-extrabold hover:bg-emerald-500 transition-all active:scale-95 shadow-xs shadow-emerald-200"
          >
            <span>🚀</span>
            <span>
              {restantesGratis > 0
                ? `Grátis (${restantesGratis}/${LIMITE_QUESTOES_GRATIS}) • Liberar Vitalício`
                : "Liberar Vitalício R$ 47"}
            </span>
          </button>
        )}

        <button
          type="button"
          onClick={() => {
            if (!ehVitalicio && restantesGratis === 0) {
              setModalVitalicioAberto(true);
              return;
            }
            setModalIaAberto(true);
          }}
          className="flex items-center gap-1.5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white px-3.5 py-2 rounded-xl text-xs font-bold hover:from-indigo-500 hover:to-violet-500 transition-all active:scale-95 shadow-xs shadow-indigo-200"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Gerar com IA</span>
        </button>
      </div>

      {/* PORTAL DO MODAL VITALÍCIO (SEMPRE NO TOPO ABSOLUTO DO BODY) */}
      {mounted &&
        modalVitalicioAberto &&
        createPortal(
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/75 backdrop-blur-sm p-4 overflow-y-auto">
            <div
              style={{
                backgroundColor: tema.cartao || "#FFFFFF",
                color: tema.fonte || "#0F172A",
              }}
              className="relative border border-slate-200/50 rounded-2xl max-w-lg w-full p-6 sm:p-7 shadow-2xl my-8 animate-in fade-in zoom-in-95 duration-200"
            >
              <div className="flex items-center justify-between border-b border-slate-200/40 pb-3 mb-4">
                <span className="text-xs font-extrabold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-200/60">
                  👑 Oferta Exclusiva de Acesso
                </span>
                <button
                  type="button"
                  onClick={() => setModalVitalicioAberto(false)}
                  className="text-sm font-bold opacity-60 hover:opacity-100 px-2 py-1"
                >
                  ✕
                </button>
              </div>

              <div className="bg-indigo-600/10 border border-indigo-500/20 rounded-xl p-4 mb-4 text-center">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-indigo-600">
                  ⚡ Chega de pagar mensalidades caras
                </span>
                <h3 className="text-lg sm:text-xl font-extrabold mt-1">
                  Desbloqueie o Qpro Concursos Completo
                </h3>
                <p className="text-xs mt-1 opacity-80">
                  Pague <strong>uma única vez</strong> e tenha acesso ilimitado para sempre!
                </p>
              </div>

              <ul className="space-y-2.5 text-xs sm:text-sm mb-5">
                <li className="flex items-start gap-2.5">
                  <span className="text-emerald-500 font-extrabold text-base">✓</span>
                  <span>
                    <strong>Acesso Vitalício Ilimitado</strong> a todas as questões comentadas da plataforma
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-emerald-500 font-extrabold text-base">✓</span>
                  <span>
                    <strong>✨ Gerador de Questões com IA:</strong> crie questões inéditas sob demanda
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-emerald-500 font-extrabold text-base">✓</span>
                  <span>
                    <strong>⚠️ Caderno de Erros Automático + Favoritas + Bizus:</strong> revise exatamente onde você errou
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-emerald-500 font-extrabold text-base">✓</span>
                  <span>
                    <strong>📈 Raio-X por Disciplina + Modo Leitura</strong>
                  </span>
                </li>
              </ul>

              <div
                className="rounded-2xl border border-slate-200/60 p-4 text-center mb-5"
                style={{ backgroundColor: tema.fundo || "#F8FAFC" }}
              >
                <p className="text-xs line-through font-semibold opacity-60">
                  De R$ 197,00/ano por apenas:
                </p>
                <div className="flex items-baseline justify-center gap-1.5 mt-1">
                  <span className="text-3xl font-extrabold">R$ 47,00</span>
                  <span className="bg-emerald-500/10 text-emerald-600 text-[11px] font-extrabold px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                    PAGAMENTO ÚNICO
                  </span>
                </div>
                <p className="text-xs mt-1 opacity-70">
                  À vista no PIX ou em até <strong>6x de R$ 8,85</strong> no cartão
                </p>
              </div>

              <a
                href={LINK_CHECKOUT_PAGAMENTO}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full text-center py-3.5 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-sm shadow-lg shadow-emerald-200/80 transition-all active:scale-98"
              >
                🚀 Quero Meu Acesso Vitalício por R$ 47,00
              </a>

              <div className="mt-3 flex items-center justify-between text-[11px] opacity-70">
                <span>🔒 Compra 100% Segura • Liberação Imediata</span>
                <a href="/login" className="font-bold hover:underline text-indigo-600">
                  Já comprou? Fazer Login →
                </a>
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* PORTAL DO MODAL DA IA */}
      {mounted &&
        modalIaAberto &&
        createPortal(
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/75 backdrop-blur-sm p-4">
            <div
              style={{
                backgroundColor: tema.cartao || "#FFFFFF",
                color: tema.fonte || "#0F172A",
              }}
              className="border border-slate-200/50 rounded-2xl max-w-md w-full p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200"
            >
              <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-200/40">
                <h3 className="font-extrabold text-base flex items-center gap-2 text-indigo-600">
                  <Sparkles className="w-4 h-4" /> Gerar com IA
                </h3>
                <button
                  type="button"
                  onClick={() => setModalIaAberto(false)}
                  className="opacity-60 hover:opacity-100 font-bold"
                >
                  ✕
                </button>
              </div>

              {erroIa && (
                <div className="mb-3 p-2.5 text-xs rounded-xl bg-rose-50 border border-rose-200 text-rose-600 font-semibold">
                  {erroIa}
                </div>
              )}

              <form onSubmit={handleGerarIa} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase mb-1">
                    Disciplina
                  </label>
                  <input
                    type="text"
                    required
                    value={disciplina}
                    onChange={(e) => setDisciplina(e.target.value)}
                    style={{
                      backgroundColor: tema.fundo || "#F8FAFC",
                      color: tema.fonte || "inherit",
                    }}
                    className="w-full px-3 py-2 border border-slate-200/60 rounded-xl text-sm outline-none focus:border-indigo-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase mb-1">
                    Assunto Específico (Opcional)
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Licitação, Atos..."
                    value={assunto}
                    onChange={(e) => setAssunto(e.target.value)}
                    style={{
                      backgroundColor: tema.fundo || "#F8FAFC",
                      color: tema.fonte || "inherit",
                    }}
                    className="w-full px-3 py-2 border border-slate-200/60 rounded-xl text-sm outline-none focus:border-indigo-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase mb-1">
                    Quantidade
                  </label>
                  <div className="grid grid-cols-5 gap-2">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => setQuantidade(n)}
                        className={`py-2 text-xs font-bold rounded-xl border ${
                          quantidade === n
                            ? "bg-indigo-600 text-white border-indigo-600"
                            : "border-slate-200/60"
                        }`}
                        style={
                          quantidade !== n
                            ? {
                                backgroundColor: tema.fundo || "#F8FAFC",
                                color: tema.fonte || "inherit",
                              }
                            : undefined
                        }
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-200/40">
                  <button
                    type="button"
                    onClick={() => setModalIaAberto(false)}
                    className="px-4 py-2 text-xs font-bold border border-slate-200/60 rounded-xl"
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
          </div>,
          document.body
        )}
    </>
  );
}