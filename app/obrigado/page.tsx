"use client";

import React, { useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, Mail, ArrowRight, ShieldCheck } from "lucide-react";

function ConteudoObrigado() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";

  useEffect(() => {
    // Disparo do Pixel de Compra (se houver fbq instalado)
    if (typeof window !== "undefined" && (window as any).fbq) {
      (window as any).fbq("track", "Purchase", {
        currency: "BRL",
        value: 47.0,
      });
    }
  }, []);

  return (
    <div className="min-h-svh bg-slate-50 flex items-center justify-center p-4 sm:p-6 text-slate-900">
      <div className="max-w-md w-full bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-xl text-center">
        {/* Ícone de Sucesso */}
        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-xs">
          <CheckCircle2 className="w-9 h-9" />
        </div>

        <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200/60">
          Pagamento Aprovado
        </span>

        <h1 className="text-2xl font-extrabold text-slate-900 mt-3 mb-2">
          Parabéns! Seu acesso foi liberado.
        </h1>

        <p className="text-sm text-slate-600 leading-relaxed mb-6">
          Enviamos uma mensagem de confirmação para o seu e-mail
          {email ? (
            <>
              {" "}
              <strong className="text-slate-800 font-bold">{email}</strong>
            </>
          ) : (
            ""
          )}
          .
        </p>

        {/* Card de Instruções */}
        <div className="bg-slate-50 border border-slate-200/70 rounded-2xl p-4 text-left mb-6 space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
              1
            </div>
            <p className="text-xs text-slate-700 leading-snug">
              Abra seu e-mail e procure por <strong>Qpro Concursos</strong>.
            </p>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
              2
            </div>
            <p className="text-xs text-slate-700 leading-snug">
              Caso não encontre na caixa de entrada principal, confira a pasta de{" "}
              <strong>Spam</strong> ou <strong>Promoções</strong>.
            </p>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
              3
            </div>
            <p className="text-xs text-slate-700 leading-snug">
              Clique no botão de acesso ou entre direto pela página de login.
            </p>
          </div>
        </div>

        {/* Botão de Ação Direta */}
        <Link
          href="/login"
          className="flex items-center justify-center gap-2 w-full py-3.5 px-5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-sm shadow-md shadow-indigo-200 transition-all active:scale-98"
        >
          <span>Ir para a Página de Login</span>
          <ArrowRight className="w-4 h-4" />
        </Link>

        <div className="mt-5 flex items-center justify-center gap-1.5 text-[11px] text-slate-600 font-medium">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>Acesso seguro com link de confirmação</span>
        </div>
      </div>
    </div>
  );
}

export default function PaginaObrigado() {
  return (
    <Suspense
      fallback={
        <div className="min-h-svh flex items-center justify-center text-sm text-slate-500">
          Carregando...
        </div>
      }
    >
      <ConteudoObrigado />
    </Suspense>
  );
}