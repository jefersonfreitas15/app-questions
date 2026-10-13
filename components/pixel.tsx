"use client";

import { usePathname, useSearchParams } from "next/navigation";
import Script from "next/script";
import { useEffect, useRef } from "react";

export const FB_PIXEL_ID = process.env.NEXT_PUBLIC_FB_PIXEL_ID ?? "1221570077087849";

// Helpers para usar em qualquer lugar do app
export const fbEvent = (name: string, params?: Record<string, any>, eventId?: string) => {
  if (typeof window !== "undefined" && (window as any).fbq) {
    (window as any).fbq("track", name, params ?? {}, eventId ? { eventID: eventId } : undefined);
  }
};

export function FacebookPixel() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isFirstRender = useRef(true);

  useEffect(() => {
    // O primeiro PageView já é enviado pelo script de inicialização
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    fbEvent("PageView");
  }, [pathname, searchParams]);

  return (
    <>
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
      <noscript>
        <img height="1" width="1" style={{ display: "none" }}
          src={`https://www.facebook.com/tr?id=${FB_PIXEL_ID}&ev=PageView&noscript=1`} alt="" />
      </noscript>
    </>
  );
}