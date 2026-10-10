"use client";

import React, { Suspense } from "react";
import Link from "next/link";
import { Sparkles, ArrowRight, CheckCircle2 } from "lucide-react";

function ConteudoObrigadoCreditos() {
  return (
    <div className="min-h-svh bg-slate-50 flex items-center justify-center p-4 sm:p-6 text-slate-900">
      <div className="max-w-md w-full bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-xl text-center">
        <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-xs">
          <Sparkles className="w-8 h-8" />
        </div>

        <span className="text-[11px] font-extrabold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-200/60">
          Recarga de IA Confirmada
        </span>

        <h1 className="text-2xl font-extrabold text-slate-900 mt-3 mb-2">
          Créditos adicionados!
        </h1>

        <p className="text-sm text-slate-600 leading-relaxed mb-6">
          Seus novos créditos de Inteligência Artificial já foram creditados na sua conta automaticamente.
        </p>

        <div className="bg-slate-50 border border-slate-200/70 rounded-2xl p-4 text-left mb-6 space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-800">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>Saldo atualizado no banco de dados</span>
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-800">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>Pronto para gerar simulados inéditos</span>
          </div>
        </div>

        <Link
          href="/app"
          className="flex items-center justify-center gap-2 w-full py-3.5 px-5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-extrabold text-sm shadow-md shadow-indigo-200 transition-all active:scale-98"
        >
          <span>Abrir Caderno de Questões</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}

export default function PaginaObrigadoCreditos() {
  return (
    <Suspense
      fallback={
        <div className="min-h-svh flex items-center justify-center text-sm text-slate-500">
          Carregando...
        </div>
      }
    >
      <ConteudoObrigadoCreditos />
    </Suspense>
  );
}