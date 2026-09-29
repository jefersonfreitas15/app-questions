export type TrendDirection = "up" | "down" | "neutral"

export const summaryStats = {
  totalResolved: 1240,
  globalAccuracy: 78,
  accuracyTrend: 4, // pontos percentuais de crescimento
  strongestSubject: "Direito Administrativo",
  strongestSubjectAccuracy: 91,
  solvedToday: 45,
  solvedTodayGoal: 60,
}

export const accuracyData = [
  { key: "acertos", label: "Acertos", value: 967 },
  { key: "erros", label: "Erros", value: 273 },
]

export const subjectPerformance = [
  { subject: "Direito Administrativo", accuracy: 91 },
  { subject: "Português", accuracy: 84 },
  { subject: "Direito Constitucional", accuracy: 76 },
  { subject: "Raciocínio Lógico", accuracy: 68 },
  { subject: "Informática", accuracy: 59 },
]

export const weeklyActivity = [
  { day: "Seg", date: "16/09", questions: 32 },
  { day: "Ter", date: "17/09", questions: 51 },
  { day: "Qua", date: "18/09", questions: 28 },
  { day: "Qui", date: "19/09", questions: 64 },
  { day: "Sex", date: "20/09", questions: 47 },
  { day: "Sáb", date: "21/09", questions: 73 },
  { day: "Dom", date: "22/09", questions: 45 },
]

export type RecentQuestion = {
  id: string
  datetime: string
  subject: string
  banca: string
  correct: boolean
}

export const recentQuestions: RecentQuestion[] = [
  {
    id: "q1",
    datetime: "22/09 · 14:32",
    subject: "Direito Administrativo",
    banca: "CEBRASPE",
    correct: true,
  },
  {
    id: "q2",
    datetime: "22/09 · 14:20",
    subject: "Português",
    banca: "FGV",
    correct: true,
  },
  {
    id: "q3",
    datetime: "22/09 · 14:05",
    subject: "Raciocínio Lógico",
    banca: "FCC",
    correct: false,
  },
  {
    id: "q4",
    datetime: "22/09 · 13:48",
    subject: "Direito Constitucional",
    banca: "CEBRASPE",
    correct: true,
  },
  {
    id: "q5",
    datetime: "22/09 · 13:30",
    subject: "Informática",
    banca: "VUNESP",
    correct: false,
  },
]
