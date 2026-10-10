"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Upload, Loader2 } from 'lucide-react';

// ==========================================
// 0. HOOK GLOBAL DE TEMA (SINCRONIZA TODAS AS CORES)
// ==========================================
export function useTema() {
  const [tema, setTema] = useState({ fundo: '', cartao: '', fonte: '' });

  useEffect(() => {
    const lerTema = () => {
      try {
        const salvo = localStorage.getItem("simulado_tema_cores");
        if (salvo) {
          setTema(JSON.parse(salvo));
        }
      } catch (e) {}
    };

    lerTema(); // Lê quando o componente nasce
    window.addEventListener('qpro-tema-alterado', lerTema); // Escuta as mudanças no painel de cores
    return () => window.removeEventListener('qpro-tema-alterado', lerTema);
  }, []);

  return tema;
}

// ==========================================
// CONFIGURAÇÕES COMERCIAIS (VENDA & ATIVAÇÃO)
// ==========================================
const LINK_CHECKOUT_PAGAMENTO = "https://pay.kiwify.com.br/VE1GbyL";
const LINK_COMPRAR_CREDITOS_IA = "https://kiwify.app/D7QD8Qc"; // Atualize depois
const LIMITE_QUESTOES_GRATIS = 5;
const CODIGOS_ATIVACAO_VITALICIO = ["QPRO47", "VITALICIO", "QPRO2026", "APROVADO"];

// ==========================================
// FUNÇÕES DE PADRONIZAÇÃO E LIMPEZA DE TEXTO
// ==========================================
function normalizarDisciplina(nome: string): string {
  if (!nome) return 'Geral';
  return String(nome)
    .replace(/^(Básicos|Específicos)\s*-\s*/i, '')
    .replace(/\s*\(AFO\)$/i, '')
    .replace(/\s*\(CASP\)$/i, '')
    .replace(/\s*e de Folha( de Pagamento)?$/i, '')
    .replace(/\s*e Tribunais de Contas$/i, '')
    .replace(/\s*\(Lei 14\.133\/2021\)$/i, '')
    .trim();
}

