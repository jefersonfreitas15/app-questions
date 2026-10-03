"use client";

import { CheckCircle2, XCircle, Zap, BrainCircuit, BarChart3, ShieldCheck } from "lucide-react";

export default function PaginaDeVendas() {
  const LINK_CHECKOUT = "https://pay.kiwify.com.br/VE1GbyL"; // O seu link da Kiwify

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-indigo-200">
      
      {/* 1. HERO SECTION (O Topo da Página) */}
      <section className="relative pt-20 pb-16 md:pt-28 md:pb-24 px-4 overflow-hidden">
        {/* Efeito visual de fundo */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-full bg-gradient-to-b from-indigo-100/50 to-transparent -z-10 blur-3xl rounded-full" />
        
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-rose-100 text-rose-700 text-xs font-extrabold tracking-wide uppercase mb-6 shadow-sm">
            <XCircle className="w-4 h-4" />
            O Fim das Mensalidades e Renovações
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.1] mb-6">
            O Único Banco de Questões com <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-500">Inteligência Artificial</span> e Acesso Vitalício.
          </h1>
          
          <p className="text-lg md:text-xl text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed">
            Gere questões inéditas da sua banca, audite o seu desempenho com um Raio-X de precisão cirúrgica e importe PDFs de provas com 1 clique. Tudo isto por um **pagamento único**.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a 
              href={LINK_CHECKOUT}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-lg transition-all active:scale-95 shadow-xl shadow-indigo-200 flex items-center justify-center gap-2"
            >
              <Zap className="w-5 h-5 fill-current" />
              Quero Acesso Vitalício por R$ 47
            </a>
            <p className="text-xs font-semibold text-slate-400 sm:hidden">
              Pagamento 100% seguro via Kiwify
            </p>
          </div>
          
          <div className="mt-8 flex items-center justify-center gap-6 text-sm font-medium text-slate-500">
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Sem taxas anuais</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Atualização automática via IA</span>
          </div>
        </div>
      </section>

      {/* 2. EMPILHAMENTO DE PREÇO (A Ancoragem Irresistível) */}
      <section className="py-16 px-4 bg-white border-y border-slate-200">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-slate-900 mb-4">
              Faça as contas. O sistema tradicional foi desenhado para manter você pagando.
            </h2>
            <p className="text-slate-500 max-w-2xl mx-auto">
              Se você fosse assinar ferramentas separadas para ter o mesmo nível de preparação e análise de dados que o Qpro oferece, veja quanto gastaria todos os anos:
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 items-center">
            
            {/* O "Concorrente" / Preço Solto */}
            <div className="bg-slate-50 p-8 rounded-3xl border border-slate-200">
              <h3 className="text-sm font-extrabold text-slate-400 uppercase tracking-wider mb-6">
                Comprando Separado (Anual)
              </h3>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center justify-between text-slate-600">
                  <span className="flex items-center gap-2">
                    <XCircle className="w-5 h-5 text-rose-400" /> Assinatura de Site de Questões
                  </span>
                  <span className="font-mono text-sm">~ R$ 348,00</span>
                </li>
                <li className="flex items-center justify-between text-slate-600">
                  <span className="flex items-center gap-2">
                    <BrainCircuit className="w-5 h-5 text-rose-400" /> Gerador de Questões Inéditas por IA
                  </span>
                  <span className="font-mono text-sm">~ R$ 197,00</span>
                </li>
                <li className="flex items-center justify-between text-slate-600">
                  <span className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-rose-400" /> Plataforma de Dashboards e Raio-X
                  </span>
                  <span className="font-mono text-sm">~ R$ 97,00</span>
                </li>
              </ul>
              <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
                <span className="font-bold text-slate-700">Custo Total (Todo Ano):</span>
                <span className="text-xl font-extrabold text-rose-600 line-through">R$ 642,00</span>
              </div>
            </div>

            {/* A Oferta Qpro */}
            <div className="bg-gradient-to-b from-indigo-900 to-slate-900 p-8 rounded-3xl border border-indigo-700 shadow-2xl relative transform md:-translate-y-4">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-emerald-400 to-emerald-500 text-emerald-950 px-4 py-1 rounded-full text-xs font-extrabold uppercase tracking-widest shadow-lg">
                A Oferta Qpro
              </div>
              
              <h3 className="text-sm font-extrabold text-indigo-300 uppercase tracking-wider mb-6 text-center">
                Acesso Vitalício Completo
              </h3>
              
              <ul className="space-y-4 mb-8">
                <li className="flex items-start gap-3 text-indigo-100 font-medium">
                  <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
                  <span>Banco de Questões turbinado com IA (Gemini 3.8)</span>
                </li>
                <li className="flex items-start gap-3 text-indigo-100 font-medium">
                  <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
                  <span>Painel do Aluno: Raio-X, Caderno de Erros e Favoritas</span>
                </li>
                <li className="flex items-start gap-3 text-indigo-100 font-medium">
                  <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
                  <span>Importador de Provas PDF (Extração automática)</span>
                </li>
              </ul>
              
              <div className="pt-6 border-t border-indigo-800/50 text-center">
                <p className="text-indigo-200 text-sm font-medium mb-2">Pagamento Único. Sem renovações.</p>
                <div className="flex items-baseline justify-center gap-2 mb-6">
                  <span className="text-5xl font-extrabold text-white">R$ 47</span>
                  <span className="text-indigo-300 font-bold">,00</span>
                </div>
                <a 
                  href={LINK_CHECKOUT}
                  className="block w-full py-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-extrabold text-lg transition-all active:scale-95 shadow-lg shadow-emerald-500/30"
                >
                  Desbloquear Acesso Agora
                </a>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 3. OS 3 PILARES DO MÉTODO */}
      <section className="py-20 px-4 bg-slate-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-indigo-600 font-extrabold text-xs uppercase tracking-widest bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
              Método Comprovado
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mt-4 mb-4">
              Como o Qpro transforma teoria em nome no Diário Oficial
            </h2>
            <p className="text-slate-600">
              Esqueça PDFs intermináveis que não cabem na sua rotina. O nosso ecossistema baseia-se em ciclos de alta retenção.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-extrabold text-xl mb-6 shadow-inner">
                01
              </div>
              <h3 className="text-xl font-extrabold text-slate-900 mb-3">
                Ataque por Questões & IA
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Estudar por questões é o atalho da aprovação. Use a inteligência artificial para gerar baterias inéditas focadas estritamente no perfil da sua banca (FGV, Cebraspe, FCC).
              </p>
            </div>

            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-2xl bg-violet-50 text-violet-600 flex items-center justify-center font-extrabold text-xl mb-6 shadow-inner">
                02
              </div>
              <h3 className="text-xl font-extrabold text-slate-900 mb-3">
                Raio-X de Desempenho
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Chega de estudar no escuro. O painel inteligente audita as suas métricas e indica exatamente quais as disciplinas e assuntos que precisam de revisão urgente.
              </p>
            </div>

            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-extrabold text-xl mb-6 shadow-inner">
                03
              </div>
              <h3 className="text-xl font-extrabold text-slate-900 mb-3">
                Caderno de Erros Automático
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Errou uma questão? O sistema isola-a automaticamente. Reveja os seus pontos fracos de forma cirúrgica até que o erro seja impossível de repetir na prova.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* 4. SEÇÃO DE GARANTIA BLINDADA (Reembolso Explicito) */}
      <section className="py-16 px-4 bg-white border-t border-slate-200">
        <div className="max-w-4xl mx-auto bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-3xl p-8 md:p-12 flex flex-col md:flex-row items-center gap-8 shadow-sm">
          <div className="w-20 h-20 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-lg shadow-emerald-200">
            <ShieldCheck className="w-10 h-10" />
          </div>
          <div>
            <span className="text-emerald-700 font-extrabold text-xs uppercase tracking-wider bg-emerald-100 px-3 py-1 rounded-full">
              Risco Zero para si
            </span>
            <h3 className="text-2xl md:text-3xl font-extrabold text-slate-900 mt-3 mb-3">
              Garantia Incondicional de 7 Dias
            </h3>
            <p className="text-slate-600 text-sm md:text-base leading-relaxed">
              Queremos que teste o Qpro sem qualquer preocupação. Se dentro de 7 dias você achar que a plataforma não revolucionou a sua forma de estudar ou se arrepender por qualquer motivo, basta enviar um único e-mail ou solicitar o reembolso diretamente na Kiwify. Devolveremos **100% do seu dinheiro** de forma imediata, sem burocracia nem perguntas.
            </p>
          </div>
        </div>
      </section>

      {/* 5. SEÇÃO DE PERGUNTAS FREQUENTES (FAQ) */}
      <section className="py-20 px-4 bg-slate-50 border-t border-slate-200">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-extrabold text-slate-900 mb-4">
              Dúvidas Frequentes
            </h2>
            <p className="text-slate-600">
              Tudo o que você precisa saber antes de garantir o seu acesso vitalício.
            </p>
          </div>

          <div className="space-y-6">
            
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h4 className="font-extrabold text-slate-900 mb-2">O acesso é realmente vitalício? Vou pagar alguma mensalidade futura?</h4>
              <p className="text-slate-600 text-sm leading-relaxed">
                Sim! O pagamento de R$ 47,00 é único. Você terá acesso perpétuo à plataforma, sem renovações anuais, sem cobranças escondidas e sem surpresas quando mudar de ano.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h4 className="font-extrabold text-slate-900 mb-2">Como funcionam o reembolso e a garantia de 7 dias?</h4>
              <p className="text-slate-600 text-sm leading-relaxed">
                Caso o Qpro não atenda às suas expectativas, você tem até 7 dias após a compra para pedir o reembolso integral do valor investido. O processo é totalmente automatizado através da Kiwify.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h4 className="font-extrabold text-slate-900 mb-2">Como recebo os Mapas Mentais que escolhi adicionar?</h4>
              <p className="text-slate-600 text-sm leading-relaxed">
                Assim que concluir a compra com o *order bump* ativado, a Kiwify envia automaticamente os dados de acesso ao Qpro e o link de descarregamento do Pack de Mapas Mentais diretamente para o seu e-mail cadastrado.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h4 className="font-extrabold text-slate-900 mb-2">A plataforma funciona para qualquer concurso público?</h4>
              <p className="text-slate-600 text-sm leading-relaxed">
                Sim. O nosso banco cobre as principais disciplinas cobradas em concursos federais, estaduais e municipais (Tribunais, Carreiras Policiais, Administrativas e Fiscais), além de permitir que importe os seus próprios PDFs de provas.
              </p>
            </div>

          </div>

          {/* CTA Final da Página */}
          <div className="mt-16 text-center bg-gradient-to-br from-indigo-900 to-slate-900 p-10 rounded-3xl text-white shadow-xl">
            <h3 className="text-2xl md:text-3xl font-extrabold mb-4">
              Pronto para parar de perder tempo com métodos ultrapassados?
            </h3>
            <p className="text-indigo-200 mb-8 max-w-xl mx-auto text-sm">
              Garanta o seu acesso vitalício hoje por apenas R$ 47,00 com garantia incondicional de 7 dias.
            </p>
            <a 
              href={LINK_CHECKOUT}
              className="inline-block px-8 py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-extrabold text-lg transition-all active:scale-95 shadow-lg shadow-emerald-500/20"
            >
              Garantir Meu Acesso Vitalício Agora
            </a>
          </div>

        </div>
      </section>

    </div>
  );
}