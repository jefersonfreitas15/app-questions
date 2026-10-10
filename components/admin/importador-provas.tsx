"use client";

import React, { useState } from "react";
import { Upload, Loader2 } from "lucide-react";

export function ImportadorProvas() {
  const [provaPdf, setProvaPdf] = useState<File | null>(null);
  const [gabaritoPdf, setGabaritoPdf] = useState<File | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "review" | "saving" | "success" | "error">("idle");
  const [mensagem, setMensagem] = useState("");
  const [questoesExtraidas, setQuestoesExtraidas] = useState<any[]>([]);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!provaPdf || !gabaritoPdf) return setMensagem("Selecione os 2 arquivos PDF.");

    setStatus("loading");
    setMensagem("A IA está processando os PDFs. Aguarde...");

    const formData = new FormData();
    formData.append("prova", provaPdf);
    formData.append("gabarito", gabaritoPdf);

    try {
      const res = await fetch("/api/admin/processar-pdf", { method: "POST", body: formData });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Erro ao processar.");
      if (!data.questoes?.length) throw new Error("Nenhuma questão extraída.");

      setQuestoesExtraidas(data.questoes);
      setStatus("review");
      setMensagem(`Foram identificadas ${data.questoes.length} questões.`);
    } catch (err: any) {
      setStatus("error");
      setMensagem(err.message);
    }
  };

  const handleConfirmarSalvar = async () => {
    setStatus("saving");
    try {
      const res = await fetch("/api/admin/importar-json", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(questoesExtraidas),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao salvar.");

      setStatus("success");
      setMensagem(`Sucesso! ${data.novas} questões foram gravadas no banco.`);
      setQuestoesExtraidas([]);
      setProvaPdf(null);
      setGabaritoPdf(null);
    } catch (err: any) {
      setStatus("error");
      setMensagem(err.message);
    }
  };

  return (
    <div className="p-4 border rounded-xl bg-slate-50">
      <h3 className="font-bold text-sm mb-3 flex items-center gap-2">
        <Upload className="w-4 h-4 text-indigo-600" /> Importar Prova e Gabarito
      </h3>

      {status !== "review" && (
        <form onSubmit={handleUpload} className="grid sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold mb-1">Caderno de Prova (PDF)</label>
            <input
              type="file"
              accept=".pdf"
              onChange={(e) => setProvaPdf(e.target.files?.[0] || null)}
              className="w-full text-xs"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1">Gabarito Oficial (PDF)</label>
            <input
              type="file"
              accept=".pdf"
              onChange={(e) => setGabaritoPdf(e.target.files?.[0] || null)}
              className="w-full text-xs"
            />
          </div>
          <button
            type="submit"
            disabled={status === "loading"}
            className="sm:col-span-2 py-2.5 bg-indigo-600 text-white font-bold text-xs rounded-xl hover:bg-indigo-500 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {status === "loading" && <Loader2 className="w-4 h-4 animate-spin" />}
            {status === "loading" ? "Processando..." : "Processar com IA"}
          </button>
        </form>
      )}

      {status === "review" && (
        <div className="mt-3">
          <p className="text-xs font-semibold text-emerald-700 mb-2">{mensagem}</p>
          <div className="flex gap-2">
            <button
              onClick={() => setStatus("idle")}
              className="flex-1 py-2 text-xs font-bold border rounded-lg bg-white"
            >
              Descartar
            </button>
            <button
              onClick={handleConfirmarSalvar}
              className="flex-1 py-2 text-xs font-bold text-white bg-emerald-600 rounded-lg hover:bg-emerald-500"
            >
              Gravar no Banco
            </button>
          </div>
        </div>
      )}

      {mensagem && status !== "review" && (
        <p className="mt-3 text-xs font-semibold text-slate-700">{mensagem}</p>
      )}
    </div>
  );
}