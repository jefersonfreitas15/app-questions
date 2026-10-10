"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase/browser";
import { ImportadorProvas } from "@/components/admin/importador-provas";

export function PainelAdminExclusivo() {
  const router = useRouter();
  const [abaAtiva, setAbaAtiva] = useState<"prova_ia" | "json">("prova_ia");
  const [arquivoJson, setArquivoJson] = useState<File | null>(null);
  const [salvando, setSalvando] = useState(false);
  const [erroMsg, setErroMsg] = useState("");
  const [sucessoMsg, setSucessoMsg] = useState("");

  const handleLogout = async () => {
    await supabaseBrowser().auth.signOut();
    router.push("/login");
  };

  const handleImportarArquivoJson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!arquivoJson) return setErroMsg("Selecione um arquivo JSON.");
    setErroMsg("");
    setSucessoMsg("");
    setSalvando(true);

    try {
      const texto = await arquivoJson.text();
      const res = await fetch("/api/admin/importar-json", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: texto,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Falha na importação.");

      setSucessoMsg(
        `Importadas: ${data.novas}. Duplicadas ignoradas: ${data.duplicadas}.`
      );
      setArquivoJson(null);
    } catch (err: any) {
      setErroMsg(err.message || "Arquivo inválido.");
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div className="min-h-svh p-6 bg-slate-50 text-slate-900">
      <div className="max-w-4xl mx-auto border bg-white rounded-2xl p-6 shadow-sm">
        <div className="flex justify-between items-center pb-4 mb-6 border-b">
          <div>
            <h1 className="text-xl font-bold">⚙️ Painel do Administrador</h1>
            <p className="text-xs text-slate-500">Gestão e importação de questões</p>
          </div>
          <div className="flex gap-2">
            <a href="/app" className="px-3.5 py-2 border rounded-xl text-xs font-semibold">
              ← Ver App
            </a>
            <button
              onClick={handleLogout}
              className="px-3.5 py-2 bg-rose-50 text-rose-600 border border-rose-200 rounded-xl text-xs font-bold"
            >
              Sair
            </button>
          </div>
        </div>

        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setAbaAtiva("prova_ia")}
            className={`px-4 py-2 rounded-xl text-xs font-bold ${
              abaAtiva === "prova_ia" ? "bg-indigo-600 text-white" : "bg-slate-100"
            }`}
          >
            🤖 Importar PDF (IA)
          </button>
          <button
            onClick={() => setAbaAtiva("json")}
            className={`px-4 py-2 rounded-xl text-xs font-bold ${
              abaAtiva === "json" ? "bg-indigo-600 text-white" : "bg-slate-100"
            }`}
          >
            📥 Importar Base JSON
          </button>
        </div>

        {erroMsg && (
          <div className="p-3 mb-4 rounded-xl bg-rose-50 text-rose-600 text-xs font-semibold">
            {erroMsg}
          </div>
        )}
        {sucessoMsg && (
          <div className="p-3 mb-4 rounded-xl bg-emerald-50 text-emerald-600 text-xs font-semibold">
            {sucessoMsg}
          </div>
        )}

        {abaAtiva === "prova_ia" ? (
          <ImportadorProvas />
        ) : (
          <form onSubmit={handleImportarArquivoJson} className="space-y-4">
            <div className="p-4 border rounded-xl bg-slate-50">
              <label className="block text-xs font-bold uppercase mb-2">
                Arquivo JSON de Questões
              </label>
              <input
                type="file"
                accept=".json"
                onChange={(e) => setArquivoJson(e.target.files?.[0] || null)}
                className="w-full text-sm"
              />
            </div>
            <button
              type="submit"
              disabled={salvando || !arquivoJson}
              className="px-6 py-2.5 bg-emerald-600 text-white text-xs font-bold rounded-xl hover:bg-emerald-500 disabled:opacity-50"
            >
              {salvando ? "Processando..." : "Importar JSON"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}