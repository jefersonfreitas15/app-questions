import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { summaryStats } from "@/lib/dashboard-data"
import {
  CheckCircle2,
  ListChecks,
  TrendingUp,
  Trophy,
} from "lucide-react"

function formatNumber(value: number) {
  return value.toLocaleString("pt-BR")
}

export function MetricCards() {
  const metrics = [
    {
      title: "Questões resolvidas",
      value: formatNumber(summaryStats.totalResolved),
      icon: ListChecks,
      helper: "Total acumulado",
    },
    {
      title: "Taxa de acerto global",
      value: `${summaryStats.globalAccuracy}%`,
      icon: CheckCircle2,
      helper: `+${summaryStats.accuracyTrend} pts este mês`,
      trend: true,
    },
    {
      title: "Disciplina mais forte",
      value: summaryStats.strongestSubject,
      icon: Trophy,
      helper: `${summaryStats.strongestSubjectAccuracy}% de acerto`,
      compact: true,
    },
    {
      title: "Resolvidas hoje",
      value: formatNumber(summaryStats.solvedToday),
      icon: CheckCircle2,
      helper: `Meta diária: ${summaryStats.solvedTodayGoal}`,
    },
  ]

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {metrics.map((metric) => {
        const Icon = metric.icon
        return (
          <Card key={metric.title}>
            <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {metric.title}
              </CardTitle>
              <span className="flex size-8 items-center justify-center rounded-md bg-muted text-muted-foreground">
                <Icon className="size-4" aria-hidden="true" />
              </span>
            </CardHeader>
            <CardContent className="flex flex-col gap-1">
              <span
                className={
                  metric.compact
                    ? "text-lg font-semibold leading-tight text-foreground text-balance"
                    : "text-3xl font-semibold tracking-tight text-foreground"
                }
              >
                {metric.value}
              </span>
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                {metric.trend ? (
                  <TrendingUp
                    className="size-3.5 text-emerald-600 dark:text-emerald-400"
                    aria-hidden="true"
                  />
                ) : null}
                <span
                  className={
                    metric.trend
                      ? "font-medium text-emerald-600 dark:text-emerald-400"
                      : undefined
                  }
                >
                  {metric.helper}
                </span>
              </span>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
