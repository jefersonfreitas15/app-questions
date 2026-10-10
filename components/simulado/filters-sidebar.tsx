"use client";

import { useTransition, useState, useEffect } from "react";
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

  // ==========================================
  // BARREIRA DE CACHE CONTRA SOFT NAVIGATION
  // ==========================================
  const [cachedOptions, setCachedOptions] = useState<DbFilterOptions>({
    banca: [], orgao: [], ano: [], disciplina: [], assunto: []
  });

  useEffect(() => {
    if (dbOptions) {
      // Confirma se o servidor enviou dados válidos antes de sobrescrever a memória
      const temDadosValidos = Object.values(dbOptions).some(
        (arr) => Array.isArray(arr) && arr.length > 0
      );
      if (temDadosValidos) {
        setCachedOptions(dbOptions);
      }
    }
  }, [dbOptions]);

  // Leitura segura da URL (Fonte Única de Verdade)
  const selected: Record<FilterKey, string> = {
    banca: searchParams.get("banca") || "",
    orgao: searchParams.get("orgao") || "",
    ano: searchParams.get("ano") || "",
    disciplina: searchParams.get("disciplina") || "",
    assunto: searchParams.get("assunto") || "",
  };

  const handleSelectChange = (key: FilterKey, val: string) => {
    // Tratamento nativo: "___all___" é a nossa chave técnica para limpar o filtro no Radix UI
    const cleanVal = val === "___all___" ? "" : val;
    const params = new URLSearchParams(searchParams.toString());

    if (cleanVal) {
      params.set(key, cleanVal);
    } else {
      params.delete(key);
    }

    // Regra de Negócio: Se mudar a disciplina, o assunto anterior perde a validade
    if (key === "disciplina" && params.has("assunto")) {
      params.delete("assunto");
    }

    // Retorna à primeira página sempre que um filtro é alterado
    if (params.has("page")) {
      params.delete("page");
    }

    startTransition(() => {
      const qs = params.toString();
      router.push(qs ? `/app?${qs}` : "/app");
    });
  };

  const handleClear = () => {
    startTransition(() => {
      router.push("/app");
    });
  };

  const hasActiveFilters = Object.values(selected).some(Boolean);

  return (
    <aside className="rounded-xl border border-slate-200 bg-white p-5 lg:sticky lg:top-6 shadow-sm">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="size-4 text-slate-500" />
          <h2 className="text-sm font-bold" style={{ color: 'inherit' }}>Filtros</h2>
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
            <>Ocultar <ChevronUp className="size-3.5" /></>
          ) : (
            <>Expandir <ChevronDown className="size-3.5" /></>
          )}
        </button>
      </div>

      <div
        className={`flex flex-col gap-4 transition-opacity ${
          isPending ? "opacity-60 pointer-events-none" : "opacity-100"
        } ${mobileOpen ? "flex" : "hidden lg:flex"}`}
      >
        {filters.map((filter) => {
          // Usa sempre o cache interno para garantir que a lista nunca pisca ou some
          const options = cachedOptions[filter.key] || [];
          const valorAtual = selected[filter.key];

          return (
            <div key={filter.key} className="flex flex-col gap-1.5">
              <Label htmlFor={filter.key} className="text-xs font-semibold" style={{ color: 'inherit', opacity: 0.8 }}>
                {filter.label}
              </Label>
              
              <Select
                // O truque da key força o componente a recriar-se e mostrar o placeholder correto quando limpa
                key={valorAtual || `vazio-${filter.key}`} 
                
                // Usamos undefined em vez de "___all___" para ativar o placeholder nativo
                value={valorAtual || undefined} 
                
                onValueChange={(val: any) => handleSelectChange(filter.key, String(val))}
              >
                <SelectTrigger id={filter.key} className="w-full border border-current opacity-80" style={{ backgroundColor: 'transparent', color: 'inherit' }}>
                  <SelectValue placeholder={filter.placeholder} />
                </SelectTrigger>
                <SelectContent className="bg-white border-slate-200 text-slate-700 max-h-[300px]">
                  
                  {/* Mantemos esta opção na lista para o utilizador poder clicar e limpar */}
                  <SelectItem value="___all___" className="font-semibold text-slate-400">
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
            className="mt-2 w-full gap-2 text-xs font-semibold border-current opacity-70 hover:opacity-100 transition-opacity"
            style={{ backgroundColor: 'transparent', color: 'inherit' }}
          >
            <RotateCcw className="size-3.5" />
            Limpar Filtros
          </Button>
        )}
      </div>
    </aside>
  );
}