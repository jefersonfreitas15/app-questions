"use server";

import { supabase } from '@/lib/supabase';
import { revalidatePath } from 'next/cache';

export async function salvarRespostaNoBanco(
  questaoId: string,
  alternativaId: string,
  acertou: boolean
) {
  const { error } = await supabase.from('respostas_usuario').insert([
    {
      questao_id: questaoId,
      alternativa_id: alternativaId,
      acertou: acertou,
    },
  ]);

  if (error) {
    console.log(">>> DETALHE DO SUPABASE NO TERMINAL:", error.message);
    return { ok: false, mensagem: error.message };
  }

  // Atualiza os cartões de Resolvidas, Acertos, Erros e % na hora!
  revalidatePath('/');
  return { ok: true };
}