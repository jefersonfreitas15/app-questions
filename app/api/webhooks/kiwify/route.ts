// Rota: POST /api/webhook/kiwify

import { Resend } from 'resend';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

// Inicialização dos clientes
const resend = new Resend(process.env.RESEND_API_KEY as string);
const supabase = createClient(
  process.env.SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_ROLE_KEY as string
);

export async function POST(request: Request) {
  try {
    // Validação de segurança básica (Token configurado na URL do Webhook da Kiwify)
    // Ex: https://sua-api.com/api/webhooks/kiwify?token=SEU_TOKEN_SECRETO
    const url = new URL(request.url);
    if (url.searchParams.get('token') !== process.env.KIWIFY_WEBHOOK_TOKEN) {
      return new Response(JSON.stringify({ error: 'Não autorizado' }), { status: 401 });
    }

    const data = await request.json();

    // 1. Verificar se é uma compra aprovada
    if (data.order_status !== 'approved') {
      return new Response(JSON.stringify({ message: 'Ignorado: Status não é aprovado' }), { status: 200 });
    }

    const customerEmail = data.Customer.email;
    const customerName = data.Customer.first_name;
    const transactionId = data.order_id;

    // 2. Gerar um código único de ativação (ex: QPRO-A1B2C3D4)
    const uniqueHash = crypto.randomBytes(4).toString('hex').toUpperCase();
    const activationCode = `QPRO-${uniqueHash}`;

    // 3. Salvar no Supabase
    const { error: dbError } = await supabase
      .from('activation_codes')
      .insert([
        {
          code: activationCode,
          email: customerEmail,
          transaction_id: transactionId,
          is_used: false,
        }
      ]);

    if (dbError) {
      console.error('Erro no Supabase:', dbError);
      return new Response(JSON.stringify({ error: 'Erro ao salvar código no banco' }), { status: 500 });
    }

    // 4. Disparar o E-mail Transacional
    await resend.emails.send({
      from: 'Qpro Concursos <contato@qpro.com.br>', 
      to: [customerEmail],
      subject: 'Seu acesso vitalício está liberado! 🚀',
      html: `
        <h2>Olá, ${customerName}!</h2>
        <p>Seu pagamento foi aprovado e seu acesso vitalício ao Qpro Concursos está garantido.</p>
        <p>Para começar a gerar suas questões com IA, use o código de ativação abaixo:</p>
        <h3 style="background: #f4f4f4; padding: 10px; display: inline-block;">${activationCode}</h3>
        <p><a href="http://app-questions-iota.vercel.app/">Clique aqui para acessar o app</a> e insira seu código.</p>
        <p>Bons estudos!</p>
      `
    });

    return new Response(JSON.stringify({ success: true, message: 'Código gerado e enviado' }), { status: 200 });

  } catch (error) {
    console.error('Erro no webhook:', error);
    return new Response(JSON.stringify({ error: 'Erro interno' }), { status: 500 });
  }
}