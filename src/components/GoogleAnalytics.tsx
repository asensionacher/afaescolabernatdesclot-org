'use client';

import Script from 'next/script';
import { useEffect } from 'react';

export default function GoogleAnalytics({ gaId }: { gaId: string }) {
  useEffect(() => {
    if (typeof window !== 'undefined' && gaId) {
      // Check if user has accepted analytics cookies
      const cookieConsent = localStorage.getItem('cookie-consent');
      if (cookieConsent === 'accepted' || cookieConsent === 'analytics') {
        // Google Analytics is loaded via Script component
      }
    }
  }, [gaId]);

  // Only render if GA ID exists
  if (!gaId) return null;

  return (
    <>
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
      />
      <Script
        id="google-analytics"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            
            // Check consent before sending data
            const consent = localStorage.getItem('cookie-consent');
            if (consent === 'accepted' || consent === 'analytics') {
              gtag('config', '${gaId}', {
                page_path: window.location.pathname,
              });
            } else {
              gtag('config', '${gaId}', {
                'anonymize_ip': true,
                'send_page_view': false
              });
            }
          `,
        }}
      />
    </>
  );
}
