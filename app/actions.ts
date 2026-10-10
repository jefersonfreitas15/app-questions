"use server";

import { supabaseServer } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function salvarRespostaNoBanco(
  questaoId: string,
  alternativaId: string,
  acertou: boolean
) {
  const supabase = await supabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, mensagem: "Usuário não autenticado." };
  }

  const { error } = await supabase.from("respostas_usuarios").insert([
    {
      usuario_id: user.id,
      questao_id: questaoId,
      alternativa_id: alternativaId,
      acertou: acertou,
    },
  ]);

  if (error) {
    console.error("Erro ao salvar resposta:", error.message);
    return { ok: false, mensagem: error.message };
  }

  revalidatePath("/app");
  return { ok: true };
}