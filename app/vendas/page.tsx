"use client";

import {
  CheckCircle2,
  XCircle,
  Zap,
  BrainCircuit,
  BarChart3,
  ShieldCheck,
  Sparkles,
  FileUp,
  BookX,
  Star,
  ChevronDown,
  Lock,
  ArrowRight,
} from "lucide-react";

const LINK_CHECKOUT = "https://pay.kiwify.com.br/VE1GbyL"; // Seu link da Kiwify

function Logo({ claro = false }: { claro?: boolean }) {
  return (
    <a href="#topo" className="flex items-center gap-3" aria-label="Qpro Concursos">
      <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-500/30">
        <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M8 2v3" />
          <path d="M12 2v3" />
          <path d="M16 2v3" />
          <rect x="4" y="4" width="16" height="18" rx="3" className="fill-white/10" />
          <path d="M8 10h8" />
          <path d="M8 14h5" />
          <path d="M8 18h3" />
        </svg>
        <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-[10px] font-extrabold text-white ring-2 ring-slate-950">
          ✓
        </span>
      </div>
      <div className="leading-tight">
        <div className="flex items-center gap-2">
          <span className={`text-xl font-extrabold tracking-tight ${claro ? "text-slate-900" : "text-white"}`}>
            <span className="text-indigo-400">Q</span>pro
          </span>
          <span className="rounded-md border border-indigo-400/40 bg-indigo-500/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-indigo-300">
            Concursos
          </span>
        </div>
        <p className={`text-xs font-medium ${claro ? "text-slate-500" : "text-slate-400"}`}>
          Plataforma Inteligente de Questões
        </p>
      </div>
    </a>
  );
}

function BotaoCompra({ texto, grande = false, className = "" }: { texto: string; grande?: boolean; className?: string }) {
  return (
    <a
      href={LINK_CHECKOUT}
      className={`group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-400 to-emerald-500 font-extrabold text-emerald-950 shadow-xl shadow-emerald-500/30 transition-all hover:-translate-y-0.5 hover:shadow-emerald-400/50 active:scale-95 ${
        grande ? "px-6 py-4 text-base sm:px-8 sm:text-lg" : "px-5 py-2.5 text-sm"
      } ${className}`}
    >
      <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
      <Zap className={grande ? "h-5 w-5 fill-current" : "h-4 w-4 fill-current"} />
      <span className="relative text-center">{texto}</span>
    </a>
  );
}

const FAQ = [
  {
    p: "O acesso é realmente vitalício? Vou pagar alguma mensalidade?",
    r: "Sim, é vitalício. O pagamento de R$ 47,00 é único: sem renovação anual, sem cobrança escondida e sem surpresa no ano seguinte.",
  },
  {
    p: "Como funcionam a garantia e o reembolso de 7 dias?",
    r: "Se o Qpro não atender às suas expectativas, você tem até 7 dias após a compra para pedir o reembolso integral. O pedido é feito direto pela Kiwify, sem burocracia.",
  },
  {
    p: "Como funciona o Gerador de Questões com IA?",
    r: "Você escolhe a disciplina e o assunto, e a IA cria questões inéditas com gabarito comentado. Cada questão usa 1 crédito. O acesso vitalício já vem com 10 créditos, e você pode comprar pacotes extras quando quiser.",
  },
  {
    p: "Como recebo o acesso depois da compra?",
    r: "Assim que o pagamento é aprovado, você recebe um e-mail com o botão de acesso. Um clique e você já entra na plataforma, sem precisar criar senha. Se comprou os Mapas Mentais junto, o link de download chega no mesmo e-mail.",
  },
  {
    p: "Serve para qualquer concurso?",
    r: "Sim. O banco cobre as principais disciplinas de concursos federais, estaduais e municipais (tribunais, carreiras policiais, administrativas e fiscais), com filtros por banca, órgão, ano, disciplina e assunto.",
  },
];

