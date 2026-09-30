"use client";

import { usePathname, useSearchParams } from "next/navigation";
import Script from "next/script";
import { useEffect } from "react";

// Coloque o número do seu Pixel do Facebook aqui (ex: 123456789012345)
export const FB_PIXEL_ID = "SEU_NUMERO_DO_PIXEL_AQUI";

export function FacebookPixel() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Toda vez que a rota mudar, avisamos o Facebook que é uma nova "PageView"
  useEffect(() => {
    if (typeof window !== "undefined" && (window as any).fbq) {
      (window as any).fbq("track", "PageView");
    }
  }, [pathname, searchParams]);

  if (!FB_PIXEL_ID || FB_PIXEL_ID === "SEU_NUMERO_DO_PIXEL_AQUI") {
    return null; // Não carrega o pixel se o ID não foi configurado
  }

  return (
    <Script
      id="fb-pixel"
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{
        __html: `
          !function(f,b,e,v,n,t,s)
          {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};
          if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
          n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];
          s.parentNode.insertBefore(t,s)}(window, document,'script',
          'https://connect.facebook.net/en_US/fbevents.js');
          fbq('init', '${FB_PIXEL_ID}');
          fbq('track', 'PageView');
        `,
      }}
    />
  );
}