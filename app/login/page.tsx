"use client";
import { useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/browser";
import { AvisoErroLogin } from "@/components/aviso-erro-login";

export default function Login() {
  const [email, setEmail] = useState("");
  const [enviado, setEnviado] = useState(false);
  const [carregando, setCarregando] = useState(false);

    async function entrar(e: React.FormEvent) {
    e.preventDefault();
    setCarregando(true);
    try {
      await fetch("/api/login-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });
    } finally {
      setEnviado(true); // mensagem igual, exista a conta ou não
      setCarregando(false);
    }
  }

  return (
    <main className="mx-auto max-w-sm p-6">
      <h1 className="text-xl font-bold">Entrar no Qpro</h1>
      {!enviado && <AvisoErroLogin />}
      {enviado ? (
        <p className="mt-4 text-sm">
          Se este e-mail tiver uma compra, enviamos um link de acesso. Verifique também o spam.
        </p>
      ) : (
        <form onSubmit={entrar} className="mt-4 flex flex-col gap-3">
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
            placeholder="E-mail usado na compra" className="rounded-xl border px-3 py-2" />
          <button disabled={carregando} className="rounded-xl bg-indigo-600 py-2 font-bold text-white">
            {carregando ? "Enviando..." : "Receber link de acesso"}
          </button>
        </form>
      )}
    </main>
  );
}