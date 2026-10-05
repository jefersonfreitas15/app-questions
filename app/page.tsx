import Link from 'next/link';
import { ArrowRight, Sparkles, Brain, Target, ShieldCheck, Zap } from 'lucide-react';

export default function PaginaDeVendas() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-indigo-100">
      
      {/* HEADER / NAVBAR */}
      <header className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b border-slate-200/80 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center shadow-md shadow-indigo-200">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-extrabold text-slate-800 tracking-tight">Qpro</span>
          </div>
          <nav className="flex items-center gap-4">
            <Link 
              href="/app" 
              className="text-sm font-bold text-slate-600 hover:text-indigo-600 transition-colors hidden sm:block"
            >
              Já sou aluno
            </Link>
            <Link 
              href="/app" 
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold transition-all shadow-sm shadow-indigo-200 active:scale-95"
            >
              Testar Agora <ArrowRight className="w-4 h-4" />
            </Link>
          </nav>
        </div>
      </header>

      {/* HERO SECTION (A Promessa Principal) */}
      <section className="pt-32 pb-20 px-4 sm:px-6 text-center">
        <div className="max-w-4xl mx-auto flex flex-col items-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-extrabold uppercase tracking-wide mb-6">
            <Sparkles className="w-4 h-4" />
            A Revolução nos Estudos para Concursos
          </div>
          
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15] mb-6">
            Pare de errar na prova o que <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">
              você já estudou em casa.
            </span>
          </h1>
          
          <p className="text-lg sm:text-xl text-slate-600 mb-10 max-w-2xl leading-relaxed">
            O Qpro é a primeira plataforma de questões inteligente que usa <strong>Inteligência Artificial</strong> para mapear os seus pontos fracos e criar cadernos de erros automáticos. 
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
            <Link 
              href="/app" 
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-base font-extrabold transition-all shadow-lg shadow-emerald-200 flex items-center justify-center gap-2 active:scale-95"
            >
              ▶ Testar a Plataforma na Prática
            </Link>
            <span className="text-sm font-semibold text-slate-500">
              Não precisa de cartão de crédito.
            </span>
          </div>
        </div>
      </section>

      {/* SEÇÃO DE BENEFÍCIOS (A quebra de objeções) */}
      <section className="py-20 bg-white border-y border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-extrabold text-slate-900">
              Por que os aprovados estão mudando para o Qpro?
            </h2>
            <p className="text-slate-500 mt-4 text-base">
              Esqueça as plataformas travadas e com mensalidades abusivas.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Benefício 1 */}
            <div className="p-8 rounded-3xl bg-slate-50 border border-slate-100 hover:border-indigo-100 hover:shadow-lg transition-all">
              <div className="w-12 h-12 rounded-2xl bg-indigo-100 flex items-center justify-center mb-6">
                <Brain className="w-6 h-6 text-indigo-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-3">Questões Infinitas com IA</h3>
              <p className="text-slate-600 leading-relaxed text-sm">
                Esgotou as questões da banca? A nossa Inteligência Artificial gera questões inéditas e comentadas na hora para a sua disciplina.
              </p>
            </div>

            {/* Benefício 2 */}
            <div className="p-8 rounded-3xl bg-slate-50 border border-slate-100 hover:border-rose-100 hover:shadow-lg transition-all">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 flex items-center justify-center mb-6">
                <Target className="w-6 h-6 text-rose-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-3">Caderno de Erros 100% Automático</h3>
              <p className="text-slate-600 leading-relaxed text-sm">
                Errou? A questão vai direto para um caderno de revisão inteligente. Nunca mais perca tempo organizando planilhas.
              </p>
            </div>

            {/* Benefício 3 */}
            <div className="p-8 rounded-3xl bg-slate-50 border border-slate-100 hover:border-amber-100 hover:shadow-lg transition-all">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center mb-6">
                <ShieldCheck className="w-6 h-6 text-amber-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-3">Pagamento Único. Sem Mensalidade.</h3>
              <p className="text-slate-600 leading-relaxed text-sm">
                Chega de alugar a sua aprovação. Pague uma única vez R$ 47,00 e tenha o seu acesso vitalício garantido para sempre.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SEÇÃO DA OFERTA IRRECUSÁVEL (Ancoragem de Preço) */}
      <section className="py-24 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto bg-gradient-to-br from-indigo-900 to-slate-900 rounded-[2.5rem] p-8 sm:p-16 text-center shadow-2xl relative overflow-hidden">
          
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <Zap className="w-64 h-64 text-white" />
          </div>

          <div className="relative z-10">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-6">
              Preparado para acelerar a sua aprovação?
            </h2>
            <p className="text-indigo-200 mb-10 text-lg max-w-2xl mx-auto">
              Teste agora mesmo. Faça 5 questões gratuitas para ver como a plataforma funciona. Se gostar, desbloqueie o sistema completo com um valor simbólico.
            </p>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 max-w-md mx-auto border border-white/20 mb-8">
              <p className="text-indigo-200 text-sm font-semibold mb-2">Acesso Vitalício Promocional</p>
              <div className="flex items-end justify-center gap-2">
                <span className="text-5xl font-extrabold text-white">R$ 47</span>
                <span className="text-xl text-indigo-300 font-bold line-through pb-1">R$ 197</span>
              </div>
              <p className="text-emerald-400 text-xs font-bold uppercase mt-2">Pagamento único. Sem renovações surpresa.</p>
            </div>

            <Link 
              href="/app" 
              className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-white hover:bg-slate-100 text-indigo-900 text-base font-extrabold transition-all shadow-xl active:scale-95"
            >
              Quero Testar Gratuitamente Primeiro <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-white border-t border-slate-200 py-12 text-center">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Brain className="w-5 h-5 text-indigo-600" />
            <span className="text-xl font-extrabold text-slate-800">Qpro</span>
          </div>
          <p className="text-sm font-medium text-slate-500">
            © {new Date().getFullYear()} Qpro Concursos. Todos os direitos reservados.
          </p>
        </div>
      </footer>

    </div>
  );
}