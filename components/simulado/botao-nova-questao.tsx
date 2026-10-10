"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Sparkles, Loader2 } from "lucide-react";
import { useTema } from "./tema-context";

const LINK_CHECKOUT_PAGAMENTO = "https://pay.kiwify.com.br/VE1GbyL";
const LIMITE_QUESTOES_GRATIS = 5;

// Mesmo produto de créditos, uma oferta (link) para cada pacote
const PACOTES_CREDITOS = [
  { creditos: 100, preco: "R$ 19,90", link: "https://pay.kiwify.com.br/pO9bvnh", destaque: false },
  { creditos: 300, preco: "R$ 37,00", link: "https://pay.kiwify.com.br/ucNASij", destaque: true },
  { creditos: 1000, preco: "R$ 89,90", link: "https://pay.kiwify.com.br/rAugTp1", destaque: false },
];

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
  const [modalCreditosAberto, setModalCreditosAberto] = useState(false);
  const [semCreditos, setSemCreditos] = useState(false);

  const [disciplina, setDisciplina] = useState("Direito Administrativo");
  const [assunto, setAssunto] = useState("");
  const [quantidade, setQuantidade] = useState(5);
  const [gerando, setGerando] = useState(false);
  const [erroIa, setErroIa] = useState("");

  const ehVitalicio = perfil?.plano === "vitalicio";
  const logado = Boolean(perfil?.logado);
  const saldo = perfil?.creditos ?? 0;

  const abrirCompraCreditos = () => {
    setModalIaAberto(false);
    setModalCreditosAberto(true);
  };

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
    const abrirCreditos = () => setModalCreditosAberto(true);
    window.addEventListener("abrir-modal-vitalicio", abrirOferta);
    window.addEventListener("abrir-modal-creditos", abrirCreditos);
    window.addEventListener("atualizar-degustacao", atualizarContagem);

    return () => {
      window.removeEventListener("abrir-modal-vitalicio", abrirOferta);
      window.removeEventListener("abrir-modal-creditos", abrirCreditos);
      window.removeEventListener("atualizar-degustacao", atualizarContagem);
    };
  }, []);

  const restantesGratis = Math.max(0, LIMITE_QUESTOES_GRATIS - resolvidasGratis);

  const handleGerarIa = async (e: React.FormEvent) => {
    e.preventDefault();
    setErroIa("");
    setSemCreditos(false);

    if (logado && saldo < quantidade) {
      setSemCreditos(true);
      setErroIa(
        saldo > 0
          ? `Você tem ${saldo} crédito(s). Diminua a quantidade ou compre mais créditos.`
          : "Seus créditos de IA acabaram. Compre um pacote para continuar gerando questões."
      );
      return;
    }

    setGerando(true);

    try {
      const res = await fetch("/api/gerar-ia", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ disciplina, assunto, quantidade }),
      });

      const data = await res.json();
      if (res.status === 402) setSemCreditos(true);
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
                {!logado && (
          <a
            href="/login"
            className="flex items-center gap-1.5 border border-indigo-300 text-indigo-600 px-3.5 py-2 rounded-xl text-xs font-extrabold hover:bg-indigo-50 transition-all active:scale-95"
          >
            Já comprei • Entrar
          </a>
        )}

        {logado && (
          <button
            type="button"
            onClick={() => setModalCreditosAberto(true)}
            title="Comprar mais créditos de IA"
            className="flex items-center gap-1.5 border border-amber-400/70 bg-amber-500/10 text-amber-600 px-3.5 py-2 rounded-xl text-xs font-extrabold hover:bg-amber-500/20 transition-all active:scale-95"
          >
            <span>⚡</span>
            <span>{saldo} créditos</span>
            <span className="hidden sm:inline">• Comprar mais</span>
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

      {/* PORTAL DO MODAL VITALÍCIO */}
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

      {/* PORTAL DO MODAL DE CRÉDITOS */}
      {mounted &&
        modalCreditosAberto &&
        createPortal(
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/75 backdrop-blur-sm p-4 overflow-y-auto">
            <div
              style={{
                backgroundColor: tema.cartao || "#FFFFFF",
                color: tema.fonte || "#0F172A",
              }}
              className="relative border border-slate-200/50 rounded-2xl max-w-lg w-full p-6 shadow-2xl my-8 animate-in fade-in zoom-in-95 duration-200"
            >
              <div className="flex items-center justify-between border-b border-slate-200/40 pb-3 mb-4">
                <h3 className="font-extrabold text-base text-amber-600">⚡ Créditos para o Gerador com IA</h3>
                <button
                  type="button"
                  onClick={() => setModalCreditosAberto(false)}
                  className="text-sm font-bold opacity-60 hover:opacity-100 px-2 py-1"
                >
                  ✕
                </button>
              </div>

              <p className="text-xs opacity-80 mb-4">
                Cada crédito gera 1 questão inédita com gabarito comentado.
                {logado && (
                  <>
                    {" "}Seu saldo atual: <strong>{saldo} crédito(s)</strong>.
                  </>
                )}
              </p>

              <div className="grid gap-3 sm:grid-cols-3">
                {PACOTES_CREDITOS.map((p) => (
                  <a
                    key={p.creditos}
                    href={p.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ backgroundColor: tema.fundo || "#F8FAFC" }}
                    className={`relative rounded-2xl border p-4 text-center transition-all hover:scale-[1.02] active:scale-95 ${
                      p.destaque ? "border-amber-400 ring-2 ring-amber-400/40" : "border-slate-200/60"
                    }`}
                  >
                    {p.destaque && (
                      <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 rounded-full bg-amber-500 px-2 py-0.5 text-[10px] font-extrabold text-white">
                        MAIS VENDIDO
                      </span>
                    )}
                    <div className="text-2xl font-extrabold">{p.creditos}</div>
                    <div className="text-[11px] font-semibold opacity-70">créditos</div>
                    <div className="mt-2 text-sm font-extrabold text-emerald-600">{p.preco}</div>
                    <div className="mt-3 rounded-lg bg-amber-500 py-1.5 text-xs font-extrabold text-white">
                      Comprar
                    </div>
                  </a>
                ))}
              </div>

              <p className="mt-4 text-[11px] opacity-70 text-center">
                🔒 Compre com o mesmo e-mail da sua conta. Os créditos entram no saldo automaticamente após a aprovação.
              </p>
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

              {logado && (
                <div className="mb-3 flex items-center justify-between text-xs font-semibold opacity-80">
                  <span>⚡ Saldo: {saldo} crédito(s) • 1 crédito por questão</span>
                  <button
                    type="button"
                    onClick={abrirCompraCreditos}
                    className="font-bold text-indigo-600 hover:underline"
                  >
                    Comprar mais
                  </button>
                </div>
              )}

              {erroIa && (
                <div className="mb-3 p-2.5 text-xs rounded-xl bg-rose-50 border border-rose-200 text-rose-600 font-semibold">
                  {erroIa}
                  {semCreditos && (
                    <button
                      type="button"
                      onClick={abrirCompraCreditos}
                      className="mt-2 block w-full text-center py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-white font-extrabold"
                    >
                      ⚡ Comprar mais créditos
                    </button>
                  )}
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