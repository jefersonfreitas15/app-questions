export type Alternative = {
  id: string
  label: string
  text: string
}

export type Question = {
  id: number
  banca: string
  orgao: string
  ano: string
  disciplina: string
  assunto: string
  enunciado: string
  alternatives: Alternative[]
  correctId: string
  comentario: string
}

export const filterOptions = {
  banca: ["CESPE/CEBRASPE", "FGV", "FCC", "VUNESP", "IBFC"],
  orgao: ["Tribunal de Justiça", "Polícia Federal", "INSS", "Receita Federal", "TRT"],
  ano: ["2026", "2025", "2024", "2023", "2022"],
  disciplina: ["Direito Constitucional", "Direito Administrativo", "Português", "Raciocínio Lógico", "Informática"],
  assunto: [
    "Princípios Fundamentais",
    "Direitos e Garantias",
    "Organização do Estado",
    "Controle de Constitucionalidade",
    "Poder Legislativo",
  ],
} as const

export const questions: Question[] = [
  {
    id: 1,
    banca: "CESPE/CEBRASPE",
    orgao: "Tribunal de Justiça",
    ano: "2025",
    disciplina: "Direito Constitucional",
    assunto: "Direitos e Garantias Fundamentais",
    enunciado:
      "Acerca dos direitos e garantias fundamentais previstos na Constituição Federal de 1988, assinale a alternativa correta a respeito da aplicabilidade das normas definidoras desses direitos.",
    alternatives: [
      {
        id: "a",
        label: "A",
        text: "As normas definidoras dos direitos e garantias fundamentais têm aplicação apenas após regulamentação por lei ordinária específica.",
      },
      {
        id: "b",
        label: "B",
        text: "As normas definidoras dos direitos e garantias fundamentais têm aplicação imediata, conforme o § 1º do art. 5º da Constituição Federal.",
      },
      {
        id: "c",
        label: "C",
        text: "Os direitos e garantias fundamentais constituem rol taxativo, não admitindo direitos decorrentes de tratados internacionais.",
      },
      {
        id: "d",
        label: "D",
        text: "Os direitos individuais podem ser objeto de emenda constitucional tendente a aboli-los, desde que aprovada por três quintos dos parlamentares.",
      },
      {
        id: "e",
        label: "E",
        text: "As garantias fundamentais aplicam-se exclusivamente aos cidadãos brasileiros natos, excluindo-se estrangeiros residentes no país.",
      },
    ],
    correctId: "b",
    comentario:
      "A alternativa correta é a letra B. O art. 5º, § 1º, da Constituição Federal estabelece expressamente que 'as normas definidoras dos direitos e garantias fundamentais têm aplicação imediata'. Isso significa que tais normas não dependem, em regra, de regulamentação infraconstitucional para produzir efeitos. A letra C está incorreta porque o rol é exemplificativo (art. 5º, § 2º). A letra D contraria o art. 60, § 4º, IV, que trata dos direitos e garantias individuais como cláusula pétrea. Já a letra E desconsidera que o caput do art. 5º assegura direitos também a estrangeiros residentes no país.",
  },
]
