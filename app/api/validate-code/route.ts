import { createClient } from '@supabase/supabase-js';

// Inicialização do cliente Supabase com a chave de serviço (ignora RLS)
const supabase = createClient(
  process.env.SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_ROLE_KEY as string
);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { code } = body;

    if (!code) {
      return new Response(JSON.stringify({ error: 'Código não fornecido.' }), { status: 400 });
    }

    // 1. Buscar o código exato no banco de dados (ignorando maiúsculas/minúsculas no input)
    const { data: activationData, error: fetchError } = await supabase
      .from('activation_codes')
      .select('*')
      .eq('code', code.toUpperCase())
      .single();

    // 2. Tratar código inexistente
    if (fetchError || !activationData) {
      return new Response(JSON.stringify({ error: 'Código inválido ou não encontrado.' }), { status: 404 });
    }

    // 3. Bloquear se já foi utilizado
    if (activationData.is_used) {
      return new Response(JSON.stringify({ error: 'Este código já foi utilizado em outra conta.' }), { status: 403 });
    }

    // 4. Marcar como usado no banco de dados
    const { error: updateError } = await supabase
      .from('activation_codes')
      .update({ is_used: true })
      .eq('id', activationData.id);

    if (updateError) {
      console.error('Erro ao atualizar status do código:', updateError);
      return new Response(JSON.stringify({ error: 'Erro interno ao validar o código.' }), { status: 500 });
    }

    // 5. Retornar sucesso e o e-mail do comprador para o frontend
    return new Response(JSON.stringify({ 
      success: true, 
      email: activationData.email,
      message: 'Acesso vitalício ativado com sucesso!' 
    }), { status: 200 });

  } catch (error) {
    console.error('Erro na rota de validação:', error);
    return new Response(JSON.stringify({ error: 'Erro interno no servidor.' }), { status: 500 });
  }
}