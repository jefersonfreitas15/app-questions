"use client";

import React, { useState, useEffect } from "react";
import { supabaseBrowser } from "@/lib/supabase/browser";
import { useTema } from "./tema-context";

export function QuestionCard({
  question,
  numeroAtual,
  totalQuestoes,
  logado,
  plano,
  onRespostaSalva,
}: {
  question: any;
  numeroAtual?: number;
  totalQuestoes?: number;
  logado: boolean;
  plano: string;
  onRespostaSalva?: () => void;
}) {
  const tema = useTema();
  const supabase = supabaseBrowser();

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [showComment, setShowComment] = useState(false);
  const [eliminadas, setEliminadas] = useState<Record<string, boolean>>({});
  const [isFavorita, setIsFavorita] = useState(false);

  const [showNotes, setShowNotes] = useState(false);
  const [anotacaoTexto, setAnotacaoTexto] = useState("");
  const [salvandoNota, setSalvandoNota] = useState(false);

    useEffect(() => {
    setSelectedId(null);
    setIsAnswered(false);
    setShowComment(false);
    setEliminadas({});
    setIsFavorita(false);
    setAnotacaoTexto("");

    if (!question?.id) return;

    if (logado) {
      const carregarDadosUsuario = async () => {
        // 1. Busca Favorita
        const { data: favData } = await (supabase as any)
          .from("favoritas")
          .select("id")
          .eq("questao_id", question.id)
          .maybeSingle();

        if (favData) setIsFavorita(true);

        // 2. Busca Anotação
        const { data: notaData } = await (supabase as any)
          .from("anotacoes")
          .select("texto")
          .eq("questao_id", question.id)
          .maybeSingle();

        if (notaData?.texto) setAnotacaoTexto(notaData.texto);
      };

      carregarDadosUsuario();
    } else {
      // Fallback LocalStorage para visitante
      try {
        const favs = JSON.parse(localStorage.getItem("visitante_favs") || "[]");
        setIsFavorita(favs.includes(question.id));
        const notas = JSON.parse(localStorage.getItem("visitante_notas") || "{}");
        setAnotacaoTexto(notas[question.id] || "");
      } catch {}
    }
  }, [question?.id, logado]);

  if (!question) {
    return (
      <div className="p-8 border rounded-2xl text-center text-sm opacity-60">
        Nenhuma questão selecionada.
      </div>
    );
  }

  const alternativas = (question.alternativas || []).sort(
    (a: any, b: any) => (a.ordem ?? 0) - (b.ordem ?? 0)
  );
  const letras = ["A", "B", "C", "D", "E"];

  const toggleFavorita = async () => {
    const novoStatus = !isFavorita;
    setIsFavorita(novoStatus);

    if (logado) {
      if (novoStatus) {
        await supabase.from("favoritas").insert({ questao_id: question.id });
      } else {
        await supabase.from("favoritas").delete().eq("questao_id", question.id);
      }
    } else {
      try {
        let favs: string[] = JSON.parse(localStorage.getItem("visitante_favs") || "[]");
        favs = novoStatus ? [...favs, question.id] : favs.filter((id) => id !== question.id);
        localStorage.setItem("visitante_favs", JSON.stringify(favs));
      } catch {}
    }
  };

  const handleSalvarAnotacao = async (texto: string) => {
    setAnotacaoTexto(texto);
    setSalvandoNota(true);

    if (logado) {
      if (!texto.trim()) {
        await supabase.from("anotacoes").delete().eq("questao_id", question.id);
      } else {
        await supabase.from("anotacoes").upsert(
          { questao_id: question.id, texto: texto.trim(), atualizado_em: new Date().toISOString() },
          { onConflict: "usuario_id,questao_id" }
        );
      }
    } else {
      try {
        const notas = JSON.parse(localStorage.getItem("visitante_notas") || "{}");
        if (!texto.trim()) delete notas[question.id];
        else notas[question.id] = texto.trim();
        localStorage.setItem("visitante_notas", JSON.stringify(notas));
      } catch {}
    }
    setTimeout(() => setSalvandoNota(false), 800);
  };

  const handleResponder = async () => {
    if (!selectedId || isAnswered) return;

    if (plano !== "vitalicio") {
      const resolvidasLocal = Number(localStorage.getItem("qpro_degustacao_resolvidas") || "0");
      if (resolvidasLocal >= 5) {
        window.dispatchEvent(new Event("abrir-modal-vitalicio"));
        return;
      }
      localStorage.setItem("qpro_degustacao_resolvidas", String(resolvidasLocal + 1));
    }

    setIsAnswered(true);
    setShowComment(true);

    const altEscolhida = alternativas.find((a: any) => a.id === selectedId);
    const acertou = Boolean(altEscolhida?.is_correta);

    if (logado) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from("respostas_usuarios").insert({
          usuario_id: user.id,
          questao_id: question.id,
          alternativa_id: selectedId,
          acertou: acertou,
        });
        if (onRespostaSalva) onRespostaSalva();
      }
    }
  };

  const altEscolhida = alternativas.find((a: any) => a.id === selectedId);
  const acertouQuestao = Boolean(altEscolhida?.is_correta);

  return (
    <div
      className="border border-slate-200/50 rounded-2xl p-5 sm:p-8 shadow-xs transition-all"
      style={{ backgroundColor: tema.cartao || "#FFFFFF", color: tema.fonte || "inherit" }}
    >
      <div className="flex flex-wrap items-center justify-between gap-2 mb-6">
        <div className="flex flex-wrap gap-2">
          {numeroAtual && (
            <span className="bg-indigo-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-xs">
              Questão {numeroAtual.toLocaleString("pt-BR")}
            </span>
          )}
          {question.banca && (
            <span className="bg-indigo-50 border border-indigo-200/60 text-indigo-600 px-3 py-1 rounded-full text-xs font-semibold">
              {question.banca}
            </span>
          )}
          {question.ano && (
            <span className="bg-sky-50 border border-sky-200/60 text-sky-600 px-3 py-1 rounded-full text-xs font-semibold">
              {question.ano}
            </span>
          )}
          {question.disciplina && (
            <span className="bg-violet-50 border border-violet-200/60 text-violet-600 px-3 py-1 rounded-full text-xs font-semibold">
              {question.disciplina}
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={toggleFavorita}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border transition-all ${
            isFavorita ? "bg-amber-50 border-amber-400 text-amber-600" : "opacity-60 hover:opacity-100"
          }`}
        >
          <span>{isFavorita ? "⭐ Favorita" : "☆ Favoritar"}</span>
        </button>
      </div>

      <h2 className="text-base sm:text-lg mb-7 leading-relaxed font-medium text-justify">
        {question.enunciado}
      </h2>

      <div className="flex flex-col gap-3 mb-6">
        {alternativas.map((alt: any, index: number) => {
          const altKey = String(alt.id || index);
          const isEliminada = Boolean(eliminadas[altKey]) && !isAnswered;
          const isSelected = selectedId === alt.id;
          const isCorrect = Boolean(alt.is_correta);
          const letra = letras[index] || String(index + 1);

          let estiloCard = "border-slate-200/60 hover:border-indigo-400 cursor-pointer";
          let estiloBadge = "bg-slate-100 text-slate-600";

          if (isEliminada) {
            estiloCard = "opacity-40 border-slate-200 cursor-default";
            estiloBadge = "bg-slate-200 line-through";
          } else if (!isAnswered && isSelected) {
            estiloCard = "border-indigo-500 bg-indigo-50/20 ring-2 ring-indigo-500/20";
            estiloBadge = "bg-indigo-600 text-white";
          } else if (isAnswered) {
            if (isCorrect) {
              estiloCard = "border-emerald-500 bg-emerald-50/20";
              estiloBadge = "bg-emerald-600 text-white";
            } else if (isSelected && !isCorrect) {
              estiloCard = "border-rose-500 bg-rose-50/20";
              estiloBadge = "bg-rose-600 text-white";
            }
          }

          return (
            <div
              key={altKey}
              onClick={() => {
                if (!isAnswered && !isEliminada) setSelectedId(alt.id);
              }}
              className={`p-4 border rounded-xl transition-all flex items-center justify-between gap-3 ${estiloCard}`}
            >
              <div className="flex items-center gap-3.5 flex-1">
                <span className={`w-7 h-7 shrink-0 flex items-center justify-center rounded-full text-xs font-bold ${estiloBadge}`}>
                  {letra}
                </span>
                <span className={`text-sm sm:text-base ${isEliminada ? "line-through opacity-60" : ""}`}>
                  {alt.texto}
                </span>
              </div>

              {!isAnswered && (
                <button
                  type="button"
                  title="Descartar opção"
                  onClick={(e) => {
                    e.stopPropagation();
                    setEliminadas((prev) => ({ ...prev, [altKey]: !prev[altKey] }));
                  }}
                  className="opacity-40 hover:opacity-100 text-xs px-2 py-1"
                >
                  ✂️
                </button>
              )}
            </div>
          );
        })}
      </div>

      {isAnswered && (
        <div
          className={`mb-6 p-4 rounded-xl border text-sm font-medium ${
            acertouQuestao ? "bg-emerald-50 border-emerald-400 text-emerald-700" : "bg-rose-50 border-rose-400 text-rose-700"
          }`}
        >
          {acertouQuestao ? "✨ Resposta correta!" : "💡 Resposta incorreta. Veja a fundamentação abaixo."}
        </div>
      )}

      <div className="flex flex-wrap gap-3 justify-between items-center pt-5 border-t border-slate-100">
        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => setShowComment(!showComment)}
            className="text-sm font-semibold text-indigo-600 hover:text-indigo-500"
          >
            {showComment ? "▲ Ocultar Comentário" : "📘 Comentário do Professor"}
          </button>
          <button
            type="button"
            onClick={() => setShowNotes(!showNotes)}
            className="text-sm font-semibold text-amber-600 hover:text-amber-500"
          >
            📝 {showNotes ? "Ocultar Anotação" : "Minhas Anotações"}
          </button>
        </div>

        {!isAnswered ? (
          <button
            type="button"
            onClick={handleResponder}
            disabled={!selectedId}
            className="px-6 py-2.5 rounded-xl font-bold text-sm bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-40 shadow-xs"
          >
            Responder
          </button>
        ) : (
          <button
            type="button"
            onClick={() => {
              setSelectedId(null);
              setIsAnswered(false);
              setShowComment(false);
            }}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold border border-indigo-200 text-indigo-600 hover:bg-indigo-50"
          >
            ↻ Refazer Questão
          </button>
        )}
      </div>

      {showNotes && (
        <div className="mt-4 p-4 border border-amber-200 bg-amber-50/40 rounded-xl">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-bold text-amber-700">📝 Anotações e Bizus</span>
            <span className="text-[11px] text-amber-600">{salvandoNota ? "Salvando..." : "Salvo na nuvem"}</span>
          </div>
          <textarea
            rows={3}
            value={anotacaoTexto}
            onChange={(e) => handleSalvarAnotacao(e.target.value)}
            placeholder="Digite seus macetes e anotações para revisão..."
            className="w-full p-2.5 text-sm rounded-lg border border-amber-200 outline-none focus:border-amber-400 bg-white text-slate-800"
          />
        </div>
      )}

      {showComment && (
        <div className="mt-4 p-4 border border-indigo-100 bg-indigo-50/30 rounded-xl text-sm leading-relaxed">
          <p className="font-bold text-indigo-700 mb-1">📘 Fundamentação:</p>
          <p className="opacity-90">{question.explicacao || "Comentário ainda não cadastrado para esta questão."}</p>
        </div>
      )}
    </div>
  );
}