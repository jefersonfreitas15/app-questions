import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Cliente Supabase com chave de serviço (ignora RLS)
const supabase = createClient(
  process.env.SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_ROLE_KEY as string
);

export async function POST(request: Request) {
  try {
    const url = new URL(request.url);
    const token = url.searchParams.get('token');
    const expectedToken = process.env.KIWIFY_WEBHOOK_TOKEN;

    // Validação de segurança do token
    if (expectedToken && token !== expectedToken) {
      return NextResponse.json({ error: 'Unauthorized token' }, { status: 401 });
    }

    const body = await request.json();
    
    // Imprime no log da Vercel exatamente o que a Kiwify enviou
    console.log('WEBHOOK KIWIFY RECEBIDO:', JSON.stringify(body, null, 2));

    // Extrai o e-mail independentemente do formato que a Kiwify mande
    const email = body?.customer?.email || body?.Customer?.email || body?.email || 'cliente@teste.com';
    const transactionId = body?.order_id || body?.id || 'TRANSACAO_' + Date.now();

    // Gera um código de ativação único
    const randomCode = 'QPRO-' + Math.random().toString(36).substring(2, 10).toUpperCase();

    // Insere na base de dados Supabase
    const { data, error } = await supabase
      .from('activation_codes')
      .insert([
        {
          code: randomCode,
          email: email,
          transaction_id: String(transactionId),
          is_used: false,
        }
      ])
      .select();

    if (error) {
      console.error('ERRO AO GRAVAR NO SUPABASE:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, code: randomCode, inserted: data });

  } catch (err: any) {
    console.error('ERRO INTERNO NO WEBHOOK:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}