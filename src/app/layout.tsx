import type { Metadata } from 'next'
import { Baloo_2, Nunito } from 'next/font/google'
import './globals.css'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { getLocale } from '@/lib/i18n'

const baloo = Baloo_2({
  subsets: ['latin'],
  weight: ['400', '600', '700', '800'],
  variable: '--font-primary',
  display: 'swap',
})

const nunito = Nunito({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  variable: '--font-secondary',
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

  return (
    <html lang={locale} className={`${baloo.variable} ${nunito.variable}`}>
      <body>
        <Header />
        <main className="page">{children}</main>
        <Footer />
      </body>
    </html>
  )
}
