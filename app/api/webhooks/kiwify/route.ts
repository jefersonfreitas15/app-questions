import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

const supabase = createClient(
  process.env.SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_ROLE_KEY as string
);

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const url = new URL(request.url);
    const token = url.searchParams.get('token');
    const expectedToken = process.env.KIWIFY_WEBHOOK_TOKEN;

    if (expectedToken && token !== expectedToken) {
      return NextResponse.json({ error: 'Unauthorized token' }, { status: 401 });
    }

    const body = await request.json();
    console.log('WEBHOOK KIWIFY RECEBIDO:', JSON.stringify(body, null, 2));

    // Extrai os dados do comprador independentemente do formato da Kiwify
    const email = body?.customer?.email || body?.Customer?.email || body?.email;
    const nome = body?.customer?.full_name || body?.Customer?.full_name || body?.name || 'Concurseiro(a)';
    const transactionId = body?.order_id || body?.id || 'TRANSACAO_' + Date.now();

    if (!email) {
      return NextResponse.json({ error: 'E-mail do cliente não encontrado no payload' }, { status: 400 });
    }

    // Gera um código de ativação único
    const randomCode = 'QPRO-' + Math.random().toString(36).substring(2, 10).toUpperCase();

    // 1. Grava na base de dados Supabase
    const { error: dbError } = await supabase
      .from('activation_codes')
      .insert([
        {
          code: randomCode,
          email: email,
          transaction_id: String(transactionId),
          is_used: false,
        }
      ]);

    if (dbError) {
      console.error('ERRO AO GRAVAR NO SUPABASE:', dbError);
      return NextResponse.json({ error: dbError.message }, { status: 500 });
    }

    // 2. Envia o e-mail com o código via Resend
    try {
      await resend.emails.send({
        from: 'Qpro Concursos <suporte@qproconcursos.tech>', // ou contato@qproconcursos.tech
        to: [email],
        subject: '👑 Seu Acesso Vitalício ao Qpro Concursos foi liberado!',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #f8fafc;">
            <div style="text-align: center; padding-bottom: 20px;">
              <h1 style="color: #4f46e5; margin: 0;">Pagamento Aprovado!</h1>
              <p style="color: #64748b; font-size: 16px;">Olá, <strong>${nome}</strong>! O seu acesso vitalício ao Qpro Concursos está pronto.</p>
            </div>
            
            <div style="background: #ffffff; padding: 24px; border-radius: 8px; border: 1px solid #cbd5e1; text-align: center; margin: 20px 0;">
              <p style="color: #475569; font-size: 14px; margin-top: 0;">O seu Código de Ativação exclusivo é:</p>
              <div style="font-size: 28px; font-weight: 900; color: #4f46e5; letter-spacing: 2px; padding: 10px; background: #e0e7ff; border-radius: 6px; display: inline-block;">
                ${randomCode}
              </div>
            </div>

            <div style="padding-top: 10px; color: #334155; font-size: 14px; line-height: 1.5;">
              <p><strong>Como ativar:</strong></p>
              <ol style="padding-left: 20px; margin: 0;">
                <li>Abra o aplicativo do Qpro Concursos.</li>
                <li>Clique no botão de liberar acesso vitalício.</li>
                <li>Selecione a aba <strong>"Já comprei! Ativar"</strong> e cole o código acima.</li>
              </ol>
            </div>

            <div style="text-align: center; margin-top: 30px; border-top: 1px solid #e2e8f0; padding-top: 20px; color: #94a3b8; font-size: 12px;">
              <p>Se tiver alguma dúvida, responda a este e-mail. Bons estudos!</p>
            </div>
          </div>
        `,
      });
      console.log('E-mail enviado com sucesso para:', email);
    } catch (emailErr) {
      console.error('Erro ao enviar e-mail via Resend:', emailErr);
      // O código já foi gravado, logo a compra não é perdida se houver falha no e-mail
    }

    return NextResponse.json({ success: true, code: randomCode });

  } catch (err: any) {
    console.error('ERRO INTERNO NO WEBHOOK:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}