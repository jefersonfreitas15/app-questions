"use client";

import React from "react";
import { useTema } from "./tema-context";

export function SeletorTema() {
  const { fundo } = useTema();

  const trocarTema = (f: string, c: string, fonte: string) => {
    const payload = { fundo: f, cartao: c, fonte };
    localStorage.setItem("simulado_tema_cores", JSON.stringify(payload));
    window.dispatchEvent(new Event("qpro-tema-alterado"));
  };

  return (
    <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
      <button
        type="button"
        title="Modo Padrão"
        onClick={() => trocarTema("", "", "")}
        className="w-5 h-5 rounded-lg bg-white border border-slate-300 shadow-2xs hover:scale-105 transition-all"
      />
      <button
        type="button"
        title="Modo Noturno"
        onClick={() => trocarTema("#0B132B", "#1C2541", "#FFFFFF")}
        className="w-5 h-5 rounded-lg bg-slate-900 border border-slate-700 shadow-2xs hover:scale-105 transition-all"
      />
      <button
        type="button"
        title="Modo Sepia / Leitura"
        onClick={() => trocarTema("#FBF7EE", "#FFFFFF", "#2D2A26")}
        className="w-5 h-5 rounded-lg bg-[#EAD8B1] border border-[#D5C295] shadow-2xs hover:scale-105 transition-all"
      />
    </div>
  );
}