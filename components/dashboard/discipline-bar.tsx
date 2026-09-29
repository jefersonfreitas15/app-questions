"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"

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
import { subjectPerformance } from "@/lib/dashboard-data"

const chartConfig = {
  accuracy: { label: "Acerto", color: "var(--chart-1)" },
} satisfies ChartConfig

export function DisciplineBar() {
  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle>Desempenho por disciplina</CardTitle>
        <CardDescription>Porcentagem de acerto por matéria</CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        <ChartContainer config={chartConfig} className="h-[260px] w-full">
          <BarChart
            accessibilityLayer
            data={subjectPerformance}
            layout="vertical"
            margin={{ left: 8, right: 24 }}
          >
            <CartesianGrid horizontal={false} />
            <XAxis type="number" domain={[0, 100]} hide />
            <YAxis
              type="category"
              dataKey="subject"
              tickLine={false}
              axisLine={false}
              width={140}
              tickMargin={8}
              tick={{ fontSize: 12 }}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  formatter={(value) => `${value}% de acerto`}
                />
              }
            />
            <Bar
              dataKey="accuracy"
              fill="var(--color-accuracy)"
              radius={[0, 6, 6, 0]}
              barSize={22}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
