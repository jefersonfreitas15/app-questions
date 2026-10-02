import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_ROLE_KEY as string
);

export async function POST(request: Request) {
  try {
    const { code } = await request.json();

    if (!code) {
      return NextResponse.json({ error: 'Código não fornecido' }, { status: 400 });
    }

    const cleanCode = code.trim();

    // Procura o código na tabela
    const { data: foundCodes, error: searchError } = await supabase
      .from('activation_codes')
      .select('*')
      .eq('code', cleanCode);

    if (searchError || !foundCodes || foundCodes.length === 0) {
      return NextResponse.json({ valid: false, error: 'Código inválido ou não encontrado.' }, { status: 404 });
    }

    const activationRecord = foundCodes[0];

    // Atualiza o código para usado (opcional, dependendo se quer que o código seja de uso único)
    await supabase
      .from('activation_codes')
      .update({ is_used: true })
      .eq('id', activationRecord.id);

    return NextResponse.json({ 
      valid: true, 
      message: 'Acesso vitalício ativado com sucesso!',
      email: activationRecord.email 
    });

  } catch (err: any) {
    console.error('Erro na validação:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}