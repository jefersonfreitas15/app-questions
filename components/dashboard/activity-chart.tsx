"use client"

import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { weeklyActivity } from "@/lib/dashboard-data"

const chartConfig = {
  questions: { label: "Questões", color: "var(--chart-1)" },
} satisfies ChartConfig

export function ActivityChart() {
  const total = weeklyActivity.reduce((sum, item) => sum + item.questions, 0)

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle>Atividade dos últimos 7 dias</CardTitle>
        <CardDescription>
          {total.toLocaleString("pt-BR")} questões resolvidas na semana
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        <ChartContainer config={chartConfig} className="h-[240px] w-full">
          <AreaChart
            accessibilityLayer
            data={weeklyActivity}
            margin={{ left: 4, right: 12, top: 8 }}
          >
            <defs>
              <linearGradient id="fillQuestions" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-questions)"
                  stopOpacity={0.35}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-questions)"
                  stopOpacity={0.02}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="day"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <YAxis tickLine={false} axisLine={false} width={28} />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(_, payload) =>
                    payload?.[0]?.payload?.date ?? ""
                  }
                />
              }
            />
            <Area
              dataKey="questions"
              type="monotone"
              fill="url(#fillQuestions)"
              stroke="var(--color-questions)"
              strokeWidth={2}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
