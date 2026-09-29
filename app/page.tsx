"use client";

import { ArrowRight, BrainCircuit, Target, BarChart3, MoonStar, CheckCircle2, XCircle } from "lucide-react";
import Link from "next/link";

export default function LandingPage() {
  // Cole seu link da Kiwify aqui também para quem quiser comprar direto sem testar
  const LINK_CHECKOUT = "https://pay.kiwify.com.br/SEU-LINK-AQUI";

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      
      {/* HEADER SIMPLES */}
      <header className="absolute top-0 w-full p-6 flex justify-between items-center z-10 max-w-6xl mx-auto left-0 right-0">
        <div className="flex items-center gap-2 font-black text-xl tracking-tight text-slate-800">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
            Q
          </div>
          Qpro Concursos
        </div>
        <Link 
          href="/app" 
          className="text-sm font-bold text-slate-600 hover:text-indigo-600 transition-colors"
        >
          Já sou aluno
        </Link>
      </header>

      {/* HERO SECTION (A Promessa Principal) */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 px-4 overflow-hidden">
        {/* Efeitos de fundo */}
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-indigo-400/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-emerald-400/20 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-bold uppercase tracking-wider mb-6">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
            </span>
            A primeira plataforma com IA
          </div>
          
          <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight mb-6">
            Chega de pagar <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-500">mensalidades caras</span> para resolver questões.
          </h1>
          
          <p className="text-lg md:text-xl text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed">
            Estude de forma inteligente com a primeira plataforma que gera questões inéditas por Inteligência Artificial. <strong>Pague uma única vez. Acesse para sempre.</strong>
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              href="/app" 
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-base shadow-lg shadow-indigo-200 transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              Testar o Aplicativo Grátis <ArrowRight className="w-5 h-5" />
            </Link>
            <a 
              href={LINK_CHECKOUT}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white border-2 border-slate-200 hover:border-indigo-600 text-slate-700 font-extrabold text-base transition-all active:scale-95 flex items-center justify-center"
            >
              Comprar Acesso Vitalício
            </a>
          </div>
          <p className="text-xs font-medium text-slate-400 mt-4">
            Não pedimos cartão de crédito para testar.
          </p>
        </div>
      </section>

      {/* COMPARATIVO (A Dor vs A Solução) */}
      <section className="py-20 bg-white px-4 border-y border-slate-100">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-extrabold text-slate-900 mb-4">
              Por que rasgar dinheiro todo ano?
            </h2>
            <p className="text-slate-500">Veja a diferença entre os cursinhos tradicionais e o Qpro.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Card Concorrência */}
            <div className="bg-rose-50/50 border border-rose-100 p-8 rounded-3xl">
              <h3 className="text-lg font-bold text-rose-900 mb-6 flex items-center gap-2">
                <XCircle className="w-6 h-6 text-rose-500" /> Plataformas Tradicionais
              </h3>
              <ul className="space-y-4">
                {[
                  "Mensalidades que somam R$ 200 a R$ 400 por ano",
                  "Questões desatualizadas e repetidas",
                  "Interface poluída cheia de propagandas",
                  "Comentários dependem de outros alunos",
                  "Se você parar de pagar, perde tudo"
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm font-medium text-slate-700">
                    <span className="text-rose-500 font-bold mt-0.5">✕</span> {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Card Qpro */}
            <div className="bg-indigo-600 p-8 rounded-3xl shadow-xl shadow-indigo-200 transform md:-translate-y-4 relative">
              <div className="absolute top-0 right-6 transform -translate-y-1/2 bg-emerald-400 text-emerald-950 text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full">
                Sua Melhor Escolha
              </div>
              <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                <CheckCircle2 className="w-6 h-6 text-emerald-400" /> Qpro Concursos
              </h3>
              <ul className="space-y-4">
                {[
                  "Acesso Vitalício por R$ 47 (Você paga SÓ UMA VEZ)",
                  "Questões Inéditas geradas por IA na hora",
                  "Modo Leitura / Noturno sem distrações",
                  "Comentários baseados na jurisprudência atual",
                  "Caderno de Erros Automático"
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm font-medium text-indigo-50">
                    <span className="text-emerald-400 font-bold mt-0.5">✓</span> {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* RECURSOS (Benefícios) */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm hover:-translate-y-1 transition-transform">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
                <BrainCircuit className="w-6 h-6" />
              </div>
              <h3 className="text-base font-extrabold text-slate-900 mb-2">Motor de IA</h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                Gere simulados inéditos sob demanda para testar seus conhecimentos em tópicos específicos.
              </p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm hover:-translate-y-1 transition-transform">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center mb-4">
                <Target className="w-6 h-6" />
              </div>
              <h3 className="text-base font-extrabold text-slate-900 mb-2">Caderno de Erros</h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                Errou? A questão vai direto para um caderno especial para você revisar até nunca mais errar.
              </p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm hover:-translate-y-1 transition-transform">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
                <BarChart3 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-extrabold text-slate-900 mb-2">Raio-X Detalhado</h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                Acompanhe seu aproveitamento com gráficos em tempo real e descubra seus pontos fortes e fracos.
              </p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm hover:-translate-y-1 transition-transform">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4">
                <MoonStar className="w-6 h-6" />
              </div>
              <h3 className="text-base font-extrabold text-slate-900 mb-2">Conforto Visual</h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                Estude por horas sem cansar a vista usando o Modo Papel (Kindle) ou o Modo Noturno.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto bg-slate-900 rounded-[2.5rem] p-8 md:p-16 text-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-500 via-slate-900 to-slate-900" />
          
          <h2 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight mb-6 relative z-10">
            A aprovação não precisa custar uma assinatura mensal.
          </h2>
          <p className="text-slate-300 mb-10 max-w-xl mx-auto relative z-10">
            Desbloqueie agora a plataforma completa de questões com Inteligência Artificial por um valor único que cabe no seu bolso.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4 relative z-10">
            <Link 
              href="/app" 
              className="px-8 py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-extrabold text-base transition-all active:scale-95 flex items-center justify-center"
            >
              Quero Testar Gratuitamente
            </Link>
            <a 
              href={LINK_CHECKOUT}
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-extrabold text-base transition-all active:scale-95 flex items-center justify-center"
            >
              Comprar por R$ 47
            </a>
          </div>
        </div>
      </section>

      {/* FOOTER SIMPLES */}
      <footer className="py-8 text-center text-slate-500 text-xs font-medium border-t border-slate-200">
        <p>© {new Date().getFullYear()} Qpro Concursos. Todos os direitos reservados.</p>
        <p className="mt-1 opacity-70">Acesso Vitalício sujeito aos Termos de Uso e Disponibilidade da Plataforma.</p>
      </footer>

    </div>
  );
}