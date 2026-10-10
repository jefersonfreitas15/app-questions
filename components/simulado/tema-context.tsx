"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

interface TemaCores {
  fundo: string;
  cartao: string;
  fonte: string;
}

const temaPadrao: TemaCores = {
  fundo: "#F8FAFC",
  cartao: "#FFFFFF",
  fonte: "#1E293B",
};

const TemaContext = createContext<TemaCores>(temaPadrao);

export function TemaProvider({ children }: { children: React.ReactNode }) {
  const [tema, setTema] = useState<TemaCores>(temaPadrao);

  const aplicarTemaNoDOM = (cores: TemaCores) => {
    if (typeof document === "undefined") return;
    const root = document.getElementById("simulado-root");
    if (root) {
      if (cores.fundo) root.style.backgroundColor = cores.fundo;
      if (cores.fonte) root.style.color = cores.fonte;
    }
    if (cores.fundo) document.body.style.backgroundColor = cores.fundo;
    if (cores.fonte) document.body.style.color = cores.fonte;
  };

  const lerTema = () => {
    try {
      const salvo = localStorage.getItem("simulado_tema_cores");
      if (salvo) {
        const parsed = JSON.parse(salvo);
        if (parsed.fundo && parsed.cartao && parsed.fonte) {
          setTema(parsed);
          aplicarTemaNoDOM(parsed);
          return;
        }
      }
    } catch {}
    aplicarTemaNoDOM(temaPadrao);
  };

  useEffect(() => {
    lerTema();
    window.addEventListener("qpro-tema-alterado", lerTema);
    return () => window.removeEventListener("qpro-tema-alterado", lerTema);
  }, []);

  return <TemaContext.Provider value={tema}>{children}</TemaContext.Provider>;
}

export const useTema = () => useContext(TemaContext);