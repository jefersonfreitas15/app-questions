import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Conexão segura com privilégios de administrador para alterar a tabela
const supabase = createClient(
  process.env.SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_ROLE_KEY as string
);

export async function POST(request: Request) {
  try {
    const { code } = await request.json();

    if (!code) {
      return NextResponse.json({ error: 'Código não fornecido.' }, { status: 400 });
    }

    // 1. Procura o código na tabela (ajuste o nome da tabela conforme a sua estrutura)
    // Assumimos que a tabela se chama 'codigos_creditos' e tem as colunas: codigo, creditos, usado
    const { data, error } = await supabase
      .from('codigos_creditos')
      .select('id, creditos, usado')
      .eq('codigo', code)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: 'Código inválido ou não encontrado.' }, { status: 404 });
    }

    // 2. Verifica se já foi utilizado por alguém
    if (data.usado) {
      return NextResponse.json({ error: 'Este código de créditos já foi resgatado.' }, { status: 400 });
    }

    // 3. Marca o código como usado para não ser reutilizado
    const { error: updateError } = await supabase
      .from('codigos_creditos')
      .update({ usado: true, data_uso: new Date().toISOString() })
      .eq('id', data.id);

    if (updateError) {
      throw new Error('Falha ao atualizar o status do código.');
    }

    // 4. Devolve a quantidade de créditos para o frontend somar
    return NextResponse.json({ success: true, creditos: data.creditos });

  } catch (err: any) {
    console.error("Erro na validação de créditos:", err);
    return NextResponse.json({ error: 'Erro interno no servidor.' }, { status: 500 });
  }
}