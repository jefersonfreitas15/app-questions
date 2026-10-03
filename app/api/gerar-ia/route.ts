import { NextResponse } from "next/server";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";

// Gerador Inteligente de Fallback (caso não haja GEMINI_API_KEY configurada)
function gerarQuestoesEstruturadas(
  disciplina: string,
  assunto: string,
  quantidade: number
) {
  const topico = assunto?.trim() || "Conceitos Fundamentais e Jurisprudência";
  const carimbo = new Date().toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const templates = [
    {
      enunciado: `[Questão Inédita IA • ${disciplina}] Acerca de ${topico}, assinale a alternativa que apresenta corretamente o entendimento técnico, normativo e doutrinário aplicável à matéria na Administração Pública:`,
      correta: `A aplicação das normas relativas a ${topico} no âmbito de ${disciplina} exige observância estrita à legalidade, à motivação dos atos e aos parâmetros técnicos consolidados pelos órgãos de controle.`,
      distratores: [
        `A análise de ${topico} prescinde de motivação formal quando realizada em caráter discricionário pela autoridade superior.`,
        `É vedada a revisão de procedimentos atinentes a ${topico} após o decurso do prazo de trinta dias úteis da publicação.`,
        `As diretrizes de ${disciplina} sobre ${topico} possuem natureza meramente orientativa, não vinculando a atuação dos agentes públicos.`,
        `A competência para deliberar sobre ${topico} é exclusiva do Poder Judiciário, inexistindo controle interno ou externo sobre o ato.`,
      ],
      explicacao: `Gabarito Oficial: No estudo de ${disciplina} (${topico}), a atuação técnica e administrativa subordina-se aos princípios da legalidade, motivação, eficiência e controle, sendo incorretas as alternativas que afastam a vinculação normativa ou o controle dos atos.`,
    },
    {
      enunciado: `[Simulado IA • ${disciplina}] No que se refere ao tema "${topico}", avalie as proposições e identifique a assertiva tecnicamente correta segundo as diretrizes vigentes:`,
      correta: `Os critérios técnicos que regem ${topico} em ${disciplina} visam assegurar a rastreabilidade, a fidedignidade das informações e a conformidade com o ordenamento vigente.`,
      distratores: [
        `O registro formal das etapas de ${topico} é facultativo quando não houver impugnação expressa das partes interessadas.`,
        `A responsabilidade técnica na condução de ${topico} é sempre objetiva e solidária entre todos os servidores do órgão, independentemente de dolo ou culpa.`,
        `Inexiste obrigatoriedade de transparência ativa para os dados resultantes da aplicação de ${topico}.`,
        `As normas gerais sobre ${topico} podem ser revogadas por simples despacho interno sem publicidade oficial.`,
      ],
      explicacao: `Gabarito Oficial: Dentro de ${disciplina}, o tema ${topico} é pautado pela rastreabilidade, transparência e conformidade normativa. A responsabilidade de agentes depende da aferição subjetiva (dolo ou erro grosseiro, conforme art. 28 da LINDB), o que invalida as demais opções.`,
    },
    {
      enunciado: `[Treinamento IA • ${disciplina}] Considerando a aplicação prática de ${topico}, assinale a opção que reflete o procedimento adequado exigido nas provas de concursos públicos:`,
      correta: `A validação dos procedimentos relativos a ${topico} deve observar os requisitos formais e materiais previstos na norma de regência de ${disciplina}, garantindo segurança jurídica e eficiência.`,
      distratores: [
        `A celeridade processual autoriza a supressão de etapas obrigatórias de verificação em ${topico}.`,
        `Qualquer divergência técnica em ${topico} acarreta nulidade absoluta insanável, mesmo quando ausente prejuízo ao interesse público.`,
        `O princípio do formalismo moderado impede a correção de vícios meramente formais verificados em ${topico}.`,
        `As normas de ${disciplina} vedam o uso de meios eletrônicos ou automatizados para a execução de ${topico}.`,
      ],
      explicacao: `Gabarito Oficial: Em ${disciplina} (${topico}), deve-se conciliar o cumprimento dos requisitos legais com a segurança jurídica e o princípio do aproveitamento dos atos (pas de nullité sans grief) quando não houver prejuízo.`,
    },
    {
      enunciado: `[Questão Comentada IA • ${disciplina}] Sobre os preceitos fundamentais que norteiam ${topico}, é correto afirmar que:`,
      correta: `A interpretação sistemática de ${topico} no contexto de ${disciplina} harmoniza a eficiência operacional com os mecanismos de governança e integridade.`,
      distratores: [
        `A governança aplicada a ${topico} restringe-se às entidades da administração indireta submetidas ao regime privado.`,
        `Os mecanismos de controle preventivo não se aplicam às rotinas de ${topico}, cabendo apenas fiscalização a posteriori.`,
        `A normatização de ${topico} dispensa revisão periódica ou atualização frente a novas exigências legais.`,
        `O descumprimento de prazos operacionais em ${topico} extingue automaticamente a competência do órgão administrativo.`,
      ],
      explicacao: `Gabarito Oficial: A governança, o controle preventivo e a eficiência permeiam toda a aplicação de ${topico} em ${disciplina}, sendo que prazos impróprios na Administração, em regra, não extinguem automaticamente a competência do órgão.`,
    },
    {
      enunciado: `[Desafio IA (${carimbo}) • ${disciplina}] Em relação aos aspectos técnicos e conceituais de ${topico}, assinale a alternativa correta:`,
      correta: `O domínio dos parâmetros de ${topico} em ${disciplina} permite identificar distorções operacionais e assegurar a regularidade e a economicidade dos procedimentos.`,
      distratores: [
        `A economicidade é um critério estranho à análise de ${topico}, que deve ater-se unicamente ao aspecto formal.`,
        `A delegação de atividades técnicas ligadas a ${topico} é vedada em qualquer hipótese, mesmo quando não houver reserva legal de exclusividade.`,
        `Os pareceres técnicos emitidos sobre ${topico} possuem caráter vinculante absoluto para todas as esferas de governo.`,
        `A padronização de rotinas em ${topico} viola o princípio da eficiência administrativa.`,
      ],
      explicacao: `Gabarito Oficial: Em ${disciplina}, a análise de ${topico} engloba tanto a legalidade formal quanto a legitimidade, economicidade e eficiência, exatamente como preconizado na Constituição Federal e nas normas técnicas aplicáveis.`,
    },
  ];

  return templates.slice(0, quantidade).map((tpl, i) => {
    // Embaralha a posição da alternativa correta
    const opcoes = [
      { texto: tpl.correta, is_correta: true },
      ...tpl.distratores.map((d) => ({ texto: d, is_correta: false })),
    ].sort(() => Math.random() - 0.5);

    return {
      banca: "Qpro IA",
      orgao: "Simulado Inteligente",
      ano: new Date().getFullYear(),
      disciplina,
      assunto: topico,
      enunciado: tpl.enunciado,
      explicacao: tpl.explicacao,
      alternativas: opcoes,
    };
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const disciplina = (body.disciplina || "Direito Administrativo").trim();
    const assunto = (body.assunto || "").trim();
    const quantidade = Math.min(Math.max(Number(body.quantidade) || 5, 1), 5);

    if (GEMINI_API_KEY) {
      const prompt = `Você é uma banca examinadora de concursos públicos de alto nível.
Gere exatamente ${quantidade} questões inéditas de múltipla escolha (5 alternativas cada, apenas 1 correta) sobre a disciplina "${disciplina}"${
        assunto ? ` e o assunto específico "${assunto}"` : ""
      }.
Retorne APENAS um JSON válido no formato de array abaixo, sem blocos markdown:
[
  {
    "banca": "Qpro IA",
    "orgao": "Simulado Inteligente",
    "ano": 2026,
    "disciplina": "${disciplina}",
    "assunto": "${assunto || "Conteúdo Programático Geral"}",
    "enunciado": "Texto completo e técnico do enunciado...",
    "explicacao": "Fundamentação detalhada do professor explicando o gabarito...",
    "alternativas": [
      { "texto": "Texto da alternativa A", "is_correta": false },
      { "texto": "Texto da alternativa B", "is_correta": true },
      { "texto": "Texto da alternativa C", "is_correta": false },
      { "texto": "Texto da alternativa D", "is_correta": false },
      { "texto": "Texto da alternativa E", "is_correta": false }
    ]
  }
]`;

      const resp = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { responseMimeType: "application/json" },
          }),
        }
      );

      // 1. Se o Google recusar a chave ou der erro, forçamos o sistema a mostrar o motivo
      if (!resp.ok) {
        const erroGoogle = await resp.text();
        throw new Error(`Bloqueio do Google (Status ${resp.status}): ${erroGoogle}`);
      }

      const data = await resp.json();
      const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
      
      // 2. Limpamos qualquer formatação de código Markdown (```json) que o Gemini teime em enviar
      const cleanText = rawText.replace(/```json/g, "").replace(/```/g, "").trim();
      
      let parsed;
      try {
        parsed = JSON.parse(cleanText);
      } catch (e) {
        throw new Error("O Gemini devolveu um texto que não é JSON válido: " + cleanText);
      }

      if (Array.isArray(parsed) && parsed.length > 0) {
        return NextResponse.json({ questoes: parsed.slice(0, quantidade) });
      } else {
        throw new Error("O Gemini devolveu uma lista vazia.");
      }
    }

    // 3. Se a chave não existir na Vercel, o sistema vai avisar em vez de gerar repetidas
    throw new Error("A chave GEMINI_API_KEY não está a ser reconhecida pelo servidor da Vercel.");
    
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Erro desconhecido na geração com IA" },
      { status: 500 }
    );
  }
}