function limparMathML(texto: string): string {
  if (!texto) return '';
  return String(texto)
    .replace(/<mfrac>\s*<mn>(.*?)<\/mn>\s*<mfenced>\s*<mrow>(.*?)<\/mrow>\s*<\/mfenced>\s*<\/mfrac>/gi, '$1 / ($2)')
    .replace(/<mfrac>(.*?)<\/mfrac>/gi, '$1')
    .replace(/<msup>\s*<mi>(.*?)<\/mi>\s*<mn>(.*?)<\/mn>\s*<\/msup>/gi, '$1^$2')
    .replace(/<[^>]+>/g, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

function limparTextoEnunciado(textoBruto: string): string {
  if (!textoBruto) return '';

  let limpo = limparMathML(textoBruto)
    .replace(/Disponível em:[\s\S]*?Acesso em:[^.)]+(?:\(adaptado\))?\.?\s*/gi, '')
    .replace(/Disponível em:\s*\S+\.?\s*/gi, '')
    .replace(/Acesso em:\s*\d+\s*[a-zç]{3,}\.?\s*\d{4}\.?\s*/gi, '')
    .replace(/\(adaptado\)\.?\s*/gi, '')
    .replace(/Fonte:\s*[^.]+\.\s*/gi, '')
    .replace(/^\[[^\]]+\]\s*/g, '')
    .replace(/\s*\([^)]*#\d+[^)]*\)/gi, '')
    .replace(
      /\s*(?:referente ao|no âmbito do|na análise do|no bojo do)?\s*(?:processo|procedimento|expediente|relatório|balanço|caso|período|auditoria|análise|contratação(?: direta)?|despacho administrativo)\s*(?:administrativo|de fiscalização|técnico|funcional)?\s*(?:nº|#|lote\s*#)\s*[\w/-]+/gi,
      ''
    )
    .replace(/\s*(?:associada ao|do|durante a)\s*(?:lote(?: de auditoria)?|análise|relatório|expediente)\s*#\d+(?:\/\d+)?/gi, '')
    .replace(/\s*#[\w/-]+/g, '')
    .replace(/\s+,/g, ',')
    .replace(/\s+:/g, ':')
    .replace(/\s{2,}/g, ' ')
    .trim();

  if (limpo.length > 0) {
    limpo = limpo.charAt(0).toUpperCase() + limpo.slice(1);
  }

  return limpo;
}

function usuarioTemAcessoTotal(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return localStorage.getItem('qpro_vitalicio_ativo') === 'true';
  } catch {
    return false;
  }
}

function obterTotalResolvidasLocal(): number {
  if (typeof window === 'undefined') return 0;
  try {
    const usadasBlindadas = Number(localStorage.getItem('qpro_degustacao_usadas') || '0');
    const salvo = localStorage.getItem('historico_simulado');
    const lista = salvo ? JSON.parse(salvo) : [];
    const totalHistorico = Array.isArray(lista) ? lista.length : 0;
    return Math.max(usadasBlindadas, totalHistorico);
  } catch {
    return 0;
  }
}

async function gravarListaDeQuestoesNoBanco(lista: any[]) {
  for (const q of lista) {
    const bancaFormatada =
      q.banca && String(q.banca).trim() !== ''
        ? String(q.banca).trim().toUpperCase()
        : '';
    const orgaoFormatado =
      q.orgao && String(q.orgao).trim() !== ''
        ? String(q.orgao).trim().toUpperCase()
        : '';
    const anoFormatado = q.ano && Number(q.ano) > 0 ? Number(q.ano) : 0;

    const { data: novaQ, error: errQ } = await supabase
      .from('questoes')
      .insert([
        {
          banca: bancaFormatada,
          orgao: orgaoFormatado,
          ano: anoFormatado,
          disciplina: normalizarDisciplina(String(q.disciplina || 'Geral')),
          assunto: String(q.assunto || 'Geral').trim(),
          enunciado: limparTextoEnunciado(String(q.enunciado || '')),
          explicacao: String(q.explicacao || '').trim(),
        },
      ])
      .select('id')
      .single();

    if (errQ || !novaQ) {
      throw new Error(errQ?.message || 'Erro ao inserir questão.');
    }

    const payloadAlts = (q.alternativas || []).map((a: any) => ({
      questao_id: novaQ.id,
      texto: limparMathML(String(a.texto || '')),
      is_correta: Boolean(a.is_correta || a.is_correct),
    }));

    const { error: errAlts } = await supabase
      .from('alternativas')
      .insert(payloadAlts);

    if (errAlts) {
      throw new Error(errAlts.message);
    }
  }
}

export function PainelDesempenho({
  initialRespostas = [],
  questions = [],
}: {
  initialRespostas?: any[];
  questions?: any[];
}) {
  const tema = useTema(); // Sincroniza o painel
  const [respostas, setRespostas] = useState<any[]>(initialRespostas);
  const [mostrarPorDisciplina, setMostrarPorDisciplina] = useState(false);

  const carregarHistorico = () => {
    try {
      const salvoLocal = localStorage.getItem('historico_simulado');
      const listaLocal = salvoLocal ? JSON.parse(salvoLocal) : [];
      if (listaLocal.length >= initialRespostas.length) {
        setRespostas(listaLocal);
      }
    } catch (e) {
      console.log('Aviso ao ler histórico local:', e);
    }
  };

  useEffect(() => {
    carregarHistorico();
    window.addEventListener('atualizar-placar', carregarHistorico);
    return () => window.removeEventListener('atualizar-placar', carregarHistorico);
  }, []);

  const zerarPlacar = async () => {
    if (!confirm('Deseja realmente zerar todo o seu histórico de desempenho?')) return;
    localStorage.removeItem('historico_simulado');
    localStorage.removeItem('questoes_erros_cache');
    setRespostas([]);
    window.dispatchEvent(new Event('atualizar-placar'));
    window.dispatchEvent(new Event('atualizar-listas-estudo'));
    try {
      await supabase.from('respostas_usuario').delete().neq('id', 0);
    } catch (e) {}
  };

  const totalRespondidas = respostas.length;
  const totalAcertos = respostas.filter((r) => r.acertou).length;
  const totalErros = totalRespondidas - totalAcertos;
  const taxaAcerto =
    totalRespondidas > 0 ? Math.round((totalAcertos / totalRespondidas) * 100) : 0;

  const mapaDisciplinas = React.useMemo(() => {
    const mapa: Record<string, string> = {};
    questions.forEach((q) => {
      if (q && q.id !== undefined) {
        mapa[String(q.id)] = normalizarDisciplina(q.disciplina || 'Geral');
      }
    });
    return mapa;
  }, [questions]);

  const estatisticasPorDisciplina = React.useMemo(() => {
    const stats: Record<string, { total: number; acertos: number; erros: number }> = {};

    respostas.forEach((r) => {
      const nomeBruto =
        r.disciplina || mapaDisciplinas[String(r.questao_id)] || 'Outras / Geral';
      const nomeDisciplina = normalizarDisciplina(nomeBruto);

      if (!stats[nomeDisciplina]) {
        stats[nomeDisciplina] = { total: 0, acertos: 0, erros: 0 };
      }
      stats[nomeDisciplina].total += 1;
      if (r.acertou) {
        stats[nomeDisciplina].acertos += 1;
      } else {
        stats[nomeDisciplina].erros += 1;
      }
    });

    return Object.entries(stats)
      .map(([disciplina, dados]) => ({
        disciplina,
        ...dados,
        percentual: dados.total > 0 ? Math.round((dados.acertos / dados.total) * 100) : 0,
      }))
      .sort((a, b) => b.total - a.total);
  }, [respostas, mapaDisciplinas]);

  return (
    <div className="mb-6">
      <div className="flex flex-wrap justify-between items-center gap-2 mb-2.5">
        <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: tema.fonte || '#64748b', opacity: 0.8 }}>
          📊 Seu progresso acumulado
        </span>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setMostrarPorDisciplina(!mostrarPorDisciplina)}
            className={`text-xs font-semibold px-3 py-1.5 rounded-xl border transition-all flex items-center gap-1.5 ${
              mostrarPorDisciplina
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs shadow-indigo-200'
                : 'border-current hover:opacity-70'
            }`}
            style={!mostrarPorDisciplina ? { color: tema.fonte || 'inherit', opacity: 0.9 } : undefined}
          >
            <span>📈</span>
            <span>
              {mostrarPorDisciplina ? 'Ocultar por Disciplina' : 'Desempenho por Disciplina'}
            </span>
          </button>

          {totalRespondidas > 0 && (
            <button
              type="button"
              onClick={zerarPlacar}
              className="text-xs font-medium hover:text-rose-500 transition-colors"
              style={{ color: tema.fonte || 'inherit', opacity: 0.6 }}
            >
              Reiniciar estatísticas
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-4">
        <div 
          className="border border-slate-200/50 rounded-2xl p-4 shadow-xs transition-all hover:-translate-y-0.5"
          style={{ backgroundColor: tema.cartao || '#FFFFFF', color: tema.fonte || 'inherit' }}
        >
          <span className="text-[11px] font-bold text-indigo-500 uppercase tracking-wide">
            Resolvidas
          </span>
          <p className="text-2xl font-extrabold mt-1" style={{ color: 'inherit' }}>
            {totalRespondidas}
          </p>
        </div>

        <div 
          className="border border-emerald-200/50 rounded-2xl p-4 shadow-xs transition-all hover:-translate-y-0.5"
          style={{ backgroundColor: tema.cartao || '#FFFFFF', color: tema.fonte || 'inherit' }}
        >
          <span className="text-[11px] font-bold text-emerald-500 uppercase tracking-wide">
            Acertos
          </span>
          <p className="text-2xl font-extrabold text-emerald-500 mt-1">
            {totalAcertos}
          </p>
        </div>

        <div 
          className="border border-rose-200/50 rounded-2xl p-4 shadow-xs transition-all hover:-translate-y-0.5"
          style={{ backgroundColor: tema.cartao || '#FFFFFF', color: tema.fonte || 'inherit' }}
        >
          <span className="text-[11px] font-bold text-rose-500 uppercase tracking-wide">
            Erros
          </span>
          <p className="text-2xl font-extrabold text-rose-500 mt-1">
            {totalErros}
          </p>
        </div>

        <div 
          className="border border-slate-200/50 rounded-2xl p-4 shadow-xs transition-all hover:-translate-y-0.5 flex flex-col justify-between"
          style={{ backgroundColor: tema.cartao || '#FFFFFF', color: tema.fonte || 'inherit' }}
        >
          <div>
            <span className="text-[11px] font-bold text-violet-500 uppercase tracking-wide">
              Aproveitamento
            </span>
            <p className="text-2xl font-extrabold mt-1" style={{ color: 'inherit' }}>
              {taxaAcerto}%
            </p>
          </div>
          <div className="w-full h-1.5 rounded-full overflow-hidden mt-2" style={{ backgroundColor: tema.fundo || '#F1F5F9' }}>
            <div
              className="bg-gradient-to-r from-indigo-500 to-emerald-400 h-full rounded-full transition-all duration-700 ease-out"
              style={{ width: `${taxaAcerto}%` }}
            />
          </div>
        </div>
      </div>

      {mostrarPorDisciplina && (
        <div 
          className="mt-4 border border-slate-200/50 rounded-2xl p-5 shadow-xs transition-all"
          style={{ backgroundColor: tema.cartao || '#FFFFFF', color: tema.fonte || 'inherit' }}
        >
          <div className="flex items-center justify-between border-b border-slate-100/20 pb-3 mb-4">
            <div>
              <h3 className="text-sm font-bold flex items-center gap-2" style={{ color: 'inherit' }}>
                📚 Raio-X por Disciplina
              </h3>
              <p className="text-xs mt-0.5" style={{ color: 'inherit', opacity: 0.7 }}>
                Acompanhe seus pontos fortes e as matérias que precisam de revisão
              </p>
            </div>
            <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full">
              {estatisticasPorDisciplina.length}{' '}
              {estatisticasPorDisciplina.length === 1 ? 'matéria' : 'matérias'}
            </span>
          </div>

          {estatisticasPorDisciplina.length === 0 ? (
            <div className="text-center py-6 text-sm" style={{ color: 'inherit', opacity: 0.6 }}>
              Nenhuma questão respondida ainda. Resolva sua primeira questão abaixo para gerar o gráfico por disciplina!
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {estatisticasPorDisciplina.map((item) => {
                const corBarra =
                  item.percentual >= 70
                    ? 'bg-emerald-500'
                    : item.percentual >= 50
                    ? 'bg-amber-500'
                    : 'bg-rose-500';

                const corBadge =
                  item.percentual >= 70
                    ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
                    : item.percentual >= 50
                    ? 'text-amber-700 bg-amber-50 border-amber-200'
                    : 'text-rose-700 bg-rose-50 border-rose-200';

                return (
                  <div
                    key={item.disciplina}
                    className="p-3.5 rounded-xl border border-slate-200/30 flex flex-col justify-between gap-2"
                    style={{ backgroundColor: tema.fundo || '#F8FAFC' }} // Destaca do cartão
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs sm:text-sm font-bold truncate" style={{ color: 'inherit' }}>
                        {item.disciplina}
                      </span>
                      <span
                        className={`text-xs font-extrabold px-2 py-0.5 rounded-full border shrink-0 ${corBadge}`}
                      >
                        {item.percentual}%
                      </span>
                    </div>

                    <div className="w-full bg-slate-200/50 h-2 rounded-full overflow-hidden">
                      <div
                        className={`${corBarra} h-full rounded-full transition-all duration-500`}
                        style={{ width: `${item.percentual}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[11px] font-medium pt-0.5" style={{ color: 'inherit', opacity: 0.8 }}>
                      <span>
                        Total: <strong style={{ color: 'inherit', opacity: 1 }}>{item.total}</strong>
                      </span>
                      <div className="flex items-center gap-3">
                        <span className="text-emerald-500 font-semibold">
                          ✓ {item.acertos} {item.acertos === 1 ? 'acerto' : 'acertos'}
                        </span>
                        <span className="text-rose-500 font-semibold">
                          ✕ {item.erros} {item.erros === 1 ? 'erro' : 'erros'}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function QuestionCard({
  question,
  numeroAtual,
  totalQuestoes,
}: {
  question: any;
  numeroAtual?: number;
  totalQuestoes?: number;
}) {
  const tema = useTema(); // Hook do tema
  const [selectedId, setSelectedId] = useState<string | number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [showComment, setShowComment] = useState(false);
  const [entered, setEntered] = useState(false);

  const [eliminadas, setEliminadas] = useState<Record<string, boolean>>({});
  const [isFavorita, setIsFavorita] = useState(false);

  const [showNotes, setShowNotes] = useState(false);
  const [anotacaoTexto, setAnotacaoTexto] = useState('');
  const [anotacaoSalvaFeedback, setAnotacaoSalvaFeedback] = useState(false);

  useEffect(() => {
    setEntered(false);
    setSelectedId(null);
    setIsAnswered(false);
    setShowComment(false);
    setEliminadas({});

    if (question?.id !== undefined) {
      const qId = String(question.id);

      try {
        const favRaw = localStorage.getItem('questoes_favoritas_ids');
        const favIds: string[] = favRaw ? JSON.parse(favRaw) : [];
        setIsFavorita(favIds.includes(qId));
      } catch (e) {}

      try {
        const notasRaw = localStorage.getItem('anotacoes_questoes');
        const mapaNotas: Record<string, string> = notasRaw ? JSON.parse(notasRaw) : {};
        setAnotacaoTexto(mapaNotas[qId] || '');
      } catch (e) {}
    }

    const timer = setTimeout(() => setEntered(true), 20);
    return () => clearTimeout(timer);
  }, [question?.id]);

  if (!question) {
    return (
      <div 
        className="border border-slate-200/50 rounded-2xl p-10 text-center shadow-xs"
        style={{ backgroundColor: tema.cartao || '#FFFFFF', color: tema.fonte || 'inherit' }}
      >
        <span style={{ opacity: 0.6 }}>⏳ Carregando questão...</span>
      </div>
    );
  }

  const alternativas =
    question.alternativas && question.alternativas.length > 0
      ? question.alternativas
      : [
          { id: '1', letra: 'A', texto: '50%', is_correta: false },
          { id: '2', letra: 'B', texto: '54%', is_correta: true },
          { id: '3', letra: 'C', texto: '60%', is_correta: false },
        ];

  const letras = ['A', 'B', 'C', 'D', 'E'];

  const mostrarBanca =
    Boolean(question.banca) &&
    String(question.banca).trim() !== '' &&
    String(question.banca).toUpperCase() !== 'INÉDITA';
  const mostrarAno = Boolean(question.ano) && Number(question.ano) > 0;
  const mostrarOrgao = Boolean(question.orgao) && String(question.orgao).trim() !== '';
  const disciplinaExibida = normalizarDisciplina(question.disciplina);
  const enunciadoExibido = limparTextoEnunciado(question.enunciado);

  const toggleEliminarAlternativa = (e: React.MouseEvent, altKey: string, altId: any) => {
    e.stopPropagation();
    if (isAnswered) return;

    setEliminadas((prev) => {
      const novoEstado = !prev[altKey];
      if (novoEstado && selectedId === altId) {
        setSelectedId(null);
      }
      return { ...prev, [altKey]: novoEstado };
    });
  };

  const toggleFavorita = () => {
    const qId = String(question.id);
    try {
      const favIdsRaw = localStorage.getItem('questoes_favoritas_ids');
      let favIds: string[] = favIdsRaw ? JSON.parse(favIdsRaw) : [];

      const favCacheRaw = localStorage.getItem('questoes_favoritas_cache');
      let favCache: Record<string, any> = favCacheRaw ? JSON.parse(favCacheRaw) : {};

      if (favIds.includes(qId)) {
        favIds = favIds.filter((id) => id !== qId);
        delete favCache[qId];
        setIsFavorita(false);
      } else {
        favIds.push(qId);
        favCache[qId] = question;
        setIsFavorita(true);
      }

      localStorage.setItem('questoes_favoritas_ids', JSON.stringify(favIds));
      localStorage.setItem('questoes_favoritas_cache', JSON.stringify(favCache));
      window.dispatchEvent(new Event('atualizar-listas-estudo'));
    } catch (e) {}
  };

  const handleMudarAnotacao = (novoTexto: string) => {
    setAnotacaoTexto(novoTexto);
    const qId = String(question.id);
    try {
      const notasRaw = localStorage.getItem('anotacoes_questoes');
      const mapaNotas: Record<string, string> = notasRaw ? JSON.parse(notasRaw) : {};

      if (novoTexto.trim() === '') {
        delete mapaNotas[qId];
      } else {
        mapaNotas[qId] = novoTexto;
      }

      localStorage.setItem('anotacoes_questoes', JSON.stringify(mapaNotas));
      setAnotacaoSalvaFeedback(true);
      setTimeout(() => setAnotacaoSalvaFeedback(false), 1500);
    } catch (e) {}
  };

  const handleResponder = async () => {
    if (selectedId === null || isAnswered) return;

    const usadasAntes = obterTotalResolvidasLocal();
    if (!usuarioTemAcessoTotal() && usadasAntes >= LIMITE_QUESTOES_GRATIS) {
      window.dispatchEvent(new Event('abrir-modal-vitalicio'));
      return;
    }

    setIsAnswered(true);
    setShowComment(true);

    const altSelecionada = alternativas.find((a: any) => a.id === selectedId);
    const acertou = Boolean(altSelecionada?.is_correta || altSelecionada?.correta);
    const qId = String(question.id);

    const novaResposta = {
      questao_id: qId,
      disciplina: disciplinaExibida,
      alternativa_id: String(selectedId),
      acertou: acertou,
      data: new Date().toISOString(),
    };

    try {
      const salvoLocal = localStorage.getItem('historico_simulado');
      const listaAtual = salvoLocal ? JSON.parse(salvoLocal) : [];
      listaAtual.push(novaResposta);
      localStorage.setItem('historico_simulado', JSON.stringify(listaAtual));

      localStorage.setItem('qpro_degustacao_usadas', String(usadasAntes + 1));

      const errosCacheRaw = localStorage.getItem('questoes_erros_cache');
      const errosCache: Record<string, any> = errosCacheRaw ? JSON.parse(errosCacheRaw) : {};
      if (!acertou) {
        errosCache[qId] = question;
      } else {
        delete errosCache[qId];
      }
      localStorage.setItem('questoes_erros_cache', JSON.stringify(errosCache));

      window.dispatchEvent(new Event('atualizar-placar'));
      window.dispatchEvent(new Event('atualizar-listas-estudo'));
    } catch (e) {}

    try {
      await supabase.from('respostas_usuario').insert([
        {
          questao_id: qId,
          alternativa_id: String(selectedId),
          acertou: acertou,
        },
      ]);
    } catch (e) {}
  };

  const handleRefazer = () => {
    setSelectedId(null);
    setIsAnswered(false);
    setShowComment(false);
    setEliminadas({});
  };

  const altEscolhida = alternativas.find((a: any) => a.id === selectedId);
  const acertouQuestao = Boolean(altEscolhida?.is_correta || altEscolhida?.correta);
  const temAnotacao = anotacaoTexto.trim().length > 0;

  return (
    <div
      className={`border border-slate-200/50 rounded-2xl p-5 sm:p-8 shadow-xs transition-all duration-300 ease-out ${
        entered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
      }`}
      style={{ backgroundColor: tema.cartao || '#FFFFFF', color: tema.fonte || 'inherit' }}
    >
      <div className="flex flex-wrap items-center justify-between gap-2 mb-6">
        <div className="flex flex-wrap gap-2">
          {numeroAtual && (
            <span className="bg-indigo-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-xs shadow-indigo-200">
              Questão {numeroAtual.toLocaleString('pt-BR')}
            </span>
          )}
          {mostrarBanca && (
            <span className="bg-indigo-50/10 border border-indigo-200/60 text-indigo-500 px-3 py-1 rounded-full text-xs font-semibold">
              {question.banca}
            </span>
          )}
          {mostrarAno && (
            <span className="bg-sky-50/10 border border-sky-200/60 text-sky-500 px-3 py-1 rounded-full text-xs font-semibold">
              {question.ano}
            </span>
          )}
          {disciplinaExibida && (
            <span className="bg-violet-50/10 border border-violet-200/60 text-violet-500 px-3 py-1 rounded-full text-xs font-semibold">
              {disciplinaExibida}
            </span>
          )}
          {mostrarOrgao && (
            <span className="bg-amber-50/10 border border-amber-200/60 text-amber-500 px-3 py-1 rounded-full text-xs font-semibold">
              {question.orgao}
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={toggleFavorita}
          title={isFavorita ? 'Remover das Favoritas' : 'Guardar nas Favoritas para revisão'}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border transition-all active:scale-95 ${
            isFavorita
              ? 'bg-amber-500/20 border-amber-400 text-amber-500 shadow-2xs'
              : 'border-current opacity-60 hover:opacity-100 hover:border-amber-400 hover:text-amber-500'
          }`}
          style={!isFavorita ? { backgroundColor: 'transparent', color: 'inherit' } : undefined}
        >
          <span>{isFavorita ? '⭐' : '☆'}</span>
          <span>{isFavorita ? 'Favorita' : 'Favoritar'}</span>
        </button>
      </div>

      <h2 className="text-base sm:text-lg mb-7 leading-relaxed font-medium text-justify" style={{ color: 'inherit' }}>
        {enunciadoExibido}
      </h2>

      <div className="flex flex-col gap-3 mb-6">
        {alternativas.map((alt: any, index: number) => {
          const altKey = String(alt.id ?? index);
          const isEliminada = Boolean(eliminadas[altKey]) && !isAnswered;
          const isSelected = selectedId === alt.id;
          const isCorrect = Boolean(alt.is_correta || alt.correta);
          const letra = alt.letra || letras[index] || String(index + 1);
          const textoAlternativa = limparMathML(alt.texto || alt.enunciado || alt.descricao || '');

          let containerClasses =
            'border-slate-200/50 hover:border-indigo-400 hover:-translate-y-0.5 hover:shadow-sm';
          let badgeClasses = 'bg-slate-100 text-slate-600 border-slate-200';
          let textColorStyle = (!isAnswered && !isSelected && !isEliminada) ? { color: 'inherit' } : undefined;

          if (isEliminada) {
            containerClasses = 'border-slate-200/20 opacity-50';
            badgeClasses = 'bg-slate-200/30 border-slate-300 line-through';
          } else if (!isAnswered && isSelected) {
            containerClasses =
              'border-indigo-500 bg-indigo-50/10 text-indigo-500 ring-2 ring-indigo-500/20 shadow-xs -translate-y-0.5';
            badgeClasses = 'bg-indigo-600 text-white border-indigo-600 scale-105';
            textColorStyle = undefined;
          } else if (isAnswered) {
            if (isCorrect) {
              containerClasses =
                'border-emerald-400 bg-emerald-50/10 text-emerald-600 font-medium shadow-xs';
              badgeClasses = 'bg-emerald-500 text-white border-emerald-500 scale-105';
              textColorStyle = undefined;
            } else if (isSelected && !isCorrect) {
              containerClasses =
                'border-rose-400 bg-rose-50/10 text-rose-500 font-medium';
              badgeClasses = 'bg-rose-500 text-white border-rose-500';
              textColorStyle = undefined;
            } else {
              containerClasses = 'border-slate-200/20 opacity-40';
            }
          }

          return (
            <div
              key={altKey}
              onClick={() => {
                if (!isAnswered && !isEliminada) {
                  setSelectedId(alt.id);
                }
              }}
              className={`group p-4 border rounded-xl transition-all duration-200 flex items-center justify-between gap-3 active:scale-[0.99] ${
                isAnswered || isEliminada ? 'cursor-default' : 'cursor-pointer'
              } ${containerClasses}`}
            >
              <div className="flex items-center gap-3.5 flex-1">
                <span
                  className={`w-7 h-7 shrink-0 flex items-center justify-center rounded-full text-xs font-bold border transition-all duration-200 ${badgeClasses}`}
                >
                  {letra}
                </span>
                <span
                  className={`text-sm sm:text-base leading-snug text-justify ${
                    isEliminada ? 'line-through select-none' : ''
                  }`}
                  style={textColorStyle}
                >
                  {textoAlternativa}
                </span>
              </div>

              {!isAnswered && (
                <button
                  type="button"
                  onClick={(e) => toggleEliminarAlternativa(e, altKey, alt.id)}
                  title={
                    isEliminada
                      ? 'Restaurar esta alternativa'
                      : 'Riscar / descartar alternativa'
                  }
                  className={`shrink-0 w-8 h-8 rounded-lg border flex items-center justify-center text-xs transition-all ${
                    isEliminada
                      ? 'bg-rose-500/20 border-rose-400 text-rose-500 opacity-100 font-bold'
                      : 'border-transparent opacity-40 sm:opacity-0 group-hover:opacity-80 hover:border-current hover:opacity-100'
                  }`}
                  style={!isEliminada ? { color: 'inherit' } : undefined}
                >
                  ✂️
                </button>
              )}

              {isAnswered && isCorrect && (
                <span className="text-xs font-bold text-emerald-700 bg-emerald-100/90 px-2.5 py-1 rounded-full shrink-0 ml-2">
                  ✓ Correta
                </span>
              )}
              {isAnswered && isSelected && !isCorrect && (
                <span className="text-xs font-bold text-rose-700 bg-rose-100/90 px-2.5 py-1 rounded-full shrink-0 ml-2">
                  ✕ Sua escolha
                </span>
              )}
            </div>
          );
        })}
      </div>

      {isAnswered && (
        <div
          className={`mb-6 p-4 rounded-xl border text-sm font-medium transition-all duration-300 ${
            acertouQuestao
              ? 'bg-emerald-500/10 border-emerald-400 text-emerald-600'
              : 'bg-rose-500/10 border-rose-400 text-rose-500'
          }`}
        >
          {acertouQuestao
            ? '✨ Excelente! Você acertou a questão!'
            : '💡 Quase lá! Veja a alternativa correta em verde e confira a fundamentação abaixo.'}
        </div>
      )}

      <div className="flex flex-wrap gap-3 justify-between items-center pt-5 border-t border-slate-200/30">
        <div className="flex flex-wrap items-center gap-4">
          <button
            type="button"
            onClick={() => setShowComment(!showComment)}
            className="text-sm font-semibold text-indigo-500 hover:text-indigo-400 transition-colors"
          >
            {showComment
              ? '▲ Ocultar Comentário'
              : '📘 Ver Comentário do Professor'}
          </button>

          <button
            type="button"
            onClick={() => setShowNotes(!showNotes)}
            className="text-sm font-semibold text-amber-500 hover:text-amber-400 transition-colors flex items-center gap-1.5"
          >
            <span>📝</span>
            <span>{showNotes ? 'Ocultar Anotações' : 'Minhas Anotações'}</span>
            {temAnotacao && (
              <span className="bg-amber-500/20 text-amber-500 border border-amber-400 text-[10px] font-extrabold px-1.5 py-0.5 rounded-full">
                ● Com nota
              </span>
            )}
          </button>
        </div>

        {!isAnswered ? (
          <button
            type="button"
            onClick={handleResponder}
            disabled={selectedId === null}
            className={`px-6 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 active:scale-95 ${
              selectedId === null
                ? 'bg-slate-200/30 text-slate-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white hover:from-indigo-500 hover:to-violet-500 shadow-md shadow-indigo-200/60'
            }`}
          >
            Responder Questão
          </button>
        ) : (
          <button
            type="button"
            onClick={handleRefazer}
            className="bg-indigo-500/10 text-indigo-500 border border-indigo-500/30 px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-indigo-500/20 transition-all active:scale-95"
          >
            ↻ Tentar Novamente
          </button>
        )}
      </div>

      {showNotes && (
        <div
          style={{ backgroundColor: tema.fundo || '#FFFBEB', color: tema.fonte || '#1E293B' }}
          className="mt-5 p-4 border border-amber-300/50 rounded-xl shadow-2xs transition-all duration-300"
        >
          <div className="flex items-center justify-between mb-2">
            <p
              className="text-xs font-extrabold uppercase tracking-wider flex items-center gap-1.5 text-amber-600"
            >
              <span>📝</span>
              <span>Meu Resumo / Bizu desta Questão</span>
            </p>
            <span
              className="text-[11px] font-semibold text-amber-600"
            >
              {anotacaoSalvaFeedback ? '✓ Salvo automaticamente' : 'Salvo no seu caderno'}
            </span>
          </div>
          <textarea
            rows={3}
            placeholder="Anote aqui o artigo da lei, jurisprudência, súmula ou macete para não esquecer na revisão..."
            value={anotacaoTexto}
            onChange={(e) => handleMudarAnotacao(e.target.value)}
            style={{ backgroundColor: tema.cartao || '#FFFFFF', color: 'inherit' }}
            className="w-full p-3 rounded-lg border border-amber-200/50 text-sm leading-relaxed outline-none focus:border-amber-400"
          />
        </div>
      )}

      {showComment && (() => {
        const letras = ["A", "B", "C", "D", "E"];
        const idxCorreta = question.alternativas?.findIndex(
          (a: any) => a.is_correta === true || a.correta === true
        );
        const altCorreta =
          idxCorreta !== undefined && idxCorreta >= 0
            ? question.alternativas[idxCorreta]
            : null;
        const letraCorreta =
          idxCorreta !== undefined && idxCorreta >= 0 ? letras[idxCorreta] : "";
        const textoCorreto = altCorreta?.texto || "";

        const explicacaoAutomatica = `Gabarito Oficial: Alternativa ${letraCorreta}. No âmbito de ${
          question.disciplina || "Conhecimentos Gerais"
        } (tema: ${
          question.assunto || "conteúdo programático do edital"
        }), a banca ${
          question.banca || "examinadora"
        } considera correta a assertiva "${textoCorreto}", pois reflete a literalidade normativa, jurisprudencial e doutrinária aplicável ao caso.`;

        const textoFundamentacao =
          question.explicacao && question.explicacao.trim() !== ""
            ? question.explicacao
            : explicacaoAutomatica;

        return (
          <div
            style={{ backgroundColor: tema.fundo || '#F8FAFC', color: tema.fonte || '#1E293B' }}
            className="mt-6 p-5 border border-indigo-200/50 rounded-xl text-sm leading-relaxed shadow-xs transition-all duration-300"
          >
            <p
              className="font-bold mb-1.5 flex items-center gap-1.5 text-indigo-500"
            >
              📘 Fundamentação do Professor:
            </p>
            <p
              style={{ opacity: 0.9 }}
              className="text-justify"
            >
              {textoFundamentacao}
            </p>
          </div>
        );
      })()}
    </div>
  );
}

export function CadernoQuestoes({
  questions,
  totalCount,
  filtros,
}: {
  questions: any[];
  totalCount?: number;
  filtros?: {
    banca?: string;
    orgao?: string;
    ano?: string;
    disciplina?: string;
    assunto?: string;
  };
}) {
  const tema = useTema(); // Hook do tema global
  const [modoCaderno, setModoCaderno] = useState<'todas' | 'erros' | 'favoritas'>('todas');
  const [questoesErros, setQuestoesErros] = useState<any[]>([]);
  const [questoesFavoritas, setQuestoesFavoritas] = useState<any[]>([]);

  const [indicesAbas, setIndicesAbas] = useState({ todas: 0, erros: 0, favoritas: 0 });
  const currentIndex = indicesAbas[modoCaderno];

  const atualizarIndiceAtual = (novoValor: number | ((prev: number) => number)) => {
    setIndicesAbas((prev) => {
      const valorAntigo = prev[modoCaderno];
      const valorFinal = typeof novoValor === 'function' ? novoValor(valorAntigo) : novoValor;
      return { ...prev, [modoCaderno]: valorFinal };
    });
  };

  const [cacheRemoto, setCacheRemoto] = useState<Record<number, any>>({});
  const [carregandoRemoto, setCarregandoRemoto] = useState(false);
  const [irParaInput, setIrParaInput] = useState('');

  const chaveFiltroAtual = `${filtros?.banca || ''}-${filtros?.orgao || ''}-${filtros?.ano || ''}-${filtros?.disciplina || ''}-${filtros?.assunto || ''}`;

  const sincronizarListasEstudo = async () => {
    try {
      const mapaLocal: Record<string, any> = {};
      questions.forEach((q) => {
        if (q?.id !== undefined) mapaLocal[String(q.id)] = q;
      });
      Object.values(cacheRemoto).forEach((q: any) => {
        if (q?.id !== undefined) mapaLocal[String(q.id)] = q;
      });

      const favIdsRaw = localStorage.getItem('questoes_favoritas_ids');
      const favIds: string[] = favIdsRaw ? JSON.parse(favIdsRaw) : [];
      const favCacheRaw = localStorage.getItem('questoes_favoritas_cache');
      const favCache: Record<string, any> = favCacheRaw ? JSON.parse(favCacheRaw) : {};

      const histRaw = localStorage.getItem('historico_simulado');
      const hist: any[] = histRaw ? JSON.parse(histRaw) : [];
      const ultimoStatusPorQuestao: Record<string, boolean> = {};
      hist.forEach((r) => {
        if (r?.questao_id !== undefined) {
          ultimoStatusPorQuestao[String(r.questao_id)] = Boolean(r.acertou);
        }
      });
      const errosIds = Object.keys(ultimoStatusPorQuestao).filter(
        (id) => ultimoStatusPorQuestao[id] === false
      );

      const errosCacheRaw = localStorage.getItem('questoes_erros_cache');
      const errosCache: Record<string, any> = errosCacheRaw ? JSON.parse(errosCacheRaw) : {};

      const idsParaBuscarNoBanco = Array.from(new Set([...favIds, ...errosIds])).filter(
        (id) => !mapaLocal[id] && !favCache[id] && !errosCache[id]
      );

      if (idsParaBuscarNoBanco.length > 0) {
        const idsNumericos = idsParaBuscarNoBanco
          .map((id) => Number(id))
          .filter((n) => !isNaN(n));
        if (idsNumericos.length > 0) {
          const { data: encontradas } = await supabase
            .from('questoes')
            .select('*, alternativas(*)')
            .in('id', idsNumericos);

          if (encontradas) {
            encontradas.forEach((q: any) => {
              const qId = String(q.id);
              mapaLocal[qId] = q;
              if (favIds.includes(qId)) favCache[qId] = q;
              if (errosIds.includes(qId)) errosCache[qId] = q;
            });
            localStorage.setItem('questoes_favoritas_cache', JSON.stringify(favCache));
            localStorage.setItem('questoes_erros_cache', JSON.stringify(errosCache));
          }
        }
      }

      const listaFavFinal = favIds
        .map((id) => mapaLocal[id] || favCache[id])
        .filter(Boolean);

      const listaErrosFinal = errosIds
        .map((id) => mapaLocal[id] || errosCache[id])
        .filter(Boolean);

      setQuestoesFavoritas(listaFavFinal);
      setQuestoesErros(listaErrosFinal);
    } catch (e) {}
  };

  useEffect(() => {
    sincronizarListasEstudo();
    window.addEventListener('atualizar-listas-estudo', sincronizarListasEstudo);
    return () => window.removeEventListener('atualizar-listas-estudo', sincronizarListasEstudo);
  }, [questions]);

  const listaAtiva =
    modoCaderno === 'erros'
      ? questoesErros
      : modoCaderno === 'favoritas'
      ? questoesFavoritas
      : questions;

  const total =
    modoCaderno === 'todas'
      ? totalCount && totalCount > questions.length
        ? totalCount
        : questions.length
      : listaAtiva.length;

  useEffect(() => {
    setIndicesAbas({ todas: 0, erros: 0, favoritas: 0 });
    setCacheRemoto({});
  }, [chaveFiltroAtual]);

  useEffect(() => {
    if (modoCaderno !== 'todas') return;
    if (currentIndex < questions.length || cacheRemoto[currentIndex]) {
      return;
    }

    let cancelado = false;
    const buscarBlocoRemoto = async () => {
      setCarregandoRemoto(true);
      try {
        const inicio = Math.max(0, currentIndex - 2);
        const fim = inicio + 20;

        let q = supabase
      .from('questoes')
      .select('*, alternativas(*)');

    // 1. Aplicar os filtros primeiro (todos com .eq para serem instantâneos)
    if (filtros?.banca) q = q.eq('banca', filtros.banca);
    if (filtros?.orgao) q = q.eq('orgao', filtros.orgao);
    if (filtros?.ano) q = q.eq('ano', Number(filtros.ano));
    
    // A CORREÇÃO PRINCIPAL:
    if (filtros?.disciplina) q = q.eq('disciplina', filtros.disciplina);
    
    if (filtros?.assunto) q = q.eq('assunto', filtros.assunto);

    // 2. Aplicar a ordem e a paginação no final
    q = q.order('id', { ascending: false }).range(inicio, fim);

    const { data } = await q;
        if (!cancelado && data && data.length > 0) {
          setCacheRemoto((prev) => {
            const novo = { ...prev };
            data.forEach((item, idx) => {
              novo[inicio + idx] = item;
            });
            return novo;
          });
        }
      } catch (e) {
        console.log('Erro ao buscar página remota:', e);
      } finally {
        if (!cancelado) setCarregandoRemoto(false);
      }
    };

    buscarBlocoRemoto();
    return () => {
      cancelado = true;
    };
  }, [currentIndex, questions.length, cacheRemoto, filtros, modoCaderno]);

  const indiceSeguro = total > 0 ? Math.min(currentIndex, total - 1) : 0;

  const questaoAtual =
    modoCaderno === 'todas'
      ? indiceSeguro < questions.length
        ? questions[indiceSeguro]
        : cacheRemoto[indiceSeguro]
      : listaAtiva[indiceSeguro];

  const gerarPaginacao = () => {
    if (total <= 6) {
      return Array.from({ length: total }, (_, i) => i);
    }
    if (indiceSeguro < 4) {
      return [0, 1, 2, 3, 4, '...', total - 1];
    }
    if (indiceSeguro >= total - 4) {
      return [0, '...', total - 5, total - 4, total - 3, total - 2, total - 1];
    }
    return [0, '...', indiceSeguro - 1, indiceSeguro, indiceSeguro + 1, '...', total - 1];
  };

  const itensPaginacao = gerarPaginacao();

  const handleIrParaQuestao = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseInt(irParaInput, 10);
    if (!isNaN(num) && num >= 1 && num <= total) {
      atualizarIndiceAtual(num - 1);
      setIrParaInput('');
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div 
        className="border border-slate-200/50 rounded-2xl p-2.5 shadow-xs flex flex-wrap items-center justify-between gap-2"
        style={{ backgroundColor: tema.cartao || '#FFFFFF', color: tema.fonte || 'inherit' }}
      >
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setModoCaderno('todas')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              modoCaderno === 'todas'
                ? 'bg-indigo-600 text-white shadow-xs shadow-indigo-200'
                : 'border border-transparent hover:border-current opacity-70 hover:opacity-100'
            }`}
          >
            <span>📚</span>
            <span>Todas as Questões</span>
          </button>

          <button
            type="button"
            onClick={() => setModoCaderno('erros')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              modoCaderno === 'erros'
                ? 'bg-rose-600 text-white shadow-xs shadow-rose-200'
                : 'bg-rose-500/10 text-rose-500 border border-rose-500/30 hover:bg-rose-500/20'
            }`}
          >
            <span>⚠️</span>
            <span>Caderno de Erros</span>
            <span
              className={`px-1.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                modoCaderno === 'erros'
                  ? 'bg-white/20 text-white'
                  : 'bg-rose-500/20 text-rose-500'
              }`}
            >
              {questoesErros.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setModoCaderno('favoritas')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              modoCaderno === 'favoritas'
                ? 'bg-amber-500 text-white shadow-xs shadow-amber-200'
                : 'bg-amber-500/10 text-amber-500 border border-amber-500/30 hover:bg-amber-500/20'
            }`}
          >
            <span>⭐</span>
            <span>Favoritas</span>
            <span
              className={`px-1.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                modoCaderno === 'favoritas'
                  ? 'bg-white/20 text-white'
                  : 'bg-amber-500/20 text-amber-500'
              }`}
            >
              {questoesFavoritas.length}
            </span>
          </button>
        </div>

        <span className="text-[11px] font-medium px-2 hidden sm:inline" style={{ opacity: 0.6 }}>
          ✂️ Dica: use a tesourinha nas alternativas para descartar opções
        </span>
      </div>

      {total === 0 ? (
        <div 
          className="border border-slate-200/50 rounded-2xl p-10 text-center shadow-xs"
          style={{ backgroundColor: tema.cartao || '#FFFFFF', color: tema.fonte || 'inherit' }}
        >
          {modoCaderno === 'erros' ? (
            <>
              <p className="text-base font-bold" style={{ color: 'inherit' }}>
                🎉 Parabéns! Seu Caderno de Erros está limpo!
              </p>
              <p className="text-sm mt-1" style={{ color: 'inherit', opacity: 0.7 }}>
                Sempre que você errar uma questão, ela aparecerá automaticamente aqui para você revisar até acertar.
              </p>
            </>
          ) : modoCaderno === 'favoritas' ? (
            <>
              <p className="text-base font-bold" style={{ color: 'inherit' }}>
                ⭐ Você ainda não favoritou nenhuma questão.
              </p>
              <p className="text-sm mt-1" style={{ color: 'inherit', opacity: 0.7 }}>
                Clique no botão &quot;☆ Favoritar&quot; no canto superior direito de qualquer questão para salvá-la aqui.
              </p>
            </>
          ) : (
            <>
              <p className="text-base font-semibold" style={{ color: 'inherit' }}>
                Nenhuma questão encontrada para estes filtros.
              </p>
              <p className="text-sm mt-1" style={{ color: 'inherit', opacity: 0.7 }}>
                Toque em &quot;Limpar Filtros&quot; na barra lateral para ver todas as questões novamente.
              </p>
            </>
          )}
        </div>
      ) : (
        <>
          <div 
            className="border border-slate-200/50 rounded-2xl p-3.5 sm:p-4 shadow-xs flex flex-wrap items-center justify-between gap-3"
            style={{ backgroundColor: tema.cartao || '#FFFFFF', color: tema.fonte || 'inherit' }}
          >
            <div className="flex items-center gap-1.5 flex-wrap">
              {itensPaginacao.map((item, idx) => {
                if (item === '...') {
                  return (
                    <span
                      key={`ellipsis-${idx}`}
                      className="w-7 h-9 flex items-center justify-center text-xs font-bold select-none"
                      style={{ opacity: 0.5 }}
                    >
                      ...
                    </span>
                  );
                }

                const pageIndex = item as number;
                const ativo = pageIndex === indiceSeguro;

                return (
                  <button
                    key={`page-${pageIndex}`}
                    type="button"
                    onClick={() => atualizarIndiceAtual(pageIndex)}
                    className={`min-w-9 h-9 px-2.5 rounded-xl text-xs font-bold transition-all duration-200 active:scale-90 border ${
                      ativo
                        ? 'bg-gradient-to-tr from-indigo-600 to-violet-500 text-white border-indigo-600 shadow-sm shadow-indigo-200 scale-105'
                        : 'border-current opacity-60 hover:opacity-100 hover:border-indigo-500 hover:text-indigo-500'
                    }`}
                    style={!ativo ? { backgroundColor: 'transparent', color: 'inherit' } : undefined}
                  >
                    {(pageIndex + 1).toLocaleString('pt-BR')}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {total > 10 && (
                <form onSubmit={handleIrParaQuestao} className="flex items-center gap-1">
                  <input
                    type="number"
                    min={1}
                    max={total}
                    placeholder="Ir nº..."
                    value={irParaInput}
                    onChange={(e) => setIrParaInput(e.target.value)}
                    style={{ backgroundColor: tema.fundo || 'transparent', color: 'inherit' }}
                    className="w-20 px-2.5 py-1.5 rounded-xl border border-slate-200/50 text-xs font-medium outline-none focus:border-indigo-500"
                  />
                </form>
              )}

              <button
                type="button"
                onClick={() => atualizarIndiceAtual((prev) => Math.max(0, prev - 1))}
                disabled={indiceSeguro === 0}
                className="px-3.5 py-2 rounded-xl border border-current opacity-70 hover:opacity-100 text-xs font-semibold active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                style={{ backgroundColor: 'transparent', color: 'inherit' }}
              >
                ← Anterior
              </button>
              <button
                type="button"
                onClick={() => atualizarIndiceAtual((prev) => Math.min(total - 1, prev + 1))}
                disabled={indiceSeguro === total - 1}
                className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-500 shadow-xs shadow-indigo-200 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                Próxima →
              </button>
            </div>
          </div>

          {carregandoRemoto && !questaoAtual ? (
            <div 
              className="border border-slate-200/50 rounded-2xl p-12 text-center text-sm font-medium shadow-xs"
              style={{ backgroundColor: tema.cartao || '#FFFFFF', color: tema.fonte || 'inherit', opacity: 0.7 }}
            >
              ⏳ Carregando a questão {(indiceSeguro + 1).toLocaleString('pt-BR')}...
            </div>
          ) : (
            <QuestionCard
              key={`${modoCaderno}-${questaoAtual?.id || indiceSeguro}`}
              question={questaoAtual}
              numeroAtual={indiceSeguro + 1}
              totalQuestoes={total}
            />
          )}
        </>
      )}
    </div>
  );
}

// ==========================================
// 4. MOTOR GERADOR DE QUESTÕES COM IA + OFERTA VITALÍCIA
// ==========================================

export function BotaoNovaQuestao() {
  const tema = useTema();
  const [vitalicioAtivo, setVitalicioAtivo] = useState(false);
  const [modalVitalicioAberto, setModalVitalicioAberto] = useState(false);
  const [abaVitalicio, setAbaVitalicio] = useState<'oferta' | 'ativar'>('oferta');
  const [codigoAtivacao, setCodigoAtivacao] = useState('');
  const [erroAtivacao, setErroAtivacao] = useState('');
  const [loadingAtivacao, setLoadingAtivacao] = useState(false);
  const [resolvidasGratis, setResolvidasGratis] = useState(0);

  const [iaUsadas, setIaUsadas] = useState(0);
  const [limiteIaTotal, setLimiteIaTotal] = useState(10); 
  const [abaAtivaIa, setAbaAtivaIa] = useState<'gerar' | 'comprar'>('gerar');
  const [codigoCredito, setCodigoCredito] = useState('');
  const [erroCredito, setErroCredito] = useState('');

  const [modalIaAberto, setModalIaAberto] = useState(false);
  const [disciplinasBanco, setDisciplinasBanco] = useState<string[]>([
    'Direito Administrativo',
    'Direito Constitucional',
    'Controle Externo',
  ]);
  const [discIaSelecionada, setDiscIaSelecionada] = useState('Direito Administrativo');
  const [discIaCustom, setDiscIaCustom] = useState('');
  const [assuntoIa, setAssuntoIa] = useState('');
  const [qtdIa, setQtdIa] = useState(5);
  const [gerandoIa, setGerandoIa] = useState(false);
  const [sucessoIa, setSucessoIa] = useState(false);

  const atualizarStatusComercial = () => {
    try {
      setVitalicioAtivo(usuarioTemAcessoTotal());
      setResolvidasGratis(obterTotalResolvidasLocal());
      setIaUsadas(Number(localStorage.getItem('qpro_ia_usadas') || '0'));
      setLimiteIaTotal(Number(localStorage.getItem('qpro_ia_limite_total') || '10'));
    } catch (e) {}
  };

  useEffect(() => {
    atualizarStatusComercial();
    const abrirPaywall = () => {
      setAbaVitalicio('oferta');
      setModalVitalicioAberto(true);
    };
    window.addEventListener('atualizar-placar', atualizarStatusComercial);
    window.addEventListener('abrir-modal-vitalicio', abrirPaywall);

    const carregarDisciplinas = async () => {
      try {
        const { data } = await supabase.rpc('obter_opcoes_filtros');
        if (data?.disciplina && Array.isArray(data.disciplina) && data.disciplina.length > 0) {
          const limpas = Array.from(
            new Set(data.disciplina.map((d: string) => normalizarDisciplina(d)).filter(Boolean))
          ) as string[];
          if (limpas.length > 0) {
            setDisciplinasBanco(limpas);
            setDiscIaSelecionada(limpas[0]);
          }
        }
      } catch (e) {}
    };
    carregarDisciplinas();

    return () => {
      window.removeEventListener('atualizar-placar', atualizarStatusComercial);
      window.removeEventListener('abrir-modal-vitalicio', abrirPaywall);
    };
  }, []);

  const handleAtivarCodigoVitalicio = async (e: React.FormEvent) => {
    e.preventDefault();
    const limpo = codigoAtivacao.trim().toUpperCase();

    if (CODIGOS_ATIVACAO_VITALICIO.includes(limpo)) {
      localStorage.setItem('qpro_vitalicio_ativo', 'true');
      setVitalicioAtivo(true);
      setModalVitalicioAberto(false);
      setCodigoAtivacao('');
      setErroAtivacao('');
      alert('🎉 Parabéns! Seu Acesso Vitalício ao Qpro Concursos foi ativado com sucesso!');
      return;
    }

    setLoadingAtivacao(true);
    setErroAtivacao('');

    try {
      const response = await fetch('/api/validate-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: limpo })
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('qpro_vitalicio_ativo', 'true');
        localStorage.setItem('qpro_user_email', data.email);
        setVitalicioAtivo(true);
        setModalVitalicioAberto(false);
        setCodigoAtivacao('');
        alert('🎉 Parabéns! Seu Acesso Vitalício ao Qpro Concursos foi ativado com sucesso!');
      } else {
        setErroAtivacao(data.error || 'Código inválido. Verifique o código enviado na confirmação da sua compra.');
      }
    } catch (err) {
      setErroAtivacao('Erro de conexão com o servidor. Verifique a sua internet e tente novamente.');
    } finally {
      setLoadingAtivacao(false);
    }
  };

  const handleAtivarCreditos = async (e: React.FormEvent) => {
    e.preventDefault();
    const limpo = codigoCredito.trim().toUpperCase();
    if (!limpo) return;

    setLoadingAtivacao(true);
    setErroCredito('');

    try {
      const response = await fetch('/api/validate-creditos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: limpo })
      });

      const data = await response.json();

      if (response.ok) {
        const creditosAdicionados = Number(data.creditos);
        const novoLimite = limiteIaTotal + creditosAdicionados;
        
        localStorage.setItem('qpro_ia_limite_total', String(novoLimite));
        setLimiteIaTotal(novoLimite);
        setCodigoCredito('');
        setErroCredito('');
        setAbaAtivaIa('gerar');
        alert(`⚡ Sucesso! ${creditosAdicionados} créditos foram adicionados à sua conta. O seu novo limite é de ${novoLimite} questões.`);
      } else {
        setErroCredito(data.error || 'Código inválido ou já utilizado.');
      }
    } catch (err) {
      setErroCredito('Erro de conexão com o servidor. Tente novamente.');
    } finally {
      setLoadingAtivacao(false);
    }
  };

  const handleAbrirGeradorIA = () => {
    if (!usuarioTemAcessoTotal()) {
      setAbaVitalicio('oferta');
      setModalVitalicioAberto(true);
      return;
    }
    setSucessoIa(false);
    setModalIaAberto(true);
    setAbaAtivaIa('gerar');
  };

  const handleGerarQuestoesUsuarioIA = async (e: React.FormEvent) => {
    e.preventDefault();
    const disciplinaFinal =
      discIaSelecionada === '__outra__'
        ? normalizarDisciplina(discIaCustom.trim())
        : normalizarDisciplina(discIaSelecionada);

    if (!disciplinaFinal) {
      alert('Por favor, selecione ou digite uma disciplina.');
      return;
    }

    const quantidadeSegura = Math.min(Math.max(Number(qtdIa) || 5, 1), 5);

    if (iaUsadas + quantidadeSegura > limiteIaTotal) {
      alert(`⚠️ Saldo Insuficiente!\n\nVocê tem limite para gerar ${limiteIaTotal} questões e já gerou ${iaUsadas}.\n\nAdquira um Pacote de Créditos para continuar.`);
      setAbaAtivaIa('comprar');
      return;
    }

    setGerandoIa(true);

    try {
      let novasQuestoes: any[] | null = null;
      let erroExato = "";

      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 55000); 

        const resp = await fetch('/api/gerar-ia', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            disciplina: disciplinaFinal,
            assunto: assuntoIa.trim(),
            quantidade: quantidadeSegura,
          }),
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);

        if (resp.ok) {
          const json = await resp.json();
          if (Array.isArray(json?.questoes) && json.questoes.length > 0) {
            novasQuestoes = json.questoes;
          }
        } else {
            const erroTexto = await resp.text();
            erroExato = `Erro da API: ${resp.status} - ${erroTexto}`;
            console.error(erroExato);
        }
      } catch (e: any) {
         erroExato = e.name === 'AbortError' ? "Tempo limite excedido (55 segundos)." : e.message;
         console.error("Falha ao comunicar com a IA:", erroExato);
      }

      if (!novasQuestoes) {
        alert(`A geração por IA falhou!\n\nMotivo: ${erroExato}\n\nPor favor, verifique a sua cota da API ou tente novamente mais tarde.`);
        setGerandoIa(false);
        return; 
      }

      try {
        await gravarListaDeQuestoesNoBanco(novasQuestoes);
      } catch (dbError: any) {
        const mensagemErro = dbError.message || "";
        if (mensagemErro.includes("duplicate key") || mensagemErro.includes("unique constraint")) {
          console.warn("Aviso: Algumas questões geradas já existiam na base de dados.");
        } else {
          alert("Erro ao guardar na base de dados: " + mensagemErro);
          setGerandoIa(false);
          return;
        }
      }

      const novoTotal = iaUsadas + quantidadeSegura;
      localStorage.setItem('qpro_ia_usadas', String(novoTotal));
      setIaUsadas(novoTotal);

      setSucessoIa(true); 
      
      setTimeout(() => {
        setModalIaAberto(false);
        setAssuntoIa('');
        setSucessoIa(false);
        window.location.href = `/app?disciplina=${encodeURIComponent(disciplinaFinal)}`;
      }, 3000);
      
    } catch (err: any) {
      alert('Erro grave no sistema: ' + (err.message || 'Verifique a conexão.'));
    } finally {
      setGerandoIa(false);
    }
  };

  const restantesGratis = Math.max(0, LIMITE_QUESTOES_GRATIS - resolvidasGratis);
  const esgotouCreditos = iaUsadas >= limiteIaTotal;

  return (
    <>
      <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
        {vitalicioAtivo ? (
          <span
            title="Você possui Acesso Vitalício Ilimitado ao Qpro Concursos"
            className="flex items-center gap-1 bg-amber-500/20 border border-amber-400 text-amber-600 px-3 py-2 rounded-xl text-xs font-extrabold shadow-2xs"
          >
            <span>👑</span>
            <span className="hidden md:inline">Acesso Vitalício</span>
          </span>
        ) : (
          <button
            type="button"
            onClick={() => {
              setAbaVitalicio('oferta');
              setModalVitalicioAberto(true);
            }}
            className="flex items-center gap-1.5 bg-emerald-600 text-white px-3 py-2 rounded-xl text-xs font-extrabold hover:bg-emerald-500 transition-all active:scale-95 shadow-xs shadow-emerald-200"
          >
            <span>🚀</span>
            <span>
              {restantesGratis > 0
                ? `Grátis (${restantesGratis}/${LIMITE_QUESTOES_GRATIS}) • Liberar Vitalício`
                : 'Liberar Vitalício R$ 47'}
            </span>
          </button>
        )}

        <button
          type="button"
          onClick={handleAbrirGeradorIA}
          className="flex items-center gap-1.5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white px-3.5 py-2 rounded-xl text-xs font-bold hover:from-indigo-500 hover:to-violet-500 transition-all duration-200 active:scale-95 shadow-xs shadow-indigo-200"
          title="Gerar até 5 questões inéditas com IA por disciplina"
        >
          <span>✨</span>
          <span>Gerar com IA</span>
        </button>
      </div>

      {modalVitalicioAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div
            style={{ backgroundColor: tema.cartao || '#FFFFFF', color: tema.fonte || '#0F172A' }}
            className="border border-slate-200/20 rounded-2xl max-w-lg w-full p-6 shadow-2xl my-8"
          >
            <div className="flex items-center justify-between border-b border-slate-200/30 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setAbaVitalicio('oferta')}
                  style={
                    abaVitalicio === 'oferta'
                      ? { backgroundColor: '#4F46E5', color: '#FFFFFF' }
                      : { backgroundColor: 'transparent', color: 'inherit', border: '1px solid currentColor', opacity: 0.7 }
                  }
                  className="px-3 py-1.5 rounded-xl text-xs font-bold transition-all"
                >
                  👑 Acesso Vitalício
                </button>
                <button
                  type="button"
                  onClick={() => setAbaVitalicio('ativar')}
                  style={
                    abaVitalicio === 'ativar'
                      ? { backgroundColor: '#4F46E5', color: '#FFFFFF' }
                      : { backgroundColor: 'transparent', color: 'inherit', border: '1px solid currentColor', opacity: 0.7 }
                  }
                  className="px-3 py-1.5 rounded-xl text-xs font-bold transition-all"
                >
                  🔑 Já comprei! Ativar
                </button>
              </div>
              <button
                type="button"
                onClick={() => setModalVitalicioAberto(false)}
                className="text-sm font-bold hover:opacity-70 px-2 py-1"
                style={{ color: 'inherit' }}
              >
                ✕
              </button>
            </div>

            {abaVitalicio === 'oferta' ? (
              <div>
                <div
                  style={{ backgroundColor: 'rgba(79, 70, 229, 0.1)', borderColor: 'rgba(79, 70, 229, 0.2)' }}
                  className="rounded-xl border p-3.5 mb-4 text-center"
                >
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-indigo-500">
                    ⚡ Chega de pagar mensalidades caras
                  </span>
                  <h3 className="text-lg sm:text-xl font-extrabold mt-0.5" style={{ color: 'inherit' }}>
                    Desbloqueie o Qpro Concursos Completo
                  </h3>
                  <p className="text-xs mt-1" style={{ opacity: 0.8 }}>
                    Pague <strong>uma única vez</strong> e tenha acesso ilimitado para sempre!
                  </p>
                </div>

                <ul className="space-y-2.5 text-xs sm:text-sm mb-5">
                  <li className="flex items-start gap-2.5">
                    <span className="text-emerald-500 font-extrabold">✓</span>
                    <span style={{ opacity: 0.9 }}>
                      <strong>Acesso Vitalício Ilimitado</strong> a todas as questões comentadas da plataforma
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="text-emerald-500 font-extrabold">✓</span>
                    <span style={{ opacity: 0.9 }}>
                      <strong>✨ Gerador de Questões com IA:</strong> crie questões inéditas sob demanda para qualquer disciplina
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="text-emerald-500 font-extrabold">✓</span>
                    <span style={{ opacity: 0.9 }}>
                      <strong>⚠️ Caderno de Erros Automático + Favoritas + Bizus:</strong> revise exatamente onde você precisa melhorar
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="text-emerald-500 font-extrabold">✓</span>
                    <span style={{ opacity: 0.9 }}>
                      <strong>📈 Raio-X por Disciplina + Temas de Leitura (Modo Kindle e Noturno)</strong>
                    </span>
                  </li>
                </ul>

                <div
                  style={{ backgroundColor: tema.fundo || '#F8FAFC', borderColor: 'rgba(0,0,0,0.05)' }}
                  className="rounded-2xl border p-4 text-center mb-5"
                >
                  <p className="text-xs line-through font-semibold" style={{ opacity: 0.6 }}>
                    De R$ 197,00/ano por apenas:
                  </p>
                  <div className="flex items-baseline justify-center gap-1.5 mt-1">
                    <span className="text-3xl font-extrabold" style={{ color: 'inherit' }}>
                      R$ 47,00
                    </span>
                    <span
                      style={{ backgroundColor: 'rgba(34, 197, 94, 0.1)', color: '#10B981' }}
                      className="text-[11px] font-extrabold px-2 py-0.5 rounded-full"
                    >
                      PAGAMENTO ÚNICO
                    </span>
                  </div>
                  <p className="text-xs mt-1" style={{ opacity: 0.7 }}>
                    À vista no PIX ou em até <strong>6x de R$ 8,85</strong> no cartão
                  </p>
                </div>

                <a
                  href={LINK_CHECKOUT_PAGAMENTO}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full text-center py-3.5 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-sm shadow-lg shadow-emerald-200 transition-all active:scale-98"
                >
                  🚀 Quero Meu Acesso Vitalício por R$ 47,00
                </a>

                <div className="mt-3 flex items-center justify-between text-[11px]" style={{ opacity: 0.6 }}>
                  <span>🔒 Compra 100% Segura • Liberação Imediata</span>
                  <button
                    type="button"
                    onClick={() => setAbaVitalicio('ativar')}
                    className="font-bold hover:underline"
                    style={{ color: 'inherit' }}
                  >
                    Já comprou? Ativar código →
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleAtivarCodigoVitalicio} className="space-y-4">
                <div>
                  <h4 className="text-base font-extrabold" style={{ color: 'inherit' }}>
                    🔑 Ativar Meu Acesso Vitalício
                  </h4>
                  <p className="text-xs mt-1" style={{ opacity: 0.7 }}>
                    Digite abaixo o código de ativação que você recebeu após confirmar o pagamento de R$ 47,00:
                  </p>
                </div>

                {erroAtivacao && (
                  <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs font-semibold text-rose-500">
                    {erroAtivacao}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold uppercase mb-1.5" style={{ opacity: 0.8 }}>
                    Código de Ativação *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Digite seu código de acesso..."
                    value={codigoAtivacao}
                    onChange={(e) => {
                      setCodigoAtivacao(e.target.value);
                      setErroAtivacao('');
                    }}
                    style={{ backgroundColor: tema.fundo || '#FFFFFF', color: 'inherit' }}
                    className="w-full px-3.5 py-2.5 border border-slate-200/40 rounded-xl text-sm font-bold uppercase tracking-wider outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setAbaVitalicio('oferta')}
                    style={{ backgroundColor: 'transparent', color: 'inherit' }}
                    className="px-4 py-2.5 rounded-xl border border-current opacity-70 text-xs font-semibold hover:opacity-100"
                  >
                    ← Voltar para Oferta
                  </button>
                  <button
                    type="submit"
                    disabled={loadingAtivacao}
                    className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-extrabold shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loadingAtivacao ? 'A validar...' : '✓ Desbloquear Acesso Vitalício'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {modalIaAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div
            style={{ backgroundColor: tema.cartao || '#FFFFFF', color: tema.fonte || '#1E293B' }}
            className="border border-slate-200/20 rounded-2xl max-w-md w-full p-6 shadow-xl"
          >
            <div className="flex items-center justify-between border-b border-slate-200/30 pb-3 mb-4">
              <div>
                <h3 className="text-base font-extrabold flex items-center gap-2" style={{ color: 'inherit' }}>
                  <span>✨</span>
                  <span>Gerar Questões com IA</span>
                </h3>
                <p className="text-xs mt-0.5" style={{ opacity: 0.7 }}>
                  Escolha a disciplina e gere até 5 questões comentadas na hora
                </p>
              </div>
              <button
                type="button"
                onClick={() => setModalIaAberto(false)}
                className="text-sm font-bold hover:opacity-70 px-2 py-1"
                style={{ color: 'inherit' }}
              >
                ✕
              </button>
            </div>

            {/* PAINEL DE SUCESSO */}
            {sucessoIa ? (
              <div className="flex flex-col items-center justify-center py-8 text-center animate-in fade-in zoom-in duration-300">
                <div className="w-16 h-16 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mb-4 shadow-sm text-4xl">
                  ✨
                </div>
                <h3 className="text-xl font-extrabold text-emerald-500 mb-1">Questão gerada com sucesso!</h3>
                <p className="text-sm font-medium mb-2" style={{ opacity: 0.8 }}>As questões foram guardadas no banco.</p>
                <p className="text-xs" style={{ opacity: 0.6 }}>A redirecionar para o seu caderno de estudos...</p>
              </div>
            ) : (
              <>
                <div className="mb-5 flex flex-col gap-3">
                  <div className="flex items-center justify-between bg-indigo-500/10 border border-indigo-500/20 p-3 rounded-xl">
                    <div>
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-500">Seu Saldo de Créditos</span>
                      <div className="text-sm font-bold mt-0.5" style={{ color: 'inherit' }}>
                        {limiteIaTotal - iaUsadas} Disponíveis <span className="text-[10px] font-normal opacity-70">({iaUsadas}/{limiteIaTotal} usadas)</span>
                      </div>
                    </div>
                    <button 
                      onClick={() => setAbaAtivaIa(abaAtivaIa === 'comprar' ? 'gerar' : 'comprar')}
                      className="bg-amber-500 hover:bg-amber-600 text-white px-3 py-1.5 rounded-lg text-[11px] font-extrabold uppercase shadow-sm transition-all active:scale-95"
                    >
                      {abaAtivaIa === 'comprar' ? 'Voltar' : '+ Créditos'}
                    </button>
                  </div>
                </div>

                {abaAtivaIa === 'comprar' ? (
                  <div className="space-y-4">
                    <div className="border border-slate-200/20 p-4 rounded-xl text-center" style={{ backgroundColor: tema.fundo || '#F8FAFC' }}>
                      <h4 className="text-sm font-bold mb-2" style={{ color: 'inherit' }}>Seus créditos acabaram?</h4>
                      <p className="text-xs mb-2" style={{ opacity: 0.8 }}>Escolha o pacote ideal para continuar a gerar simulados inéditos e focar na sua aprovação.</p>
                      
                      <div className="flex flex-col gap-2 mt-3">
                        <a 
                          href="https://pay.kiwify.com.br/pO9bvnh" 
                          target="_blank" rel="noopener noreferrer"
                          className="flex items-center justify-between px-4 py-2.5 border border-slate-200/30 rounded-xl hover:border-indigo-400 hover:bg-indigo-500/10 transition-all active:scale-95"
                          style={{ backgroundColor: tema.cartao || '#FFFFFF', color: 'inherit' }}
                        >
                          <div className="text-left">
                            <p className="text-xs font-bold" style={{ color: 'inherit' }}>Pack Turbo (100 Questões)</p>
                          </div>
                          <span className="text-xs font-extrabold text-indigo-500 bg-indigo-500/10 px-2 py-1 rounded-lg">R$ 19,90</span>
                        </a>

                        <a 
                          href="https://pay.kiwify.com.br/ucNASij" 
                          target="_blank" rel="noopener noreferrer"
                          className="flex items-center justify-between px-4 py-2.5 bg-indigo-600 border border-indigo-600 rounded-xl hover:bg-indigo-500 transition-all active:scale-95 shadow-md shadow-indigo-200"
                        >
                          <div className="text-left">
                            <p className="text-xs font-bold text-white">Pack Avançado (300 Questões)</p>
                            <p className="text-[10px] text-indigo-200 font-medium">+ Mais Popular</p>
                          </div>
                          <span className="text-xs font-extrabold text-indigo-900 bg-white px-2 py-1 rounded-lg">R$ 37,00</span>
                        </a>

                        <a 
                          href="https://pay.kiwify.com.br/rAugTp1" 
                          target="_blank" rel="noopener noreferrer"
                          className="flex items-center justify-between px-4 py-2.5 bg-slate-900 border border-slate-900 rounded-xl hover:bg-slate-800 transition-all active:scale-95"
                        >
                          <div className="text-left">
                            <p className="text-xs font-bold text-white">Pack Elite (1.000 Questões)</p>
                            <p className="text-[10px] text-slate-400 font-medium">Custo-benefício máximo</p>
                          </div>
                          <span className="text-xs font-extrabold text-slate-900 bg-amber-400 px-2 py-1 rounded-lg">R$ 89,90</span>
                        </a>
                      </div>
                    </div>

                    <form onSubmit={handleAtivarCreditos} className="mt-4 pt-4 border-t border-slate-200/30">
                      <label className="block text-xs font-bold uppercase mb-1.5" style={{ opacity: 0.8 }}>Já comprou? Digite o código recebido:</label>
                      {erroCredito && <div className="p-2 mb-2 bg-rose-500/10 text-rose-500 text-xs font-semibold rounded-lg">{erroCredito}</div>}
                      <div className="flex gap-2">
                        <input 
                          type="text" required placeholder="Ex: CRED100-XYZ" value={codigoCredito} onChange={(e) => {setCodigoCredito(e.target.value); setErroCredito('');}}
                          className="flex-1 px-3 py-2 border border-slate-200/40 rounded-xl text-sm font-bold uppercase outline-none focus:border-indigo-500"
                          style={{ backgroundColor: tema.fundo || '#FFFFFF', color: 'inherit' }}
                        />
                        <button type="submit" disabled={loadingAtivacao} className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold disabled:opacity-50 hover:bg-indigo-500 transition-all">
                          {loadingAtivacao ? 'Validando...' : 'Ativar'}
                        </button>
                      </div>
                    </form>
                  </div>
                ) : (
                  <form onSubmit={handleGerarQuestoesUsuarioIA} className="flex flex-col gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wide mb-1.5" style={{ opacity: 0.8 }}>
                        Disciplina *
                      </label>
                      <select
                        value={discIaSelecionada}
                        onChange={(e) => setDiscIaSelecionada(e.target.value)}
                        style={{ backgroundColor: tema.fundo || '#FFFFFF', color: 'inherit' }}
                        className="w-full px-3 py-2.5 border border-slate-200/40 rounded-xl text-sm font-medium outline-none focus:border-indigo-500"
                      >
                        {disciplinasBanco.map((d) => (
                          <option key={d} value={d}>
                            {d}
                          </option>
                        ))}
                        <option value="__outra__">+ Outra disciplina específica...</option>
                      </select>
                    </div>

                    {discIaSelecionada === '__outra__' && (
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wide mb-1.5" style={{ opacity: 0.8 }}>
                          Digite a Disciplina *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="Ex: Legislação Municipal, Engenharia Civil..."
                          value={discIaCustom}
                          onChange={(e) => setDiscIaCustom(e.target.value)}
                          style={{ backgroundColor: tema.fundo || '#FFFFFF', color: 'inherit' }}
                          className="w-full px-3 py-2 border border-slate-200/40 rounded-xl text-sm outline-none focus:border-indigo-500"
                        />
                      </div>
                    )}

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wide mb-1.5" style={{ opacity: 0.8 }}>
                        Assunto Específico <span className="font-normal opacity-70">(opcional)</span>
                      </label>
                      <input
                        type="text"
                        placeholder="Ex: Licitações, Poderes Administrativos, LRF..."
                        value={assuntoIa}
                        onChange={(e) => setAssuntoIa(e.target.value)}
                        style={{ backgroundColor: tema.fundo || '#FFFFFF', color: 'inherit' }}
                        className="w-full px-3 py-2 border border-slate-200/40 rounded-xl text-sm outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wide mb-1.5" style={{ opacity: 0.8 }}>
                        Quantidade de Questões (Máx. 5)
                      </label>
                      <div className="grid grid-cols-5 gap-2">
                        {[1, 2, 3, 4, 5].map((num) => {
                          const ativo = qtdIa === num;
                          return (
                            <button
                              key={num}
                              type="button"
                              onClick={() => setQtdIa(num)}
                              disabled={esgotouCreditos}
                              style={
                                ativo
                                  ? { backgroundColor: '#4F46E5', color: '#FFFFFF', borderColor: '#4F46E5' }
                                  : { backgroundColor: 'transparent', color: 'inherit', borderColor: 'currentColor', opacity: 0.6 }
                              }
                              className={`py-2 rounded-xl border text-xs font-bold transition-all active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed ${ativo ? '' : 'hover:opacity-100'}`}
                            >
                              {num} {num === 1 ? 'questão' : 'questões'}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-3 border-t border-slate-200/30 mt-1">
                      <button
                        type="button"
                        onClick={() => setModalIaAberto(false)}
                        style={{ backgroundColor: 'transparent', color: 'inherit' }}
                        className="px-4 py-2 rounded-xl border border-current opacity-70 text-xs font-semibold hover:opacity-100"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        disabled={gerandoIa || esgotouCreditos}
                        className="px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-xs font-bold hover:from-indigo-500 hover:to-violet-500 disabled:opacity-50 shadow-sm shadow-indigo-200"
                      >
                        {gerandoIa
                          ? `⏳ Gerando...`
                          : esgotouCreditos 
                          ? `Limite Atingido`
                          : `✨ Gerar ${qtdIa}`}
                      </button>
                    </div>
                  </form>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}

// ==========================================
// 5. IMPORTADOR DE PROVAS COM IA
// ==========================================
export function ImportadorProvas() {
  const tema = useTema(); // Hook
  const [provaPdf, setProvaPdf] = useState<File | null>(null);
  const [gabaritoPdf, setGabaritoPdf] = useState<File | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "review" | "saving" | "success" | "error">("idle");
  const [mensagem, setMensagem] = useState("");
  const [questoesExtraidas, setQuestoesExtraidas] = useState<any[]>([]);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!provaPdf || !gabaritoPdf) return setMensagem("Selecione os 2 PDFs.");
    
    setStatus("loading");
    setMensagem("A IA está a ler a prova e o gabarito. Isto pode demorar até 60 segundos...");

    const formData = new FormData();
    formData.append("prova", provaPdf);
    formData.append("gabarito", gabaritoPdf);

    try {
      const res = await fetch("/api/admin/processar-pdf", { method: "POST", body: formData });
      
      let data;
      try {
        data = await res.json();
      } catch (parseError) {
        throw new Error("O servidor demorou muito a responder ou o ficheiro é demasiado pesado.");
      }

      if (!res.ok) throw new Error(data.error || "Erro desconhecido ao processar.");
      if (!data.questoes || data.questoes.length === 0) throw new Error("A IA não conseguiu extrair nenhuma questão válida deste PDF.");
      
      setQuestoesExtraidas(data.questoes);
      setStatus("review");
      setMensagem(`Foram encontradas ${data.questoes.length} questões. Por favor, valide os dados antes de gravar no banco.`);
    } catch (err: any) {
      setStatus("error");
      setMensagem(err.message);
    }
  };

  const handleConfirmarSalvar = async () => {
    setStatus("saving");
    setMensagem("A gravar as questões validadas no Supabase...");
    try {
      await gravarListaDeQuestoesNoBanco(questoesExtraidas);
      setStatus("success");
      setMensagem(`Sucesso! ${questoesExtraidas.length} questões foram importadas para o banco.`);
      setQuestoesExtraidas([]);
      setProvaPdf(null);
      setGabaritoPdf(null);
    } catch (err: any) {
      setStatus("error");
      setMensagem("Erro ao guardar no banco: " + err.message);
    }
  };

  return (
    <div 
      className="p-6 rounded-2xl border border-slate-200/50 shadow-sm mb-6"
      style={{ backgroundColor: tema.cartao || '#FFFFFF', color: tema.fonte || 'inherit' }}
    >
      <h3 className="font-bold text-lg mb-1 flex items-center gap-2">
        <Upload className="w-5 h-5 text-indigo-500" />
        Importar PDF com IA (Validação Segura)
      </h3>
      <p className="text-xs mb-5" style={{ opacity: 0.7 }}>
        A IA extrai os dados, você confere no ecrã e só depois guarda no banco de dados.
      </p>

      {status !== "review" && status !== "saving" && (
        <form onSubmit={handleUpload} className="grid sm:grid-cols-2 gap-4 items-end">
          <div>
            <label className="block text-xs font-semibold mb-1" style={{ opacity: 0.8 }}>Caderno de Prova (PDF)</label>
            <input 
              type="file" 
              accept=".pdf" 
              onChange={(e) => setProvaPdf(e.target.files?.[0] || null)} 
              className="w-full text-sm border border-slate-200/40 p-2 rounded-xl"
              style={{ backgroundColor: tema.fundo || '#F8FAFC', color: 'inherit' }} 
            />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1" style={{ opacity: 0.8 }}>Gabarito Oficial (PDF)</label>
            <input 
              type="file" 
              accept=".pdf" 
              onChange={(e) => setGabaritoPdf(e.target.files?.[0] || null)} 
              className="w-full text-sm border border-slate-200/40 p-2 rounded-xl"
              style={{ backgroundColor: tema.fundo || '#F8FAFC', color: 'inherit' }} 
            />
          </div>
          <div className="sm:col-span-2">
            <button 
              type="submit" 
              disabled={status === "loading"} 
              className="w-full bg-indigo-600 text-white font-bold py-2.5 rounded-xl flex justify-center gap-2 hover:bg-indigo-500 disabled:opacity-50 transition-all shadow-sm"
            >
              {status === "loading" ? <><Loader2 className="w-5 h-5 animate-spin" /> A Processar PDFs com IA...</> : "Ler PDF e Gerar Pré-visualização"}
            </button>
          </div>
        </form>
      )}

      {status === "review" && (
        <div className="mt-4 border border-amber-500/30 bg-amber-500/10 rounded-xl p-4">
          <h4 className="font-bold text-amber-500 mb-3 text-sm">Pré-visualização (Ainda não guardado)</h4>
          <div className="max-h-64 overflow-y-auto space-y-3 mb-4 p-3 rounded-lg border border-amber-500/20" style={{ backgroundColor: tema.fundo || '#FFFFFF' }}>
            {questoesExtraidas.map((q, idx) => (
              <div key={idx} className="border-b border-slate-200/30 pb-2 mb-2 last:border-0">
                <span className="text-[10px] font-bold text-indigo-500 uppercase">Q{idx + 1} - {q.banca} - {q.disciplina}</span>
                <p className="text-xs mt-1 line-clamp-2" style={{ opacity: 0.9 }}>{q.enunciado}</p>
                <div className="mt-1 flex gap-2">
                  <span className="text-[10px]" style={{ opacity: 0.6 }}>{q.alternativas?.length || 0} alternativas identificadas.</span>
                </div>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => setStatus("idle")} 
              className="flex-1 py-2 text-xs font-bold border border-current opacity-70 hover:opacity-100 rounded-lg"
              style={{ backgroundColor: 'transparent', color: 'inherit' }}
            >
              Descartar e Tentar Novo PDF
            </button>
            <button 
              onClick={handleConfirmarSalvar} 
              className="flex-1 py-2 text-xs font-bold text-white bg-emerald-600 rounded-lg hover:bg-emerald-500 shadow-sm"
            >
              Validar e Guardar no Banco
            </button>
          </div>
        </div>
      )}

      {mensagem && status !== "review" && (
        <div className={`mt-4 p-3 rounded-xl text-sm font-medium border flex items-center gap-2 ${
          status === "error" ? "bg-rose-500/10 text-rose-500 border-rose-500/30" : 
          status === "success" ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/30" : 
          status === "saving" ? "bg-indigo-500/10 text-indigo-500 border-indigo-500/30" :
          "bg-sky-500/10 text-sky-500 border-sky-500/30"
        }`}>
          {status === "saving" && <Loader2 className="w-4 h-4 animate-spin" />}
          {mensagem}
        </div>
      )}
    </div>
  );
}

// ==========================================
// 6. PÁGINA EXCLUSIVA DO ADMINISTRADOR (/admin)
// ==========================================
export function PainelAdminExclusivo() {
  const tema = useTema(); // Hook
  const SENHA_ADMIN = "admin123";

  const [autenticado, setAutenticado] = useState(false);
  const [senha, setSenha] = useState('');
  const [erroLogin, setErroLogin] = useState(false);

  const [abaAtiva, setAbaAtiva] = useState<'prova_ia' | 'json' | 'ferramentas'>('prova_ia');
  const [salvando, setSalvando] = useState(false);
  const [erroMsg, setErroMsg] = useState('');
  const [sucessoMsg, setSucessoMsg] = useState('');
  const [arquivoJson, setArquivoJson] = useState<File | null>(null);

  useEffect(() => {
    try {
      if (localStorage.getItem('simulado_is_admin') === 'true') {
        setAutenticado(true);
      }
    } catch (e) {}
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (senha === SENHA_ADMIN) {
      localStorage.setItem('simulado_is_admin', 'true');
      setAutenticado(true);
      setErroLogin(false);
    } else {
      setErroLogin(true);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('simulado_is_admin');
    setAutenticado(false);
    setSenha('');
  };

  const handleImportarArquivoJson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!arquivoJson) {
      setErroMsg('Por favor, selecione um ficheiro JSON.');
      return;
    }
    setErroMsg('');
    setSucessoMsg('');
    setSalvando(true);

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const texto = event.target?.result as string;
        const parsed = JSON.parse(texto);
        const listaBruta = Array.isArray(parsed) ? parsed : [parsed];

        // LÓGICA DE TRADUÇÃO DO FREELANCER PARA O SUPABASE
        const listaFormatada = listaBruta.map((q: any) => {
          if (q.Alternativa_A || q.alternativa_a || q.Gabarito || q.gabarito) {
            const gabarito = String(q.Gabarito || q.gabarito || '').trim().toUpperCase();
            const alts = [];
            if (q.Alternativa_A || q.alternativa_a) alts.push({ texto: q.Alternativa_A || q.alternativa_a, is_correta: gabarito === 'A' });
            if (q.Alternativa_B || q.alternativa_b) alts.push({ texto: q.Alternativa_B || q.alternativa_b, is_correta: gabarito === 'B' });
            if (q.Alternativa_C || q.alternativa_c) alts.push({ texto: q.Alternativa_C || q.alternativa_c, is_correta: gabarito === 'C' });
            if (q.Alternativa_D || q.alternativa_d) alts.push({ texto: q.Alternativa_D || q.alternativa_d, is_correta: gabarito === 'D' });
            if (q.Alternativa_E || q.alternativa_e) alts.push({ texto: q.Alternativa_E || q.alternativa_e, is_correta: gabarito === 'E' });

            return {
              banca: q.Banca || q.banca || '',
              orgao: q.Orgao || q.orgao || '',
              ano: q.Ano || q.ano || 0,
              disciplina: q.Disciplina || q.disciplina || q.Assunto || q.assunto || 'Geral',
              assunto: q.Assunto || q.assunto || '',
              enunciado: q.Enunciado || q.enunciado || '',
              explicacao: q.Comentario_Professor || q.comentario_professor || q.Comentario || q.explicacao || '',
              alternativas: alts
            };
          }
          return q;
        });

        await gravarListaDeQuestoesNoBanco(listaFormatada);
        setSucessoMsg(`✅ Lote com ${listaFormatada.length} questões importado com sucesso!`);
        setArquivoJson(null);
      } catch (err: any) {
        setErroMsg('Erro na importação: ' + (err.message || 'Ficheiro inválido.'));
      } finally {
        setSalvando(false);
      }
    };
    reader.readAsText(arquivoJson);
  };

  if (!autenticado) {
    return (
      <div className="min-h-svh flex items-center justify-center p-4" style={{ backgroundColor: tema.fundo || '#F1F5F9', color: tema.fonte || '#0F172A' }}>
        <div className="border border-slate-200/50 rounded-2xl max-w-sm w-full p-6 shadow-lg" style={{ backgroundColor: tema.cartao || '#FFFFFF' }}>
          <h1 className="text-lg font-extrabold" style={{ color: 'inherit' }}>
            Painel Administrativo • Qpro
          </h1>
          <p className="text-xs mt-1 mb-4" style={{ opacity: 0.7 }}>
            Área restrita para gestão do banco de questões
          </p>
          <form onSubmit={handleLogin} className="space-y-3">
            <input
              type="password"
              placeholder="Digite a senha de administrador..."
              value={senha}
              onChange={(e) => {
                setSenha(e.target.value);
                setErroLogin(false);
              }}
              style={{ backgroundColor: tema.fundo || '#FFFFFF', color: 'inherit' }}
              className="w-full px-3.5 py-2.5 border border-slate-300/40 rounded-xl text-sm outline-none focus:border-indigo-600"
            />
            {erroLogin && (
              <p className="text-xs font-semibold text-rose-500">
                Senha incorreta.
              </p>
            )}
            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold"
            >
              Entrar no Painel
            </button>
            <a
              href="/"
              className="block text-center text-xs hover:text-indigo-500 pt-2"
              style={{ opacity: 0.6 }}
            >
              ← Voltar para o aplicativo
            </a>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-svh p-4 sm:p-8" style={{ backgroundColor: tema.fundo || '#F8FAFC', color: tema.fonte || '#0F172A' }}>
      <div className="max-w-3xl mx-auto border border-slate-200/50 rounded-2xl p-6 shadow-xs" style={{ backgroundColor: tema.cartao || '#FFFFFF' }}>
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/30 pb-4 mb-5">
          <div>
            <h1 className="text-xl font-extrabold" style={{ color: 'inherit' }}>
              ⚙️ Painel Administrativo Qpro Concursos
            </h1>
            <p className="text-xs" style={{ opacity: 0.7 }}>
              Importe provas em PDF ou em lote JSON
            </p>
          </div>
          <div className="flex items-center gap-2">
            <a
              href="/"
              className="px-3.5 py-2 rounded-xl border border-current opacity-70 hover:opacity-100 text-xs font-bold"
            >
              ← Ver App do Aluno
            </a>
            <button
              type="button"
              onClick={handleLogout}
              className="px-3.5 py-2 rounded-xl bg-rose-500/10 text-rose-500 border border-rose-500/30 text-xs font-bold hover:bg-rose-500/20"
            >
              Sair
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 mb-5">
          <button
            type="button"
            onClick={() => setAbaAtiva('prova_ia')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              abaAtiva === 'prova_ia'
                ? 'bg-indigo-600 text-white'
                : 'bg-indigo-500/10 text-indigo-500 hover:bg-indigo-500/20'
            }`}
          >
            🤖 Importar PDF (IA)
          </button>

          <button
            type="button"
            onClick={() => setAbaAtiva('json')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              abaAtiva === 'json'
                ? 'bg-indigo-600 text-white'
                : 'bg-indigo-500/10 text-indigo-500 hover:bg-indigo-500/20'
            }`}
          >
            📥 Importar Base Lote (JSON)
          </button>
          <button
            type="button"
            onClick={() => setAbaAtiva('ferramentas')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              abaAtiva === 'ferramentas'
                ? 'bg-indigo-600 text-white'
                : 'bg-indigo-500/10 text-indigo-500 hover:bg-indigo-500/20'
            }`}
          >
            🛠️ Simulador de Cliente
          </button>
        </div>

        {erroMsg && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs font-semibold text-rose-500">
            {erroMsg}
          </div>
        )}

        {sucessoMsg && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs font-semibold text-emerald-500">
            {sucessoMsg}
          </div>
        )}

        {abaAtiva === 'prova_ia' && <ImportadorProvas />}

        {abaAtiva === 'ferramentas' && (
          <div className="space-y-4 p-4 rounded-xl border border-slate-200/30" style={{ backgroundColor: tema.fundo || '#F8FAFC' }}>
            <h3 className="text-sm font-bold" style={{ color: 'inherit' }}>
              Simular Visão do Cliente neste Aparelho
            </h3>
            <p className="text-xs" style={{ opacity: 0.8 }}>
              Use os botões abaixo para alternar sua conta local entre <strong>Visitante Grátis (0 questões usadas)</strong> e <strong>Comprador Vitalício (R$ 47)</strong> sempre que quiser testar o funil:
            </p>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => {
                  localStorage.removeItem('qpro_vitalicio_ativo');
                  localStorage.removeItem('qpro_degustacao_usadas');
                  localStorage.removeItem('historico_simulado');
                  alert('Pronto! Seu navegador agora está como um Visitante Novo (5 questões grátis disponíveis).');
                }}
                className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold"
              >
                🔄 Resetar para Visitante Grátis (5/5)
              </button>

              <button
                type="button"
                onClick={() => {
                  localStorage.setItem('qpro_vitalicio_ativo', 'true');
                  alert('Pronto! Seu navegador agora está com o Acesso Vitalício (👑) ativado.');
                }}
                className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold"
              >
                👑 Ativar Acesso Vitalício neste Aparelho
              </button>
            </div>
          </div>
        )}

        {abaAtiva === 'json' && (
          <form onSubmit={handleImportarArquivoJson} className="flex flex-col gap-4">
            <div className="p-4 border border-slate-200/50 rounded-xl" style={{ backgroundColor: tema.fundo || '#FFFFFF' }}>
              <label className="block text-xs font-bold uppercase mb-2" style={{ opacity: 0.8 }}>
                Selecione o ficheiro JSON convertido
              </label>
              <input
                type="file"
                accept=".json"
                onChange={(e) => setArquivoJson(e.target.files?.[0] || null)}
                style={{ color: 'inherit' }}
                className="w-full text-sm outline-none"
              />
            </div>
            <button
              type="submit"
              disabled={salvando || !arquivoJson}
              className="self-end px-6 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-500 disabled:opacity-50"
            >
              {salvando ? 'A processar e a importar...' : 'Importar Ficheiro JSON'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

// ==========================================
// 7. PERSONALIZADOR DE CORES COM APLICAÇÃO IMEDIATA
// ==========================================
const TEMAS_PRONTOS = [
  { nome: "Gelo Padrão", fundo: "#F8FAFC", cartao: "#FFFFFF", fonte: "#1E293B" },
  { nome: "Papel Creme (Kindle)", fundo: "#F5F2EB", cartao: "#FCFBF7", fonte: "#2C2623" },
  { nome: "Azul Porcelana", fundo: "#EEF4F8", cartao: "#FFFFFF", fonte: "#1E3A5F" },
  { nome: "Verde Suave", fundo: "#EFF6F2", cartao: "#FFFFFF", fonte: "#1B3B2B" },
  { nome: "Modo Noturno", fundo: "#0F172A", cartao: "#1E293B", fonte: "#F1F5F9" },
];

export function SeletorTema() {
  const [aberto, setAberto] = useState(false);
  const [corFundo, setCorFundo] = useState("#F8FAFC");
  const [corCartao, setCorCartao] = useState("#FFFFFF");
  const [corFonte, setCorFonte] = useState("#1E293B");

  useEffect(() => {
    try {
      const salvo = localStorage.getItem("simulado_tema_cores");
      if (salvo) {
        const parsed = JSON.parse(salvo);
        if (parsed.fundo && parsed.cartao && parsed.fonte) {
          setCorFundo(parsed.fundo);
          setCorCartao(parsed.cartao);
          setCorFonte(parsed.fonte);
          document.body.style.backgroundColor = parsed.fundo;
          document.body.style.color = parsed.fonte;
        }
      }
    } catch (e) {}
  }, []);

  const salvarCores = (novoFundo: string, novoCartao: string, novaFonte: string) => {
    setCorFundo(novoFundo);
    setCorCartao(novoCartao);
    setCorFonte(novaFonte);
    try {
      localStorage.setItem(
        "simulado_tema_cores",
        JSON.stringify({ fundo: novoFundo, cartao: novoCartao, fonte: novaFonte })
      );
      document.body.style.backgroundColor = novoFundo;
      document.body.style.color = novaFonte;
      
      // O NOSSO HOOK useTema VAI ESCUTAR ESTE EVENTO E ATUALIZAR TUDO MAGICA E INSTANTANEAMENTE
      window.dispatchEvent(new Event('qpro-tema-alterado'));
    } catch (e) {}
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setAberto(!aberto)}
        className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-current opacity-70 hover:opacity-100 transition-all shadow-2xs active:scale-95"
        title="Personalizar cores de fundo e fonte"
        style={{ backgroundColor: 'transparent', color: 'inherit' }}
      >
        <span>🎨</span>
        <span className="hidden sm:inline">Aparência</span>
      </button>

      {aberto && (
        <div className="absolute right-0 mt-2 w-72 rounded-2xl border border-slate-200/50 shadow-xl z-50 text-slate-800" style={{ backgroundColor: corCartao, color: corFonte }}>
          <div className="flex items-center justify-between border-b border-slate-200/30 pb-2.5 mb-3 p-4 pb-0">
            <span className="text-xs font-bold uppercase tracking-wider" style={{ opacity: 0.7 }}>
              Conforto Visual
            </span>
            <button
              type="button"
              onClick={() => setAberto(false)}
              className="text-xs font-bold hover:opacity-70"
              style={{ color: 'inherit' }}
            >
              ✕
            </button>
          </div>

          <div className="p-4 pt-2">
            <p className="text-xs font-semibold mb-2" style={{ opacity: 0.8 }}>
              Temas de Leitura (1 clique):
            </p>
            <div className="grid grid-cols-1 gap-1.5 mb-4">
              {TEMAS_PRONTOS.map((t) => {
                const selecionado =
                  corFundo.toLowerCase() === t.fundo.toLowerCase() &&
                  corFonte.toLowerCase() === t.fonte.toLowerCase();
                return (
                  <button
                    key={t.nome}
                    type="button"
                    onClick={() => salvarCores(t.fundo, t.cartao, t.fonte)}
                    className={`flex items-center justify-between px-3 py-2 rounded-xl border text-xs font-medium transition-all ${
                      selecionado
                        ? "border-indigo-500 ring-1 ring-indigo-500/30 font-bold"
                        : "border-transparent opacity-80 hover:opacity-100"
                    }`}
                    style={{ backgroundColor: t.fundo, color: t.fonte, borderColor: selecionado ? undefined : 'rgba(0,0,0,0.1)' }}
                  >
                    <span>{t.nome}</span>
                    <div className="flex items-center gap-1">
                      <span className="w-4 h-4 rounded-full border border-black/10" style={{ backgroundColor: t.fundo }} />
                      <span className="w-4 h-4 rounded-full border border-black/10" style={{ backgroundColor: t.cartao }} />
                      <span className="w-4 h-4 rounded-full border border-black/10" style={{ backgroundColor: t.fonte }} />
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="border-t border-slate-200/30 pt-3">
              <p className="text-xs font-semibold mb-2.5" style={{ opacity: 0.8 }}>
                Ou escolha sua própria cor:
              </p>
              <div className="flex flex-col gap-2.5">
                <label className="flex items-center justify-between text-xs font-medium cursor-pointer">
                  <span>Cor do Fundo Geral</span>
                  <input
                    type="color"
                    value={corFundo}
                    onChange={(e) => salvarCores(e.target.value, corCartao, corFonte)}
                    className="w-8 h-7 rounded cursor-pointer border border-slate-200/50"
                  />
                </label>

                <label className="flex items-center justify-between text-xs font-medium cursor-pointer">
                  <span>Cor dos Cartões</span>
                  <input
                    type="color"
                    value={corCartao}
                    onChange={(e) => salvarCores(corFundo, e.target.value, corFonte)}
                    className="w-8 h-7 rounded cursor-pointer border border-slate-200/50"
                  />
                </label>

                <label className="flex items-center justify-between text-xs font-medium cursor-pointer">
                  <span>Cor da Fonte (Texto)</span>
                  <input
                    type="color"
                    value={corFonte}
                    onChange={(e) => salvarCores(corFundo, corCartao, e.target.value)}
                    className="w-8 h-7 rounded cursor-pointer border border-slate-200/50"
                  />
                </label>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}