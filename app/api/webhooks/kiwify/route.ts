import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

const supabase = createClient(
  process.env.SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_ROLE_KEY as string
);

const resend = new Resend(process.env.RESEND_API_KEY);

// ==============================================================
// ⚠ COLE AQUI OS IDs DOS SEUS PRODUTOS (RETIRADOS DA URL DA KIWIFY) E O LINK DA PASTA
// ==============================================================
const ID_PRODUTO_VITALICIO = "c2414c10-bc54-11f1-bcba-e798de11d8b0"; 
const ID_PRODUTO_CREDITOS = "e82bc990-c10f-11f1-a884-dd6e9186beaf";
const ID_ORDER_BUMP_MAPAS = "4956db20-bed0-11f1-a201-45f9f5ba0c3c"; // Cole o ID do produto dos Mapas aqui

const LINK_GOOGLE_DRIVE = "https://drive.google.com/drive/folders/1yB0pL8gFEAoxCPBuhp0Qun8-fDj4wXQ-?usp=drive_link"; // Cole o link da pasta aqui

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

    // A Kiwify só envia eventos para os webhooks se o status mudar. Queremos apenas "approved".
    const orderStatus = body?.order_status || body?.status;
    if (orderStatus && orderStatus !== 'approved' && orderStatus !== 'paid') {
      return NextResponse.json({ message: 'Ignorando status diferente de approved.' }, { status: 200 });
    }

    // Extrai os dados essenciais da compra
    const email = body?.customer?.email || body?.Customer?.email || body?.email;
    const nome = body?.customer?.full_name || body?.Customer?.full_name || body?.name || 'Concurseiro(a)';
    const transactionId = body?.order_id || body?.id || 'TRANSACAO_' + Date.now();
    
    // Identifica o Produto e o Valor Pago
    const productId = body?.product?.id || body?.product_id;
    const amountPaid = Number(body?.Payment?.amount || body?.amount || 0);

    if (!email) {
      return NextResponse.json({ error: 'E-mail do cliente não encontrado no payload' }, { status: 400 });
    }

    // =========================================================================
    // FLUXO 1: VENDA DE PACOTE DE CRÉDITOS IA (UPSELL)
    // =========================================================================
    if (productId === ID_PRODUTO_CREDITOS) {
      
      // Lógica matemática para descobrir qual pacote o cliente comprou pelo valor pago
      let quantidadeCreditos = 100; // Padrão (R$ 19,90)
      if (amountPaid === 37.00 || amountPaid === 37) quantidadeCreditos = 300;
      else if (amountPaid === 89.90 || amountPaid === 89.9) quantidadeCreditos = 1000;

      // Gera um código de ativação específico para créditos
      const randomCode = 'CRED' + quantidadeCreditos + '-' + Math.random().toString(36).substring(2, 8).toUpperCase();

      // 1. Grava na nova tabela de créditos do Supabase
      const { error: dbError } = await supabase
        .from('codigos_creditos')
        .insert([
          {
            codigo: randomCode,
            creditos: quantidadeCreditos,
            email_comprador: email,
            usado: false,
          }
        ]);

      if (dbError) {
        console.error('ERRO AO GRAVAR CRÉDITOS NO SUPABASE:', dbError);
        return NextResponse.json({ error: dbError.message }, { status: 500 });
      }

      // 2. Envia e-mail de Recarga
      try {
        await resend.emails.send({
          from: 'Qpro Concursos <suporte@qproconcursos.tech>',
          to: [email],
          subject: `⚡ Seus ${quantidadeCreditos} Créditos IA foram liberados!`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #f8fafc;">
              <div style="text-align: center; padding-bottom: 20px;">
                <h1 style="color: #4f46e5; margin: 0;">Recarga de IA Aprovada!</h1>
                <p style="color: #64748b; font-size: 16px;">Olá, <strong>${nome}</strong>! Os seus ${quantidadeCreditos} novos créditos de geração com Inteligência Artificial estão prontos a usar.</p>
              </div>
              
              <div style="background: #ffffff; padding: 24px; border-radius: 8px; border: 1px solid #cbd5e1; text-align: center; margin: 20px 0;">
                <p style="color: #475569; font-size: 14px; margin-top: 0;">O seu Código de Recarga exclusivo é:</p>
                <div style="font-size: 28px; font-weight: 900; color: #4f46e5; letter-spacing: 2px; padding: 10px; background: #e0e7ff; border-radius: 6px; display: inline-block;">
                  ${randomCode}
                </div>
              </div>

              <div style="padding-top: 10px; color: #334155; font-size: 14px; line-height: 1.5;">
                <p><strong>Como adicionar ao saldo:</strong></p>
                <ol style="padding-left: 20px; margin: 0;">
                  <li>Acesse o aplicativo do Qpro Concursos.</li>
                  <li>Clique no botão azul <strong>"✨ Gerar com IA"</strong>.</li>
                  <li>Na tela da IA, clique no botão amarelo <strong>"+ Créditos"</strong>, cole o código acima e ative.</li>
                </ol>
              </div>

              <div style="text-align: center; margin-top: 30px; border-top: 1px solid #e2e8f0; padding-top: 20px; color: #94a3b8; font-size: 12px;">
                <p>Bons estudos rumo à aprovação!</p>
              </div>
            </div>
          `,
        });
      } catch (emailErr) {
        console.error('Erro ao enviar e-mail via Resend:', emailErr);
      }

      return NextResponse.json({ success: true, code: randomCode, type: 'credits', amount: quantidadeCreditos });
    }

    // =========================================================================
    // FLUXO 3: VENDA DO ORDER BUMP (MAPAS MENTAIS)
    // =========================================================================
    if (productId === ID_ORDER_BUMP_MAPAS) {
      try {
        await resend.emails.send({
          from: 'Qpro Concursos <suporte@qproconcursos.tech>',
          to: [email],
          subject: '🗺️ O seu pacote de Mapas Mentais chegou!',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #f8fafc;">
              <h1 style="color: #4f46e5; text-align: center;">Aqui estão os seus Mapas!</h1>
              <p style="color: #475569; font-size: 16px;">Olá, <strong>${nome}</strong>! Obrigado por adicionar os Mapas Mentais à sua encomenda.</p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${LINK_GOOGLE_DRIVE}" target="_blank" style="background-color: #4f46e5; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
                  Acessar Pasta Completa
                </a>
              </div>
              
              <p style="color: #64748b; font-size: 14px; text-align: center;">Recomendamos que guarde este link ou faça o download dos ficheiros para o seu computador.</p>
            </div>
          `,
        });
      } catch (emailErr) {
        console.error('Erro ao enviar e-mail do Order Bump:', emailErr);
      }

      return NextResponse.json({ success: true, type: 'order_bump' });
    }

    // =========================================================================
    // FLUXO 2: VENDA DO ACESSO VITALÍCIO PADRÃO
    // =========================================================================
    if (productId === ID_PRODUTO_VITALICIO) {
      
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
        console.error('ERRO AO GRAVAR VITALÍCIO NO SUPABASE:', dbError);
        return NextResponse.json({ error: dbError.message }, { status: 500 });
      }

      // 2. Envia o e-mail com o código
      try {
        await resend.emails.send({
          from: 'Qpro Concursos <suporte@qproconcursos.tech>',
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
                  <li>Clique no botão verde de liberar acesso vitalício.</li>
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
      }

      return NextResponse.json({ success: true, code: randomCode, type: 'lifetime' });
    }

    // =========================================================================
    // FLUXO 4: IGNORAR PRODUTOS DESCONHECIDOS
    // =========================================================================
    // Se a Kiwify enviar um ID que não seja o Vitalício, Créditos ou Mapas, apenas ignoramos.
    return NextResponse.json({ message: 'Produto não monitorizado pelo webhook.' }, { status: 200 });

  } catch (err: any) {
    console.error('ERRO INTERNO NO WEBHOOK:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}