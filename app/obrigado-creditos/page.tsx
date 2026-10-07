"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Copy, CheckCircle2, ArrowRight, Loader2, Sparkles, AlertCircle } from 'lucide-react';
import Link from 'next/link';

function ObrigadoConteudo() {
  const searchParams = useSearchParams();
  const email = searchParams.get('email');

  const [codigo, setCodigo] = useState('');
  const [creditos, setCreditos] = useState(0);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(false);
  const [copiado, setCopiado] = useState(false);

  useEffect(() => {
    // Se não tiver email na URL, já cai no erro
    if (!email) {
      setLoading(false);
      setErro(true);
      return;
    }

    const buscarCodigo = async () => {
      try {
        // Tenta buscar o código mais recente associado a este e-mail.
        // Fazemos um loop curto (retry) caso o webhook atrase 1 ou 2 segundos para inserir no banco.
        let tentativas = 0;
        let encontrou = false;

        while (tentativas < 5 && !encontrou) {
          const { data, error } = await supabase
            .from('codigos_creditos')
            .select('codigo, creditos')
            .eq('email_comprador', email)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

          if (data) {
            setCodigo(data.codigo);
            setCreditos(data.creditos);
            encontrou = true;

            // ==============================================================
            // DISPARO DO PIXEL DE COMPRA DINÂMICO (UPSELL)
            // ==============================================================
            if (typeof window !== "undefined" && (window as any).fbq) {
              // Mapeia a quantidade de créditos para o valor pago real
              let valorPago = 19.90; // Padrão (100 créditos)
              if (data.creditos === 300) valorPago = 37.00;
              if (data.creditos >= 1000) valorPago = 89.90;

              (window as any).fbq("track", "Purchase", {
                currency: "BRL",
                value: valorPago,
                content_name: `Pack de ${data.creditos} Créditos IA`,
              });
            }
            // ==============================================================

          } else {
            // Espera 2 segundos antes de tentar de novo
            await new Promise(r => setTimeout(r, 2000));
            tentativas++;
          }
        }

        if (!encontrou) {
          setErro(true);
        }
      } catch (e) {
        setErro(true);
      } finally {
        setLoading(false);
      }
    };

    buscarCodigo();
  }, [email]);

  const copiarCodigo = () => {
    if (codigo) {
      navigator.clipboard.writeText(codigo);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 3000);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mb-4" />
        <h2 className="text-xl font-bold text-slate-800">Gerando seu código de acesso...</h2>
        <p className="text-sm text-slate-500 mt-2 text-center">
          Aguarde um instante enquanto conectamos com a Kiwify.
        </p>
      </div>
    );
  }

  if (erro) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mb-6 shadow-sm">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-extrabold text-slate-800 mb-3">
          Ocorreu um pequeno atraso
        </h2>
        <p className="text-slate-600 mb-8 max-w-sm">
          O seu pagamento foi confirmado, mas o seu código ainda está a ser gerado nos nossos servidores. 
          <br/><br/>
          Não se preocupe! <strong>Nós também enviamos o código para o seu e-mail</strong> ({email || 'cadastrado'}). Verifique a sua caixa de entrada em instantes.
        </p>
        <Link 
          href="/app"
          className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-md hover:bg-indigo-500 transition-all"
        >
          Ir para a Plataforma
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-6 text-center">
      <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full mb-6 shadow-sm ring-4 ring-emerald-50">
        <Sparkles className="w-8 h-8" />
      </div>
      
      <h1 className="text-3xl font-extrabold text-slate-900 mb-2">
        Pagamento Aprovado!
      </h1>
      <p className="text-slate-600 mb-8 max-w-md">
        O seu <strong>Pack de {creditos} Questões IA</strong> já está pronto para ser utilizado. Copie o seu código exclusivo abaixo.
      </p>

      <div className="w-full bg-slate-50 border-2 border-dashed border-indigo-200 rounded-2xl p-6 mb-8 relative">
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-100 text-indigo-700 px-3 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-widest">
          SEU CÓDIGO DE ATIVAÇÃO
        </span>
        <div className="text-3xl md:text-4xl font-black text-indigo-700 tracking-wider font-mono mb-4 break-all">
          {codigo}
        </div>
        
        <button
          onClick={copiarCodigo}
          className={`mx-auto flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all active:scale-95 ${
            copiado 
              ? 'bg-emerald-500 text-white shadow-md shadow-emerald-200' 
              : 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-md shadow-indigo-200'
          }`}
        >
          {copiado ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          {copiado ? 'Código Copiado!' : 'Copiar Código'}
        </button>
      </div>

      <div className="text-left w-full bg-indigo-50/50 rounded-2xl p-5 mb-8 border border-indigo-100">
        <h4 className="font-bold text-slate-800 text-sm mb-3">Como ativar agora:</h4>
        <ul className="space-y-2 text-sm text-slate-600 font-medium">
          <li className="flex gap-2.5"><span className="text-indigo-600 font-black">1.</span> Copie o código acima.</li>
          <li className="flex gap-2.5"><span className="text-indigo-600 font-black">2.</span> Clique no botão abaixo para voltar à plataforma.</li>
          <li className="flex gap-2.5"><span className="text-indigo-600 font-black">3.</span> Na janela de "Gerar com IA", clique no botão amarelo "+ Créditos", preencha o código e ative.</li>
        </ul>
      </div>

      <Link 
        href="/app"
        className="w-full flex items-center justify-center gap-2 py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-extrabold text-lg transition-all active:scale-95 shadow-xl shadow-slate-200"
      >
        Acessar Plataforma Agora <ArrowRight className="w-5 h-5" />
      </Link>
    </div>
  );
}

export default function ObrigadoCreditosPage() {
  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 selection:bg-indigo-200 selection:text-indigo-900">
      <div className="max-w-xl w-full bg-white rounded-[2rem] shadow-2xl p-6 md:p-10 border border-slate-200/60 relative overflow-hidden">
        {/* Decoração de fundo suave */}
        <div className="absolute -top-32 -right-32 w-64 h-64 bg-indigo-50 rounded-full blur-3xl -z-10"></div>
        <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-emerald-50 rounded-full blur-3xl -z-10"></div>
        
        <Suspense fallback={
          <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 animate-spin text-indigo-600" /></div>
        }>
          <ObrigadoConteudo />
        </Suspense>
      </div>
    </div>
  );
}