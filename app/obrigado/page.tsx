"use client";

import { useState } from "react";
import { CheckCircle2, Copy, Check, ArrowRight, Sparkles } from "lucide-react";

export default function PaginaObrigado() {
  const [copiado, setCopiado] = useState(false);
  const codigoAtivacao = "QPRO47";

  const handleCopiarCodigo = () => {
    navigator.clipboard.writeText(codigoAtivacao);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 3000);
  };

  return (
    <div className="min-h-svh bg-slate-50 flex flex-col items-center justify-center p-4 sm:p-8 font-sans">
      <div className="max-w-xl w-full bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
        
        {/* Cabeçalho de Sucesso */}
        <div className="bg-emerald-500 p-8 text-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white to-transparent" />
          <CheckCircle2 className="w-20 h-20 text-white mx-auto mb-4 relative z-10 animate-bounce" />
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white relative z-10 tracking-tight">
            Pagamento Aprovado!
          </h1>
          <p className="text-emerald-50 text-sm sm:text-base mt-2 font-medium relative z-10">
            Seu Acesso Vitalício ao Qpro Concursos está liberado.
          </p>
        </div>

        {/* Corpo da Página */}
        <div className="p-6 sm:p-10">
          <div className="text-center mb-8">
            <h2 className="text-lg font-bold text-slate-800 flex items-center justify-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              Siga os passos para ativar sua conta:
            </h2>
          </div>

          {/* Passo a Passo */}
          <div className="space-y-6 relative">
            {/* Linha conectora invisível no mobile, visível no desktop */}
            <div className="hidden sm:block absolute left-4 top-4 bottom-4 w-0.5 bg-slate-100" />

            {/* Passo 1 */}
            <div className="flex items-start gap-4 relative z-10">
              <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-extrabold flex items-center justify-center shrink-0 border-4 border-white shadow-sm">
                1
              </div>
              <div className="flex-1 pt-1">
                <p className="text-sm font-bold text-slate-800">
                  Copie o seu Código de Ativação
                </p>
                <p className="text-xs text-slate-500 mb-3 mt-1">
                  Este é o seu passe livre vitalício. Clique no botão para copiar:
                </p>
                
                {/* Bloco do Código */}
                <div 
                  onClick={handleCopiarCodigo}
                  className="flex items-center justify-between bg-slate-50 border-2 border-dashed border-slate-300 rounded-xl p-3 cursor-pointer hover:bg-indigo-50 hover:border-indigo-300 transition-all group"
                  title="Clique para copiar"
                >
                  <span className="text-xl sm:text-2xl font-black text-indigo-600 tracking-widest pl-2">
                    {codigoAtivacao}
                  </span>
                  <button 
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                      copiado 
                        ? "bg-emerald-100 text-emerald-700" 
                        : "bg-white border border-slate-200 text-slate-600 group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-600"
                    }`}
                  >
                    {copiado ? (
                      <>
                        <Check className="w-4 h-4" /> Copiado!
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" /> Copiar
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Passo 2 */}
            <div className="flex items-start gap-4 relative z-10">
              <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-extrabold flex items-center justify-center shrink-0 border-4 border-white shadow-sm">
                2
              </div>
              <div className="flex-1 pt-1">
                <p className="text-sm font-bold text-slate-800">
                  Abra o aplicativo e ative seu código
                </p>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Clique no botão azul abaixo para abrir a plataforma. Lá dentro, clique no botão <strong>"👑 Liberar Vitalício"</strong> (ou em qualquer botão de <strong>Gerar com IA</strong>), escolha a aba <strong>"🔑 Já comprei! Ativar"</strong> e cole o seu código.
                </p>
              </div>
            </div>
          </div>

          {/* Botão de Ação (Redirecionamento) */}
          <div className="mt-10">
            <a 
              href="/" // Se você mover o app para "/app", mude este href para "/app"
              className="flex items-center justify-center gap-2 w-full bg-indigo-600 hover:bg-indigo-500 text-white p-4 rounded-2xl font-extrabold text-sm sm:text-base shadow-lg shadow-indigo-200 transition-all active:scale-[0.98] group"
            >
              Abrir Aplicativo e Ativar Agora
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </a>
          </div>

          <div className="mt-6 text-center">
            <p className="text-[11px] text-slate-400 font-medium">
              Enviamos também um recibo e estas instruções para o e-mail cadastrado na hora da compra. Se precisar de ajuda, guarde esse código.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}