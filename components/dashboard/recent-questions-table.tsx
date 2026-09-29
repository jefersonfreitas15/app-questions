import { CheckCircle2, XCircle } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { recentQuestions } from "@/lib/dashboard-data"

export function RecentQuestionsTable() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Últimas questões resolvidas</CardTitle>
        <CardDescription>Suas 5 interações mais recentes</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data / Hora</TableHead>
              <TableHead>Disciplina</TableHead>
              <TableHead className="hidden sm:table-cell">Banca</TableHead>
              <TableHead className="text-right">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recentQuestions.map((question) => (
              <TableRow key={question.id}>
                <TableCell className="whitespace-nowrap text-muted-foreground">
                  {question.datetime}
                </TableCell>
                <TableCell className="font-medium text-foreground">
                  {question.subject}
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  <Badge variant="secondary">{question.banca}</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <span className="inline-flex items-center justify-end gap-1.5 text-sm font-medium">
                    {question.correct ? (
                      <>
                        <CheckCircle2
                          className="size-4 text-emerald-600 dark:text-emerald-400"
                          aria-hidden="true"
                        />
                        <span className="text-emerald-600 dark:text-emerald-400">
                          Acertou
                        </span>
                      </>
                    ) : (
                      <>
                        <XCircle
                          className="size-4 text-red-600 dark:text-red-400"
                          aria-hidden="true"
                        />
                        <span className="text-red-600 dark:text-red-400">
                          Errou
                        </span>
                      </>
                    )}
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
