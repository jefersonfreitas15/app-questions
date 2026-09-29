import { AccuracyDonut } from "@/components/dashboard/accuracy-donut"
import { ActivityChart } from "@/components/dashboard/activity-chart"
import { DisciplineBar } from "@/components/dashboard/discipline-bar"
import { MetricCards } from "@/components/dashboard/metric-cards"
import { RecentQuestionsTable } from "@/components/dashboard/recent-questions-table"

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-muted/30">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8 md:px-6 lg:py-10">
        <header className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
            Dashboard de Desempenho
          </h1>
          <p className="text-sm text-muted-foreground">
            Acompanhe sua evolução nos estudos para concursos públicos.
          </p>
        </header>

        <section aria-label="Resumo geral">
          <MetricCards />
        </section>

        <section
          aria-label="Gráficos de análise"
          className="grid grid-cols-1 gap-6 lg:grid-cols-2"
        >
          <AccuracyDonut />
          <DisciplineBar />
        </section>

        <section aria-label="Histórico de atividade">
          <ActivityChart />
        </section>

        <section aria-label="Últimas questões resolvidas">
          <RecentQuestionsTable />
        </section>
      </div>
    </main>
  )
}