export default function PaginaDeVendas() {
  return (
    <div id="topo" className="min-h-screen bg-slate-950 font-sans text-slate-100 selection:bg-indigo-500/40">
      {/* CABEÇALHO */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <Logo />
          <nav className="hidden items-center gap-7 text-sm font-semibold text-slate-300 md:flex">
            <a href="#recursos" className="transition-colors hover:text-white">Recursos</a>
            <a href="#preco" className="transition-colors hover:text-white">Preço</a>
            <a href="#garantia" className="transition-colors hover:text-white">Garantia</a>
            <a href="#duvidas" className="transition-colors hover:text-white">Dúvidas</a>
          </nav>
          <div className="flex items-center gap-2">
            <a href="/login" className="hidden px-3 py-2 text-sm font-bold text-slate-300 transition-colors hover:text-white sm:inline">
              Entrar
            </a>
            <BotaoCompra texto="Quero o Qpro" className="hidden sm:inline-flex" />
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="relative overflow-hidden px-4 pb-20 pt-16 sm:px-6 md:pb-28 md:pt-24">
        <div className="pointer-events-none absolute inset-0 -z-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:radial-gradient(ellipse_at_top,black_40%,transparent_75%)]" />
        <div className="pointer-events-none absolute -top-40 left-1/2 h-[520px] w-[820px] -translate-x-1/2 rounded-full bg-indigo-600/30 blur-[120px]" />
        <div className="pointer-events-none absolute right-0 top-40 h-72 w-72 rounded-full bg-violet-600/20 blur-[100px]" />

        <div className="relative mx-auto grid max-w-6xl items-center gap-14 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="text-center lg:text-left">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-rose-400/30 bg-rose-500/10 px-3.5 py-1.5 text-xs font-extrabold uppercase tracking-wide text-rose-300">
              <XCircle className="h-4 w-4" />
              O fim das mensalidades e renovações
            </div>

            <h1 className="mb-6 text-4xl font-extrabold leading-[1.08] tracking-tight text-white md:text-5xl lg:text-6xl">
              Estude por questões com{" "}
              <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
                Inteligência Artificial
              </span>{" "}
              e pague uma única vez.
            </h1>

            <p className="mx-auto mb-9 max-w-xl text-lg leading-relaxed text-slate-300 lg:mx-0">
              Gere questões inéditas no estilo da sua banca, descubra seus pontos fracos com o Raio-X de desempenho e revise
              tudo no Caderno de Erros. <strong className="text-white">Acesso vitalício por R$ 47.</strong>
            </p>

            <div className="flex flex-col items-center gap-4 sm:flex-row lg:justify-start sm:justify-center">
              <BotaoCompra texto="Quero meu acesso vitalício" grande className="w-full sm:w-auto" />
              <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-400">
                <Lock className="h-3.5 w-3.5" /> Pagamento 100% seguro via Kiwify
              </span>
            </div>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm font-medium text-slate-400 lg:justify-start">
              <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-emerald-400" /> Sem taxa anual</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-emerald-400" /> Liberação imediata</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-emerald-400" /> Garantia de 7 dias</span>
            </div>
          </div>

          {/* Mockup de questão */}
          <div className="relative mx-auto w-full max-w-md">
            <div className="absolute -inset-4 rounded-[2rem] bg-gradient-to-tr from-indigo-600/40 to-violet-600/30 blur-2xl" />
            <div className="relative rounded-3xl border border-white/10 bg-slate-900/90 p-5 shadow-2xl">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex gap-1.5">
                  <span className="rounded-md bg-indigo-500/15 px-2 py-1 text-[10px] font-bold text-indigo-300">FGV</span>
                  <span className="rounded-md bg-white/5 px-2 py-1 text-[10px] font-bold text-slate-400">Direito Administrativo</span>
                </div>
                <span className="flex items-center gap-1 rounded-md bg-violet-500/15 px-2 py-1 text-[10px] font-bold text-violet-300">
                  <Sparkles className="h-3 w-3" /> Gerada por IA
                </span>
              </div>
              <p className="mb-4 text-sm leading-relaxed text-slate-200">
                Sobre o parecer prévio emitido pelo Tribunal de Contas acerca das contas anuais do chefe do Poder Executivo municipal, é correto afirmar que:
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-slate-400">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/10 text-xs font-bold">A</span>
                  é um meio de controle inerente ao poder hierárquico.
                </div>
                <div className="flex items-center gap-3 rounded-xl border border-emerald-400/50 bg-emerald-500/10 px-3 py-2.5 text-emerald-200">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-xs font-bold text-emerald-950">B</span>
                  é peça técnica opinativa que subsidia o julgamento.
                  <CheckCircle2 className="ml-auto h-4 w-4 shrink-0 text-emerald-400" />
                </div>
                <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-slate-500 line-through">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/10 text-xs font-bold">C</span>
                  vincula a decisão da Câmara Municipal.
                </div>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2 border-t border-white/10 pt-4 text-center">
                <div>
                  <div className="text-lg font-extrabold text-white">128</div>
                  <div className="text-[10px] font-semibold uppercase text-slate-500">Resolvidas</div>
                </div>
                <div>
                  <div className="text-lg font-extrabold text-emerald-400">81%</div>
                  <div className="text-[10px] font-semibold uppercase text-slate-500">Acertos</div>
                </div>
                <div>
                  <div className="text-lg font-extrabold text-rose-400">24</div>
                  <div className="text-[10px] font-semibold uppercase text-slate-500">No caderno</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAIXA DE NÚMEROS */}
      <section className="border-y border-white/10 bg-white/[0.03] px-4 py-8 sm:px-6">
        <div className="mx-auto grid max-w-5xl grid-cols-2 gap-6 text-center md:grid-cols-4">
          {[
            ["+140 mil", "questões no banco"],
            ["30", "disciplinas organizadas"],
            ["1 clique", "para entrar, sem senha"],
            ["R$ 47", "uma única vez"],
          ].map(([n, t]) => (
            <div key={t}>
              <div className="bg-gradient-to-r from-indigo-300 to-violet-300 bg-clip-text text-3xl font-extrabold text-transparent">{n}</div>
              <div className="mt-1 text-xs font-semibold uppercase tracking-wider text-slate-400">{t}</div>
            </div>
          ))}
        </div>
      </section>

      {/* RECURSOS */}
      <section id="recursos" className="scroll-mt-20 px-4 py-20 sm:px-6 md:py-28">
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto mb-14 max-w-2xl text-center">
            <span className="rounded-full border border-indigo-400/30 bg-indigo-500/10 px-3 py-1 text-xs font-extrabold uppercase tracking-widest text-indigo-300">
              Método de alta retenção
            </span>
            <h2 className="mt-5 text-3xl font-extrabold text-white md:text-4xl">
              Da teoria ao seu nome no Diário Oficial
            </h2>
            <p className="mt-4 text-slate-400">
              Chega de PDFs intermináveis que não cabem na sua rotina. O Qpro foca no que aprova: resolver, medir e corrigir.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {[
              {
                n: "01",
                icone: BrainCircuit,
                cor: "from-indigo-500 to-indigo-700",
                titulo: "Questões com IA",
                texto: "Gere baterias inéditas no estilo da sua banca (FGV, Cebraspe, FCC), com gabarito comentado, sempre que precisar treinar um assunto.",
              },
              {
                n: "02",
                icone: BarChart3,
                cor: "from-violet-500 to-violet-700",
                titulo: "Raio-X de desempenho",
                texto: "Pare de estudar no escuro. O painel mostra seus acertos por disciplina e aponta exatamente o que precisa de revisão urgente.",
              },
              {
                n: "03",
                icone: BookX,
                cor: "from-emerald-500 to-emerald-700",
                titulo: "Caderno de Erros automático",
                texto: "Errou? A questão vai sozinha para o seu caderno. Revise os pontos fracos até que o erro não se repita na prova.",
              },
            ].map(({ n, icone: Icone, cor, titulo, texto }) => (
              <div
                key={n}
                className="group relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.06] to-white/[0.02] p-7 transition-all hover:-translate-y-1 hover:border-indigo-400/40"
              >
                <span className="absolute right-5 top-4 text-5xl font-extrabold text-white/5 transition-colors group-hover:text-indigo-400/10">{n}</span>
                <div className={`mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${cor} shadow-lg`}>
                  <Icone className="h-6 w-6 text-white" />
                </div>
                <h3 className="mb-3 text-xl font-extrabold text-white">{titulo}</h3>
                <p className="text-sm leading-relaxed text-slate-400">{texto}</p>
              </div>
            ))}
          </div>

          <div className="mt-5 grid gap-5 md:grid-cols-3">
            {[
              { icone: FileUp, titulo: "Importador de provas em PDF", texto: "Transforme provas antigas em questões interativas." },
              { icone: Star, titulo: "Favoritas e bizus", texto: "Marque as questões-chave para revisar antes da prova." },
              { icone: Sparkles, titulo: "Filtros inteligentes", texto: "Banca, órgão, ano, disciplina e assunto em segundos." },
            ].map(({ icone: Icone, titulo, texto }) => (
              <div key={titulo} className="flex items-start gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                <Icone className="mt-0.5 h-5 w-5 shrink-0 text-indigo-300" />
                <div>
                  <h4 className="font-bold text-white">{titulo}</h4>
                  <p className="mt-1 text-sm text-slate-400">{texto}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PREÇO */}
      <section id="preco" className="relative scroll-mt-20 overflow-hidden bg-white px-4 py-20 text-slate-900 sm:px-6 md:py-28">
        <div className="mx-auto max-w-5xl">
          <div className="mb-14 text-center">
            <h2 className="mb-4 text-3xl font-extrabold md:text-4xl">
              Faça as contas. O modelo tradicional foi feito para você continuar pagando.
            </h2>
            <p className="mx-auto max-w-2xl text-slate-500">
              Veja quanto custaria por ano montar o mesmo nível de preparação com ferramentas separadas:
            </p>
          </div>

          <div className="grid items-center gap-8 md:grid-cols-2">
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-8">
              <h3 className="mb-6 text-sm font-extrabold uppercase tracking-wider text-slate-400">Comprando separado (por ano)</h3>
              <ul className="mb-8 space-y-4">
                {[
                  [XCircle, "Assinatura de site de questões", "R$ 348,00"],
                  [BrainCircuit, "Gerador de questões por IA", "R$ 197,00"],
                  [BarChart3, "Painel de desempenho", "R$ 97,00"],
                ].map(([Icone, nome, valor]: any) => (
                  <li key={nome} className="flex items-center justify-between gap-4 text-slate-600">
                    <span className="flex items-center gap-2">
                      <Icone className="h-5 w-5 shrink-0 text-rose-400" /> {nome}
                    </span>
                    <span className="whitespace-nowrap font-mono text-sm">~ {valor}</span>
                  </li>
                ))}
              </ul>
              <div className="flex items-center justify-between border-t border-slate-200 pt-4">
                <span className="font-bold text-slate-700">Total todo ano:</span>
                <span className="text-xl font-extrabold text-rose-600 line-through">R$ 642,00</span>
              </div>
            </div>

            <div className="relative rounded-3xl bg-gradient-to-br from-indigo-500 via-violet-500 to-fuchsia-500 p-[2px] shadow-2xl shadow-indigo-500/30 md:-translate-y-4">
              <div className="relative rounded-[calc(1.5rem-2px)] bg-slate-950 p-8 text-white">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-gradient-to-r from-emerald-400 to-emerald-500 px-4 py-1 text-xs font-extrabold uppercase tracking-widest text-emerald-950 shadow-lg">
                  Oferta Qpro
                </div>
                <h3 className="mb-6 text-center text-sm font-extrabold uppercase tracking-wider text-indigo-300">Acesso vitalício completo</h3>
                <ul className="mb-8 space-y-4">
                  {[
                    "Banco com +140 mil questões e filtros inteligentes",
                    "Gerador de questões com IA + 10 créditos inclusos",
                    "Raio-X, Caderno de Erros e Favoritas",
                    "Importador de provas em PDF",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-3 font-medium text-slate-200">
                      <CheckCircle2 className="h-6 w-6 shrink-0 text-emerald-400" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <div className="border-t border-white/10 pt-6 text-center">
                  <p className="mb-1 text-sm font-medium text-slate-400">
                    De <span className="line-through">R$ 642/ano</span> por
                  </p>
                  <div className="mb-1 flex items-baseline justify-center gap-1">
                    <span className="text-6xl font-extrabold tracking-tight">R$ 47</span>
                    <span className="text-xl font-bold text-slate-400">,00</span>
                  </div>
                  <p className="mb-6 text-sm font-semibold text-emerald-400">Pagamento único • PIX ou até 6x no cartão</p>
                  <BotaoCompra texto="Desbloquear acesso agora" grande className="w-full" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* GARANTIA */}
      <section id="garantia" className="scroll-mt-20 px-4 py-20 sm:px-6">
        <div className="mx-auto flex max-w-4xl flex-col items-center gap-8 rounded-3xl border border-emerald-400/30 bg-gradient-to-r from-emerald-500/10 to-teal-500/5 p-8 md:flex-row md:p-12">
          <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-xl shadow-emerald-500/30">
            <ShieldCheck className="h-12 w-12 text-white" />
          </div>
          <div className="text-center md:text-left">
            <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-extrabold uppercase tracking-wider text-emerald-300">
              Risco zero para você
            </span>
            <h3 className="mb-3 mt-4 text-2xl font-extrabold text-white md:text-3xl">Garantia incondicional de 7 dias</h3>
            <p className="leading-relaxed text-slate-300">
              Teste o Qpro sem preocupação. Se em até 7 dias você achar que ele não mudou sua forma de estudar, ou se
              arrepender por qualquer motivo, peça o reembolso pela Kiwify ou por e-mail.{" "}
              <strong className="text-white">Devolvemos 100% do seu dinheiro</strong>, sem burocracia e sem perguntas.
            </p>
          </div>
        </div>
      </section>

      {/* DÚVIDAS */}
      <section id="duvidas" className="scroll-mt-20 px-4 pb-20 sm:px-6">
        <div className="mx-auto max-w-3xl">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-extrabold text-white">Dúvidas frequentes</h2>
            <p className="text-slate-400">Tudo o que você precisa saber antes de garantir seu acesso.</p>
          </div>

          <div className="space-y-3">
            {FAQ.map(({ p, r }) => (
              <details key={p} className="group rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition-colors open:border-indigo-400/40 open:bg-indigo-500/[0.06]">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-bold text-white [&::-webkit-details-marker]:hidden">
                  {p}
                  <ChevronDown className="h-5 w-5 shrink-0 text-slate-400 transition-transform group-open:rotate-180" />
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-slate-400">{r}</p>
              </details>
            ))}
          </div>

          {/* CTA FINAL */}
          <div className="relative mt-16 overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600 p-10 text-center shadow-2xl shadow-indigo-500/30">
            <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
            <h3 className="relative mb-4 text-2xl font-extrabold text-white md:text-3xl">
              Pronto para parar de perder tempo com métodos ultrapassados?
            </h3>
            <p className="relative mx-auto mb-8 max-w-xl text-sm text-indigo-100">
              Garanta hoje seu acesso vitalício por apenas R$ 47,00, com garantia incondicional de 7 dias.
            </p>
            <BotaoCompra texto="Garantir meu acesso vitalício" grande className="relative" />
          </div>
        </div>
      </section>

      {/* RODAPÉ */}
      <footer className="border-t border-white/10 px-4 pb-28 pt-10 sm:px-6 sm:pb-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 md:flex-row">
          <Logo />
          <div className="flex items-center gap-6 text-sm text-slate-400">
            <a href="/login" className="flex items-center gap-1 hover:text-white">
              Já comprou? Entrar <ArrowRight className="h-4 w-4" />
            </a>
            <a href="mailto:suporte@qproconcursos.tech" className="hover:text-white">suporte@qproconcursos.tech</a>
          </div>
        </div>
        <p className="mt-6 text-center text-xs text-slate-500">© {new Date().getFullYear()} Qpro Concursos. Todos os direitos reservados.</p>
      </footer>

      {/* BARRA FIXA NO CELULAR */}
      <div className="fixed inset-x-0 bottom-0 z-50 border-t border-white/10 bg-slate-950/95 p-3 backdrop-blur-xl sm:hidden">
        <BotaoCompra texto="Acesso vitalício por R$ 47" className="w-full py-3.5 text-base" />
      </div>
    </div>
  );
}