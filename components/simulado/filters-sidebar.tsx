"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SlidersHorizontal, RotateCcw, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface DbFilterOptions {
  banca: string[];
  orgao: string[];
  ano: string[];
  disciplina: string[];
  assunto: string[];
}

interface FiltersSidebarProps {
  dbOptions?: DbFilterOptions;
}

const filters = [
  { key: "banca", label: "Banca", placeholder: "Todas as bancas" },
  { key: "orgao", label: "Órgão", placeholder: "Todos os órgãos" },
  { key: "ano", label: "Ano", placeholder: "Todos os anos" },
  { key: "disciplina", label: "Disciplina", placeholder: "Todas as disciplinas" },
  { key: "assunto", label: "Assunto", placeholder: "Todos os assuntos" },
] as const;

type FilterKey = (typeof filters)[number]["key"];

export function FiltersSidebar({ dbOptions }: FiltersSidebarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [mobileOpen, setMobileOpen] = useState(false);

  const [selected, setSelected] = useState<Record<FilterKey, string>>({
    banca: searchParams.get("banca") || "",
    orgao: searchParams.get("orgao") || "",
    ano: searchParams.get("ano") || "",
    disciplina: searchParams.get("disciplina") || "",
    assunto: searchParams.get("assunto") || "",
  });

  useEffect(() => {
    setSelected({
      banca: searchParams.get("banca") || "",
      orgao: searchParams.get("orgao") || "",
      ano: searchParams.get("ano") || "",
      disciplina: searchParams.get("disciplina") || "",
      assunto: searchParams.get("assunto") || "",
    });
  }, [searchParams]);

  const filterOptions: Record<FilterKey, string[]> = {
    banca: dbOptions?.banca || [],
    orgao: dbOptions?.orgao || [],
    ano: dbOptions?.ano || [],
    disciplina: dbOptions?.disciplina || [],
    assunto: dbOptions?.assunto || [],
  };

  const handleSelectChange = (key: FilterKey, val: string | null | undefined) => {
    const rawVal = val ?? "";
    const filterDef = filters.find((f) => f.key === key);
    const cleanVal =
      rawVal === "todos" || rawVal === filterDef?.placeholder ? "" : rawVal;

    const nextSelected = { ...selected, [key]: cleanVal };

    if (key === "disciplina" && selected.assunto) {
      nextSelected.assunto = "";
    }

    setSelected(nextSelected);

    const params = new URLSearchParams();
    (Object.keys(nextSelected) as FilterKey[]).forEach((k) => {
      if (nextSelected[k]) {
        params.set(k, nextSelected[k]);
      }
    });

    startTransition(() => {
      const qs = params.toString();
      router.push(qs ? `/app?${qs}` : "/app"); // <-- Agora manda para o aplicativo
    });
  };

  const handleClear = () => {
    setSelected({
      banca: "",
      orgao: "",
      ano: "",
      disciplina: "",
      assunto: "",
    });
    startTransition(() => {
      router.push("/app"); // <-- Agora manda para o aplicativo
    });
  };

  const hasActiveFilters = Object.values(selected).some(Boolean);

  return (
    <aside className="rounded-xl border border-slate-200 bg-white p-5 lg:sticky lg:top-6 shadow-sm">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="size-4 text-slate-500" />
          <h2 className="text-sm font-bold text-slate-800">Filtros</h2>
          {isPending && (
            <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
          )}
        </div>

        <button
          type="button"
          onClick={() => setMobileOpen(!mobileOpen)}
          className="flex items-center gap-1 text-xs font-bold text-indigo-600 lg:hidden hover:text-indigo-800 transition-colors"
        >
          {mobileOpen ? (
            <>
              Ocultar <ChevronUp className="size-3.5" />
            </>
          ) : (
            <>
              Expandir <ChevronDown className="size-3.5" />
            </>
          )}
        </button>
      </div>

      <div
        className={`flex flex-col gap-4 transition-opacity ${
          isPending ? "opacity-60 pointer-events-none" : "opacity-100"
        } ${mobileOpen ? "flex" : "hidden lg:flex"}`}
      >
        {filters.map((filter) => {
          const options = filterOptions[filter.key] || [];
          return (
            <div key={filter.key} className="flex flex-col gap-1.5">
              <Label htmlFor={filter.key} className="text-xs font-semibold text-slate-600">
                {filter.label}
              </Label>
              <Select
                key={`${filter.key}-${selected[filter.key] || "empty"}`}
                value={selected[filter.key] || undefined}
                onValueChange={(val) => handleSelectChange(filter.key, val ?? "")}
              >
                <SelectTrigger id={filter.key} className="w-full bg-white border-slate-200 text-slate-700">
                  <SelectValue placeholder={filter.placeholder} />
                </SelectTrigger>
                <SelectContent className="bg-white border-slate-200 text-slate-700">
                  <SelectItem value={filter.placeholder}>
                    {filter.placeholder}
                  </SelectItem>
                  {options.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          );
        })}

        {hasActiveFilters && (
          <Button
            variant="outline"
            onClick={handleClear}
            className="mt-2 w-full gap-2 text-xs font-semibold text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-rose-600"
          >
            <RotateCcw className="size-3.5" />
            Limpar Filtros
          </Button>
        )}
      </div>
    </aside>
  );
}