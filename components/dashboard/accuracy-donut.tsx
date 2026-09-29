"use client"

import { Cell, Label, Pie, PieChart } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { accuracyData } from "@/lib/dashboard-data"

const chartConfig = {
  value: { label: "Questões" },
  acertos: { label: "Acertos", color: "oklch(0.62 0.17 149)" },
  erros: { label: "Erros", color: "oklch(0.58 0.22 27)" },
} satisfies ChartConfig

export function AccuracyDonut() {
  const total = accuracyData.reduce((sum, item) => sum + item.value, 0)
  const accuracy = Math.round((accuracyData[0].value / total) * 100)

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle>Acertos x Erros</CardTitle>
        <CardDescription>Proporção geral das questões resolvidas</CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[260px]"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent nameKey="key" hideLabel />}
            />
            <Pie
              data={accuracyData}
              dataKey="value"
              nameKey="key"
              innerRadius={70}
              outerRadius={100}
              strokeWidth={4}
              paddingAngle={2}
            >
              {accuracyData.map((entry) => (
                <Cell
                  key={entry.key}
                  fill={`var(--color-${entry.key})`}
                />
              ))}
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className="fill-foreground text-3xl font-semibold"
                        >
                          {accuracy}%
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy ?? 0) + 24}
                          className="fill-muted-foreground text-xs"
                        >
                          de acerto
                        </tspan>
                      </text>
                    )
                  }
                  return null
                }}
              />
            </Pie>
            <ChartLegend content={<ChartLegendContent nameKey="key" />} />
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
