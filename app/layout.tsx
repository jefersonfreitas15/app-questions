import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import Script from 'next/script'
import './globals.css'
import { Geist } from "next/font/google"
import { cn } from "@/lib/utils"
import { FacebookPixel } from "@/components/pixel"
import { Suspense } from "react"

const geist = Geist({ subsets: ['latin'], variable: '--font-sans' })

export const metadata: Metadata = {
  title: 'Qpro Concursos | Plataforma Inteligente de Questões',
  description:
    'Plataforma inteligente de questões comentadas para concursos públicos com filtros em cascata, caderno de erros, tesourinha e gerador de questões com IA.',
  applicationName: 'Qpro Concursos',
  manifest: '/manifest.json',
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

        {children}
        
        {/* Componente do Pixel carregado em todas as páginas */}
        <Suspense fallback={null}>
          <FacebookPixel />
        </Suspense>

        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}