import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const envFile = fs.readFileSync('.env.local', 'utf-8');
const env = Object.fromEntries(
  envFile
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith('#'))
    .map((line) => {
      const idx = line.indexOf('=');
      return [line.slice(0, idx).trim(), line.slice(idx + 1).trim().replace(/^['"]|['"]$/g, '')];
    })
);

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

const BANCAS = [
  'CEBRASPE',
  'FGV',
  'FCC',
  'VUNESP',
  'CESGRANRIO',
  'IBFC',
  'IDECAN',
  'INSTITUTO AOCP',
  'QUADRIX',
  'CONSULPLAN',
];

const ANOS = [2021, 2022, 2023, 2024, 2025, 2026];

function embaralhar(arr) {
  const copia = [...arr];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}

const ABERTURAS = [
  'Na avaliação técnica conduzida pela equipe multiprofissional,',
  'Durante a análise de conformidade normativa aplicada ao setor,',
  'Ao examinar os protocolos oficiais e a legislação vigente,',
  'Em vistoria técnica realizada para emissão de laudo especializado,',
  'No planejamento operacional das atividades da unidade,',
  'Ao revisar os procedimentos técnicos exigidos pelas normas regulamentadoras,',
  'Na condução técnica de um caso prático submetido à equipe,',
  'Durante o treinamento técnico-profissional dos agentes da carreira,',
  'Ao verificar a aplicação prática das diretrizes oficiais da área,',
  'Em sede de perícia e parecer técnico especializado,',
  'Na supervisão direta das rotinas operacionais do serviço,',
  'Ao conferir os parâmetros técnicos estabelecidos na regulamentação,',
  'Na elaboração do plano de ação técnico da coordenadoria,',
  'Durante a auditoria de qualidade e segurança dos procedimentos,',
  'Ao interpretar os requisitos normativos aplicáveis à profissão,',
  'No atendimento às normas técnicas brasileiras e diretrizes institucionais,',
  'Na instrução técnica voltada à tomada de decisão estratégica,',
  'Ao confrontar os indicadores operacionais com os padrões oficiais,',
  'Na definição das condutas técnicas prioritárias da equipe,',
  'Durante a verificação de regularidade técnica dos processos internos,',
];

const CONTEXTOS = [
  'constatou-se a obrigatoriedade de seguir rigorosamente os preceitos técnicos da área.',
  'Debateu-se a correta aplicação dos critérios científicos e normativos vigentes.',
  'identificou-se que a eficácia da medida depende do respeito aos protocolos oficiais.',
  'foi exigido o domínio conceitual das regras específicas que regem a matéria.',
  'evidenciou-se a necessidade de distinguir corretamente os institutos aplicáveis.',
  'verificou-se que a conduta profissional deve observar os parâmetros legais estritos.',
  'destacou-se a relevância de adotar o procedimento técnico padronizado.',
  'analisaram-se os requisitos formais e materiais indispensáveis à atuação.',
  'ponderou-se acerca das responsabilidades técnicas e legais envolvidas no caso.',
  'buscou-se alinhar a atuação prática às diretrizes nacionais consolidadas.',
  'registrou-se que a segurança do procedimento exige observância às normas técnicas.',
  'avaliou-se o impacto técnico das medidas adotadas sobre o resultado final.',
  'apontou-se a necessidade de fundamentar a intervenção nos referenciais da área.',
  'confirmou-se que a legislação específica estabelece regras próprias para a situação.',
  'examinou-se a adequação das práticas operacionais aos padrões de excelência.',
  'delimitou-se o escopo de atuação profissional segundo as normas do conselho e da lei.',
  'reforçou-se a exigência de cumprimento integral das etapas técnicas previstas.',
  'procedeu-se à análise detalhada das variáveis técnicas que influenciam o caso.',
  'questionou-se qual seria a diretriz correta diante do quadro apresentado.',
  'estabeleceu-se como prioridade a adoção da conduta tecnicamente respaldada.',
];

const COMANDOS = [
  'Considerando essas informações, assinale a alternativa correta:',
  'Acerca dessa temática, marque a opção tecnicamente correta:',
  'Diante do exposto, identifique a afirmativa integralmente válida:',
  'Com base nas normas e conceitos aplicáveis, assinale a opção correta:',
  'À luz das diretrizes oficiais sobre o tema, escolha a alternativa correta:',
  'Tendo em vista a doutrina e a legislação da área, marque a assertiva correta:',
  'Sobre os aspectos técnicos envolvidos, assinale a proposição verdadeira:',
  'De acordo com os referenciais vigentes, assinale a alternativa adequada:',
];

// ============================================================================
// MATRIZ MULTIÁREAS (SAÚDE, ENGENHARIA, ARQUITETURA, MILITAR/POLICIAL, FISCAL, BANCÁRIA, EDUCAÇÃO)
// ============================================================================
const TEMAS_MULTIAREAS = [
  // 1. ÁREA DA SAÚDE
  {
    disciplina: 'Saúde - Legislação do SUS e Saúde Pública',
    assunto: 'Lei Orgânica da Saúde (Leis 8.080/1990 e 8.142/1990)',
    orgaos: ['EBSERH', 'MINISTÉRIO DA SAÚDE', 'SESAU', 'SEMUSA', 'FIOCRUZ', 'ANVISA'],
    perguntaBase: 'Quanto aos princípios, diretrizes e instâncias colegiadas do Sistema Único de Saúde (SUS),',
    explicacao:
      'Segundo a Lei nº 8.142/1990, o Conselho de Saúde tem caráter permanente e deliberativo, com composição paritária de 50% de usuários, 25% de trabalhadores da saúde e 25% de gestores e prestadores de serviços.',
    alternativas: [
      { texto: 'O Conselho de Saúde possui caráter permanente e deliberativo, atuando na formulação de estratégias e no controle da execução da política de saúde, inclusive nos aspectos econômicos e financeiros.', is_correta: true },
      { texto: 'A Conferência de Saúde reúne-se mensalmente por convocação exclusiva do Poder Legislativo para aprovar a folha de pagamento hospitalar.', is_correta: false },
      { texto: 'A participação da iniciativa privada no SUS ocorre de forma substitutiva e prioritária em relação aos hospitais públicos.', is_correta: false },
      { texto: 'O princípio da integralidade veda a realização de ações preventivas e de vigilância epidemiológica na atenção primária.', is_correta: false },
      { texto: 'Os recursos do Fundo Nacional de Saúde somente podem ser repassados mediante convênios individuais, sendo vedado o repasse fundo a fundo.', is_correta: false },
    ],
  },
  {
    disciplina: 'Saúde - Enfermagem',
    assunto: 'Sistematização da Assistência de Enfermagem (SAE) e Biossegurança',
    orgaos: ['EBSERH', 'SESAU', 'SEMUSA', 'HOSPITAL DAS CLÍNICAS', 'COREN', 'SARAH'],
    perguntaBase: 'No que se refere ao Processo de Enfermagem, à segurança do paciente e às normas de biossegurança hospitalar,',
    explicacao:
      'O Processo de Enfermagem organiza-se em cinco etapas inter-relacionadas, interdependentes e recorrentes: Avaliação (Coleta de dados), Diagnóstico, Planejamento, Implementação e Evolução de Enfermagem, sendo o Diagnóstico e a Prescrição de Enfermagem privativos do Enfermeiro.',
    alternativas: [
      { texto: 'O Diagnóstico de Enfermagem e a Prescrição da Assistência de Enfermagem constituem atribuições privativas do Enfermeiro dentro da equipe.', is_correta: true },
      { texto: 'A etapa de Evolução de Enfermagem precede a coleta de dados e dispensa o registro formal no prontuário do paciente.', is_correta: false },
      { texto: 'As precauções para aerossóis em pacientes com suspeita de tuberculose pulmonar exigem apenas o uso de luvas de procedimento, dispensando máscara N95/PFF2.', is_correta: false },
      { texto: 'A administração de medicamentos de alta vigilância prescinde da dupla checagem e da confirmação dos nove certos da medicação.', is_correta: false },
      { texto: 'O descarte de materiais perfurocortantes deve ser realizado em sacos plásticos brancos leitosos até atingir a borda superior.', is_correta: false },
    ],
  },
  {
    disciplina: 'Saúde - Medicina e Clínica Médica',
    assunto: 'Urgências, Emergências e Vigilância Epidemiológica',
    orgaos: ['EBSERH', 'SESAU', 'SEMUSA', 'SAMU', 'PERÍCIA MÉDICA', 'TJ'],
    perguntaBase: 'No manejo clínico de urgências médicas e nas regras de notificação compulsória de doenças e agravos,',
    explicacao:
      'A notificação compulsória imediata deve ser realizada pelo profissional de saúde em até 24 horas a partir do conhecimento da ocorrência de doença, agravo ou evento de saúde pública constante na lista nacional.',
    alternativas: [
      { texto: 'A notificação compulsória imediata de agravos de relevância epidemiológica deve ser efetuada em até 24 horas a partir da suspeita clínica inicial.', is_correta: true },
      { texto: 'A notificação compulsória somente pode ser emitida após a confirmação laboratorial definitiva por biologia molecular.', is_correta: false },
      { texto: 'No choque anafilático grave, a medicação de primeira linha para reversão imediata do quadro é o antibiótico betalactâmico por via oral.', is_correta: false },
      { texto: 'O sigilo médico impede o preenchimento da declaração de óbito e a notificação de doenças infectocontagiosas às autoridades sanitárias.', is_correta: false },
      { texto: 'Na parada cardiorrespiratória em ritmo de fibrilação ventricular, a desfibrilação elétrica é formalmente contraindicada.', is_correta: false },
    ],
  },
  {
    disciplina: 'Saúde - Farmácia e Bioquímica',
    assunto: 'Farmacologia, Assistência Farmacêutica e Controle de Qualidade',
    orgaos: ['EBSERH', 'ANVISA', 'SESAU', 'FIOCRUZ', 'HEMOCENTRO', 'CRF'],
    perguntaBase: 'Sobre o Ciclo da Assistência Farmacêutica, a farmacocinética clínica e o controle sanitário de medicamentos sujeitos a controle especial (Portaria SVS/MS nº 344/1998),',
    explicacao:
      'A seleção de medicamentos é a etapa inicial e estruturante do ciclo da assistência farmacêutica, baseando-se na Relação Nacional de Medicamentos Essenciais (RENAME) e em critérios de eficácia, segurança e custo-efetividade.',
    alternativas: [
      { texto: 'A seleção de medicamentos constitui o eixo orientador do ciclo da assistência farmacêutica, fundamentando-se em critérios epidemiológicos, de eficácia e de segurança.', is_correta: true },
      { texto: 'O efeito de primeira passagem hepática ocorre exclusivamente em fármacos administrados por via intravenosa direta.', is_correta: false },
      { texto: 'A Notificação de Receita "A" (cor amarela) destina-se à prescrição de antibióticos tópicos de venda livre.', is_correta: false },
      { texto: 'A biodisponibilidade de um fármaco corresponde à velocidade de sua excreção renal inalterada após trinta dias.', is_correta: false },
      { texto: 'Medicamentos termolábeis devem ser armazenados em estufas aquecidas a 45 °C para evitar cristalização.', is_correta: false },
    ],
  },

  // 2. ENGENHARIA E ARQUITETURA
  {
    disciplina: 'Engenharia Civil',
    assunto: 'Planejamento, Orçamento de Obras Públicas (SINAPI / BDI) e Estruturas',
    orgaos: ['DNIT', 'PETROBRAS', 'TCE', 'TCU', 'CREA', 'SEOSP', 'CAIXA'],
    perguntaBase: 'Na elaboração de orçamentos de obras públicas, cálculo de Benefícios e Despesas Indiretas (BDI) e fiscalização da execução de estruturas de concreto armado (NBR 6118),',
    explicacao:
      'Na orçamentação de obras públicas (Decreto nº 7.983/2013 e jurisprudência do TCU - Acórdão 2.622/2013), o custo global de referência de obras e serviços de engenharia é obtido a partir das composições do SINAPI ou SICRO, acrescido do percentual de BDI, sendo vedada a inclusão de tributos pessoais diretos como IRPJ e CSLL na composição do BDI.',
    alternativas: [
      { texto: 'É vedada a inclusão do Imposto de Renda Pessoa Jurídica (IRPJ) e da Contribuição Social sobre o Lucro Líquido (CSLL) na fórmula de cálculo do BDI de obras públicas.', is_correta: true },
      { texto: 'A administração local da obra e o canteiro de obras devem compor obrigatoriamente a taxa de lucro líquido do BDI, jamais a planilha de custos diretos.', is_correta: false },
      { texto: 'O ensaio de abatimento do tronco de cone (Slump Test) mede a resistência final à tração do aço após vinte e oito dias de cura.', is_correta: false },
      { texto: 'A cura úmida do concreto estrutural tem por finalidade acelerar a evaporação precoce da água de amassamento nas primeiras horas.', is_correta: false },
      { texto: 'Na curva ABC de insumos de uma obra, a faixa A representa os itens de menor relevância financeira no orçamento global.', is_correta: false },
    ],
  },
  {
    disciplina: 'Arquitetura e Urbanismo',
    assunto: 'Acessibilidade (NBR 9050), Projeto Arquitetônico e Conforto Ambiental',
    orgaos: ['CAU', 'IPHAN', 'PREFEITURA', 'TCE', 'TJ', 'MINISTÉRIO DAS CIDADES'],
    perguntaBase: 'De acordo com a norma técnica ABNT NBR 9050 (Acessibilidade a edificações, mobiliário, espaços e equipamentos urbanos) e os princípios de conforto ambiental,',
    explicacao:
      'Conforme a ABNT NBR 9050, o módulo de referência (M.R.) considera a projeção de 0,80 m por 1,20 m no piso, ocupada por uma pessoa utilizando cadeira de rodas motorizada ou não, e a largura mínima para deslocamento em linha reta de uma cadeira de rodas é de 0,90 m.',
    alternativas: [
      { texto: 'Considera-se o módulo de referência (M.R.) a projeção de 0,80 m por 1,20 m no piso, referente ao espaço ocupado por uma pessoa em cadeira de rodas.', is_correta: true },
      { texto: 'A inclinação longitudinal máxima permitida para que uma superfície seja considerada rampa acessível sem restrições é de 25%.', is_correta: false },
      { texto: 'Portas de sanitários acessíveis devem ter vão livre mínimo de 0,50 m e abrir exclusivamente para o interior do boxe.', is_correta: false },
      { texto: 'A ventilação cruzada em projetos arquitetônicos ocorre quando todas as aberturas estão situadas na mesma fachada sem saída oposta.', is_correta: false },
      { texto: 'O Estatuto da Cidade (Lei nº 10.257/2001) dispensa a elaboração de Plano Diretor para municípios com mais de cem mil habitantes.', is_correta: false },
    ],
  },
  {
    disciplina: 'Engenharia Elétrica',
    assunto: 'Instalações Elétricas de Baixa Tensão (NBR 5410), Potência e Proteção',
    orgaos: ['PETROBRAS', 'ELETROBRAS', 'ENERGISA', 'ANEEL', 'CREA', 'ITAIPU'],
    perguntaBase: 'Segundo as prescrições da norma ABNT NBR 5410 (Instalações elétricas de baixa tensão) e os conceitos de fator de potência em sistemas trifásicos,',
    explicacao:
      'De acordo com a NBR 5410, o uso de dispositivo diferencial-residual (DR) de alta sensibilidade (corrente diferencial-residual nominal igual ou inferior a 30 mA) é obrigatório para proteção complementar contra choques elétricos em circuitos que sirvam a locais contendo banheira ou chuveiro e tomadas em áreas externas ou molhadas.',
    alternativas: [
      { texto: 'É obrigatória a proteção complementar por dispositivo diferencial-residual (DR) de alta sensibilidade (até 30 mA) em circuitos que atendam a locais com chuveiro ou áreas molhadas.', is_correta: true },
      { texto: 'A correção de um baixo fator de potência indutivo em instalações industriais é realizada instalando-se reatores indutivos em série com a carga.', is_correta: false },
      { texto: 'O condutor de proteção (PE - terra) deve ter isolamento exclusivamente na cor vermelha ou preta, podendo ser seccionado por disjuntores monopolares.', is_correta: false },
      { texto: 'A potência ativa de um circuito elétrico é medida em volt-ampère reativo (VAr) e representa a energia que não realiza trabalho útil.', is_correta: false },
      { texto: 'Em sistemas de aterramento do tipo TN-S, o condutor neutro e o condutor de proteção são combinados em um único cabo ao longo de toda a instalação.', is_correta: false },
    ],
  },

  // 3. CARREIRA MILITAR E POLICIAL
  {
    disciplina: 'Carreira Militar - Direito Penal Militar e Regulamentos',
    assunto: 'Código Penal Militar (Decreto-Lei 1.001/1969), Hierarquia e Disciplina',
    orgaos: ['PM', 'CBM', 'EXÉRCITO (EsFCEx)', 'MARINHA', 'AERONÁUTICA', 'STM'],
    perguntaBase: 'À luz do Código Penal Militar (Decreto-Lei nº 1.001/1969) e dos pilares constitucionais da hierarquia e da disciplina nas instituições militares,',
    explicacao:
      'Nos termos do art. 9º do Código Penal Militar (com as alterações da Lei nº 13.491/2017) e da Constituição Federal, consideram-se crimes militares em tempo de paz não apenas os previstos exclusivamente no CPM, mas também os previstos na legislação penal comum quando praticados nas hipóteses legais do referido artigo (crimes militares por extensão).',
    alternativas: [
      { texto: 'Os crimes previstos na legislação penal comum, quando praticados por militar em serviço ou atuando em razão da função, passam a ser considerados crimes militares por extensão.', is_correta: true },
      { texto: 'O crime militar de deserção consuma-se imediatamente após duas horas de atraso do militar na apresentação ao quartel.', is_correta: false },
      { texto: 'No Direito Penal Militar, a embriaguez voluntária ou culposa constitui causa obrigatória de isenção total de pena.', is_correta: false },
      { texto: 'A insubordinação caracteriza-se exclusivamente quando um oficial superior recusa-se a cumprir ordem de um subordinado hierárquico.', is_correta: false },
      { texto: 'Aos militares em serviço ativo é constitucionalmente assegurado o direito de sindicalização e de greve.', is_correta: false },
    ],
  },
  {
    disciplina: 'Carreira Policial - Direito Penal e Processual Penal',
    assunto: 'Inquérito Policial, Prisões e Teoria do Crime',
    orgaos: ['POLÍCIA FEDERAL', 'PRF', 'POLÍCIA CIVIL', 'POLÍCIA PENAL', 'PM', 'SENAPPEN'],
    perguntaBase: 'No que concerne às características do Inquérito Policial, às espécies de prisão cautelar e às excludentes de ilicitude no Código Penal,',
    explicacao:
      'O inquérito policial é procedimento administrativo informativo, escrito, sigiloso, inquisitivo e indisponível (a autoridade policial não pode mandar arquivar autos de inquérito, nos termos do art. 17 do CPP). Além disso, conforme a Súmula Vinculante nº 14 do STF, é direito do defensor ter acesso amplo aos elementos de prova já documentados nos autos.',
    alternativas: [
      { texto: 'O inquérito policial possui natureza inquisitiva e indisponível, sendo vedado à autoridade policial determinar de ofício o seu arquivamento.', is_correta: true },
      { texto: 'A prisão temporária pode ser decretada de ofício pelo juiz em qualquer infração penal de menor potencial ofensivo.', is_correta: false },
      { texto: 'Na legítima defesa, a lei penal autoriza o uso imoderado de meios letais mesmo após a cessação completa da agressão injusta.', is_correta: false },
      { texto: 'A falta de exibição de mandado judicial impede a realização de prisão em flagrante delito no interior de via pública.', is_correta: false },
      { texto: 'O sigilo do inquérito policial é absoluto e oponível inclusive ao advogado constituído quanto às diligências já documentadas nos autos.', is_correta: false },
    ],
  },

  // 4. ÁREAS FISCAL, BANCÁRIA E EDUCAÇÃO
  {
    disciplina: 'Direito Tributário e Legislação Fiscal',
    assunto: 'Sistema Tributário Nacional, Limitações ao Poder de Tributar e CTN',
    orgaos: ['RECEITA FEDERAL', 'SEFIN', 'SEFAZ', 'ISS', 'TCE', 'PGFN'],
    perguntaBase: 'Acerca das limitações constitucionais ao poder de tributar (princípios e imunidades tributárias) e do crédito tributário no Código Tributário Nacional,',
    explicacao:
      'De acordo com o art. 150, VI da CF/88, a imunidade recíproca veda à União, aos Estados, ao Distrito Federal e aos Municípios instituir impostos sobre patrimônio, renda ou serviços, uns dos outros, estendendo-se às autarquias e às fundações instituídas e mantidas pelo poder público no que se refere às suas finalidades essenciais.',
    alternativas: [
      { texto: 'A imunidade tributária recíproca impede a cobrança de impostos sobre o patrimônio, a renda ou os serviços dos entes federativos, sendo extensiva às autarquias e fundações públicas.', is_correta: true },
      { texto: 'A imunidade recíproca abrange todas as espécies tributárias, exonerando os entes públicos também do pagamento de taxas e contribuições de melhoria.', is_correta: false },
      { texto: 'O Imposto sobre Produtos Industrializados (IPI) submete-se integralmente ao princípio da anterioridade anual, não podendo ser alterado no mesmo exercício.', is_correta: false },
      { texto: 'A moratória e o depósito do montante integral extinguem definitivamente o crédito tributário sem possibilidade de revisão.', is_correta: false },
      { texto: 'A instituição de empréstimos compulsórios pela União pode ser feita por meio de decreto presidencial autônomo.', is_correta: false },
    ],
  },
  {
    disciplina: 'Conhecimentos Bancários',
    assunto: 'Sistema Financeiro Nacional (SFN), Política Monetária e Produtos Bancários',
    orgaos: ['BANCO DO BRASIL', 'CAIXA ECONÔMICA', 'BACEN', 'BNDES', 'BANRISUL', 'BASA'],
    perguntaBase: 'Sobre a estrutura do Sistema Financeiro Nacional (SFN), as atribuições do Conselho Monetário Nacional (CMN) e do Banco Central do Brasil (BACEN),',
    explicacao:
      'O Conselho Monetário Nacional (CMN) é o órgão máximo e estritamente normativo do Sistema Financeiro Nacional, não desempenhando funções executivas. Já o Banco Central do Brasil (BACEN) é a autarquia federal supervisora e executora das diretrizes traçadas pelo CMN.',
    alternativas: [
      { texto: 'O Conselho Monetário Nacional (CMN) é o órgão máximo normativo do Sistema Financeiro Nacional, cabendo ao Banco Central do Brasil atuar como entidade supervisora e executora.', is_correta: true },
      { texto: 'Compete à Comissão de Valores Mobiliários (CVM) emitir papel-moeda e definir a meta da taxa básica de juros (Selic).', is_correta: false },
      { texto: 'Os bancos comerciais são instituições financeiras não monetárias impedidas de captar depósitos à vista.', is_correta: false },
      { texto: 'No sistema PIX, a liquidação financeira das transações ocorre exclusivamente em dias úteis comerciais após vinte e quatro horas.', is_correta: false },
      { texto: 'A lavagem de dinheiro inicia-se pela fase de integração, seguida da ocultação e, por último, da colocação.', is_correta: false },
    ],
  },
  {
    disciplina: 'Educação - Conhecimentos Pedagógicos e LDB',
    assunto: 'Lei de Diretrizes e Bases da Educação Nacional (Lei 9.394/1996)',
    orgaos: ['SEDUC', 'SEMED', 'IFRO', 'MEC', 'INEP', 'FNDE'],
    perguntaBase: 'De acordo com a Lei nº 9.394/1996 (Lei de Diretrizes e Bases da Educação Nacional - LDB), quanto à organização da Educação Básica no Brasil,',
    explicacao:
      'Conforme o art. 4º, I da LDB (Lei nº 9.394/1996), a educação básica obrigatória e gratuita vai dos 4 (quatro) aos 17 (dezessete) anos de idade, organizada em pré-escola, ensino fundamental e ensino médio, com carga horária mínima anual de 800 horas distribuídas por um mínimo de 200 dias de efetivo trabalho escolar.',
    alternativas: [
      { texto: 'A educação básica obrigatória e gratuita é assegurada dos 4 aos 17 anos de idade, organizada nas etapas de pré-escola, ensino fundamental e ensino médio.', is_correta: true },
      { texto: 'A carga horária mínima anual do ensino fundamental regular é de 400 horas, distribuídas em 120 dias letivos.', is_correta: false },
      { texto: 'A educação infantil tem por objetivo a aprovação em exames classificatórios para promoção ao primeiro ano do ensino fundamental.', is_correta: false },
      { texto: 'Compete prioritariamente aos Municípios ofertar com exclusividade o ensino superior e a pós-graduação stricto sensu.', is_correta: false },
      { texto: 'A gestão democrática do ensino público veda a participação da comunidade escolar e local em conselhos escolares.', is_correta: false },
    ],
  },
];

function construirQuestaoMultiarea(indiceGlobal) {
  const numTemas = TEMAS_MULTIAREAS.length;
  const numAberturas = ABERTURAS.length;
  const numContextos = CONTEXTOS.length;
  const numComandos = COMANDOS.length;

  const tIdx = indiceGlobal % numTemas;
  const aIdx = Math.floor(indiceGlobal / numTemas) % numAberturas;
  const cIdx = Math.floor(indiceGlobal / (numTemas * numAberturas)) % numContextos;
  const mIdx = Math.floor(indiceGlobal / (numTemas * numAberturas * numContextos)) % numComandos;

  const tema = TEMAS_MULTIAREAS[tIdx];
  const enunciado = `${ABERTURAS[aIdx]} ${CONTEXTOS[cIdx]} ${tema.perguntaBase} ${COMANDOS[mIdx]}`;

  // 70% das questões recebem Banca, Órgão da Carreira e Ano; 30% ficam apenas com a Disciplina
  const temBancaEAno = indiceGlobal % 10 < 7;
  const banca = temBancaEAno ? BANCAS[indiceGlobal % BANCAS.length] : '';
  const orgao = temBancaEAno ? tema.orgaos[indiceGlobal % tema.orgaos.length] : '';
  const ano = temBancaEAno ? ANOS[indiceGlobal % ANOS.length] : 0;

  return {
    banca,
    orgao,
    ano,
    disciplina: tema.disciplina,
    assunto: tema.assunto,
    enunciado,
    explicacao: tema.explicacao,
    alternativas: embaralhar(tema.alternativas),
  };
}

async function gravarBlocoNoSupabase(lote) {
  const payloadQuestoes = lote.map((q) => ({
    banca: q.banca,
    orgao: q.orgao,
    ano: q.ano,
    disciplina: q.disciplina,
    assunto: q.assunto,
    enunciado: q.enunciado,
    explicacao: q.explicacao,
  }));

  const { data: inseridas, error: errQ } = await supabase
    .from('questoes')
    .insert(payloadQuestoes)
    .select('id');

  if (errQ) throw new Error(errQ.message);

  const todasAlts = [];
  inseridas.forEach((row, idx) => {
    lote[idx].alternativas.forEach((alt) => {
      todasAlts.push({
        questao_id: row.id,
        texto: alt.texto,
        is_correta: alt.is_correta,
      });
    });
  });

  for (let i = 0; i < todasAlts.length; i += 1000) {
    const { error: errA } = await supabase.from('alternativas').insert(todasAlts.slice(i, i + 1000));
    if (errA) throw new Error(errA.message);
  }
}

async function main() {
  console.log('🚀 Adicionando +10.000 questões Multiáreas (Saúde, Engenharia, Arquitetura, Militar/Policial, Fiscal, Bancária e Educação)...');
  const TAMANHO_LOTE = 250;
  const TOTAL_NOVAS = 10000;
  const enunciadosGerados = new Set();

  let cursor = 0;
  for (let inseridas = 0; inseridas < TOTAL_NOVAS; inseridas += TAMANHO_LOTE) {
    const lote = [];
    while (lote.length < TAMANHO_LOTE && inseridas + lote.length < TOTAL_NOVAS) {
      const q = construirQuestaoMultiarea(cursor++);
      if (!enunciadosGerados.has(q.enunciado)) {
        enunciadosGerados.add(q.enunciado);
        lote.push(q);
      }
    }
    await gravarBlocoNoSupabase(lote);
    console.log(`🌟 Multiáreas + Novas Bancas (CEBRASPE, CESGRANRIO, IDECAN...): ${Math.min(inseridas + TAMANHO_LOTE, TOTAL_NOVAS)} / ${TOTAL_NOVAS} adicionadas`);
  }

  console.log('🎉 SUCESSO! +10.000 questões de todas as áreas adicionadas ao seu banco!');
}

main().catch((e) => console.error('❌ Erro:', e));