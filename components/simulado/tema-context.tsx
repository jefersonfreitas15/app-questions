"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

interface TemaCores {
  fundo: string;
  cartao: string;
  fonte: string;
}

const TemaContext = createContext<TemaCores>({ fundo: "", cartao: "", fonte: "" });

export function TemaProvider({ children }: { children: React.ReactNode }) {
  const [tema, setTema] = useState<TemaCores>({ fundo: "", cartao: "", fonte: "" });

  useEffect(() => {
    const ler = () => {
      try {
        const salvo = localStorage.getItem("simulado_tema_cores");
        if (salvo) setTema(JSON.parse(salvo));
      } catch {}
    };
    ler();
    window.addEventListener("qpro-tema-alterado", ler);
    return () => window.removeEventListener("qpro-tema-alterado", ler);
  }, []);

  return <TemaContext.Provider value={tema}>{children}</TemaContext.Provider>;
}

export const useTema = () => useContext(TemaContext);