"use client";

import { useEffect, useState } from "react";

type Estado = "carregando" | "ok" | "revisar" | "sem_gabarito" | "erro";

export function ComentarioProfessor({
  questaoId,
  explicacaoInicial,
  ia = false,
}: {
  questaoId: string;
  explicacaoInicial?: string | null;
  ia?: boolean;
}) {
  const temTexto = Boolean(explicacaoInicial && explicacaoInicial.trim());
  const [estado, setEstado] = useState<Estado>(temTexto ? "ok" : "carregando");
  const [texto, setTexto] = useState(explicacaoInicial || "");
  const [geradoPorIa, setGeradoPorIa] = useState(ia);
  const [erro, setErro] = useState("");

  useEffect(() => {
    if (temTexto) return;
    let cancelado = false;

    async function buscar(tentativa = 1) {
      try {
        const res = await fetch("/api/comentario", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ questaoId }),
        });
        const data = await res.json();
        if (cancelado) return;

        if (res.status === 202 && tentativa < 8) {
          setTimeout(() => buscar(tentativa + 1), 4000); // outro aluno está gerando agora
          return;
        }
        if (!res.ok) throw new Error(data.error || "Erro ao carregar o comentário.");

        if (data.explicacao) {
          setTexto(data.explicacao);
          setGeradoPorIa(Boolean(data.ia));
          setEstado("ok");
        } else {
          setEstado(data.status === "sem_gabarito" ? "sem_gabarito" : "revisar");
        }
      } catch (e: any) {
        if (!cancelado) {
          setErro(e.message);
          setEstado("erro");
        }
      }
    }

    buscar();
    return () => {
      cancelado = true;
    };
  }, [questaoId, temTexto]);

  return (
    <div className="mt-4 p-4 border border-indigo-100 bg-indigo-50/30 rounded-xl text-sm leading-relaxed">
      <div className="flex items-center justify-between gap-2 mb-2">
        <p className="font-bold text-indigo-700">📘 Comentário do professor</p>
        {estado === "ok" && geradoPorIa && (
          <span className="rounded-md bg-violet-100 px-2 py-0.5 text-[10px] font-bold text-violet-700">✨ Gerado por IA</span>
        )}
      </div>

      {estado === "carregando" && (
        <p className="opacity-70 animate-pulse">O professor está preparando o comentário desta questão...</p>
      )}
      {estado === "ok" && <p className="opacity-90 whitespace-pre-line">{texto}</p>}
      {estado === "revisar" && (
        <p className="opacity-80">Esta questão está em revisão pela nossa equipe. O comentário será publicado em breve.</p>
      )}
      {estado === "sem_gabarito" && <p className="opacity-80">Esta questão ainda não tem gabarito cadastrado.</p>}
      {estado === "erro" && <p className="text-rose-600 font-semibold">{erro}</p>}
    </div>
  );
}