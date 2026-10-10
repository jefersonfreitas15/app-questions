"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";

const MENSAGENS: Record<string, string> = {
  link_expirado: "Este link de acesso expirou ou já foi usado. Digite seu e-mail abaixo para receber um novo.",
  link: "Não foi possível validar seu link. Digite seu e-mail abaixo para receber um novo.",
  sem_token: "Link incompleto. Digite seu e-mail abaixo para receber um novo.",
};

function Aviso() {
  const erro = useSearchParams().get("erro");
  if (!erro) return null;
  const texto = MENSAGENS[erro] ?? "Não foi possível entrar. Solicite um novo link de acesso.";

  return (
    <div className="mb-3 rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-sm text-amber-300">
      {texto}
    </div>
  );
}

export function AvisoErroLogin() {
  return (
    <Suspense fallback={null}>
      <Aviso />
    </Suspense>
  );
}