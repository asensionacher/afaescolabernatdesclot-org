import type { Metadata } from 'next'
import { Baloo_2, Nunito } from 'next/font/google'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { getLocale } from '@/lib/i18n'
import { getT } from '@/lib/translator'
import './globals.css'

const baloo = Baloo_2({
  subsets: ['latin'],
  weight: ['400', '600', '700', '800'],
  variable: '--font-heading',
  display: 'swap',
})

const nunito = Nunito({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  variable: '--font-body',
  display: 'swap',
})

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'

export const metadata: Metadata = {
  title: {
    default: 'AFA Bernat Desclot · Formularis i inscripcions',
    template: '%s | AFA Bernat Desclot',
  },
  description:
    'Formularis i inscripcions de l’AFA de l’Escola Bernat Desclot: quotes, excursions i activitats per a les famílies.',
  metadataBase: new URL(baseUrl),
  openGraph: {
    title: 'AFA Bernat Desclot',
    description: 'Formularis i inscripcions de l’AFA de l’Escola Bernat Desclot.',
    url: baseUrl,
    siteName: 'AFA Bernat Desclot',
    images: [{ url: `${baseUrl}/logo.webp` }],
    type: 'website',
  },
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale()
  const t = await getT()

  return (
    <html lang={locale} className={`${baloo.variable} ${nunito.variable}`}>
      <body>
        <a href="#main-content" className="skipLink">{t('nav.skip')}</a>
        <Header />
        <main id="main-content" className="page" tabIndex={-1}>{children}</main>
        <Footer />
      </body>
    </html>
  )
}
