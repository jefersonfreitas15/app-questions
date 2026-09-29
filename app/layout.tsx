import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import Script from 'next/script'
import './globals.css'
import { Geist } from "next/font/google"
import { cn } from "@/lib/utils"

const geist = Geist({ subsets: ['latin'], variable: '--font-sans' })

// Quando criar o seu Pixel no Gerenciador de Anúncios da Meta, cole o número aqui:
const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID || ""

export const metadata: Metadata = {
  title: 'Qpro Concursos | Plataforma Inteligente de Questões',
  description:
    'Plataforma inteligente de questões comentadas para concursos públicos com filtros em cascata, caderno de erros, tesourinha e gerador de questões com IA.',
  applicationName: 'Qpro Concursos',
  manifest: '/manifest.json', // <-- Adicione esta linha para registar o manifesto
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Qpro Concursos',
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    title: 'Qpro Concursos | Plataforma Inteligente de Questões',
    description:
      'Resolva milhares de questões comentadas, filtre em cascata, revise pelo Caderno de Erros e gere questões inéditas com IA. Acesso Vitalício com pagamento único.',
    type: 'website',
    locale: 'pt_BR',
  },
  icons: {
    icon: '/icon.png',
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  colorScheme: 'light dark',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#4F46E5' },
    { media: '(prefers-color-scheme: dark)', color: '#0F172A' },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR" className={cn("font-sans", geist.variable)}>
      <body className="antialiased">
        {/* Script de Ativação Automática pós-pagamento (?ativar=QPRO47) */}
        <Script id="qpro-auto-ativacao" strategy="afterInteractive">
          {`
            (function() {
              try {
                var params = new URLSearchParams(window.location.search);
                var codigo = (params.get('ativar') || '').trim().toUpperCase();
                var validos = ['QPRO47', 'VITALICIO', 'QPRO2026', 'APROVADO'];
                if (codigo && validos.indexOf(codigo) !== -1) {
                  localStorage.setItem('qpro_vitalicio_ativo', 'true');
                  window.dispatchEvent(new Event('atualizar-placar'));
                  var urlLimpa = window.location.pathname;
                  window.history.replaceState({}, document.title, urlLimpa);
                  setTimeout(function() {
                    alert('🎉 Pagamento confirmado! Seu Acesso Vitalício ao Qpro Concursos já está liberado!');
                  }, 300);
                }
              } catch (e) {}
            })();
          `}
        </Script>

        {/* Script do Pixel da Meta Ads */}
        {META_PIXEL_ID && (
          <Script id="meta-pixel" strategy="afterInteractive">
            {`
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '${META_PIXEL_ID}');
              fbq('track', 'PageView');
            `}
          </Script>
        )}

        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}