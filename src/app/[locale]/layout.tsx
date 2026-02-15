import {NextIntlClientProvider} from 'next-intl';
import {getMessages} from 'next-intl/server';
import {routing} from '@/i18n/routing';
import {notFound} from 'next/navigation';
import GoogleAnalytics from '@/components/GoogleAnalytics';
import CookieBanner from '@/components/CookieBanner';
import type { Metadata } from 'next';
import './globals.css';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({locale}));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;

  const metadataByLocale: Record<string, {
    title: string;
    description: string;
    keywords: string[];
  }> = {
    ca: {
      title: 'AFA Bernat Desclot - Associació Famílies Escola Hospitalet de Llobregat',
      description: 'Associació de Famílies d\'Alumnes (AFA/AMPA) de l\'Escola Bernat Desclot a l\'Hospitalet de Llobregat, Barcelona. Activitats extraescolars, acollida matinal, casals d\'estiu i serveis per a les famílies del col·legi.',
      keywords: [
        'afa bernat desclot',
        'ampa bernat desclot',
        'escola bernat desclot',
        'col·legi bernat desclot',
        'escola hospitalet',
        'col·legi hospitalet',
        'escola hospitalet de llobregat',
        'ampa hospitalet',
        'afa hospitalet',
        'associació famílies',
        'activitats extraescolars',
        'casals estiu barcelona',
        'acollida matinal',
        'escola pública barcelona',
        'educació hospitalet',
      ],
    },
    es: {
      title: 'AFA Bernat Desclot - Asociación Familias Escuela Hospitalet de Llobregat',
      description: 'Asociación de Familias de Alumnos (AFA/AMPA) de la Escuela Bernat Desclot en Hospitalet de Llobregat, Barcelona. Actividades extraescolares, acogida matinal, casales de verano y servicios para las familias del colegio.',
      keywords: [
        'afa bernat desclot',
        'ampa bernat desclot',
        'escuela bernat desclot',
        'colegio bernat desclot',
        'escuela hospitalet',
        'colegio hospitalet',
        'escuela hospitalet de llobregat',
        'ampa hospitalet',
        'afa hospitalet',
        'asociación familias',
        'actividades extraescolares',
        'casales verano barcelona',
        'acogida matinal',
        'escuela pública barcelona',
        'educación hospitalet',
      ],
    },
    en: {
      title: 'AFA Bernat Desclot - Family Association School Hospitalet de Llobregat',
      description: 'Family Association (AFA/AMPA) of Bernat Desclot School in Hospitalet de Llobregat, Barcelona. Extracurricular activities, morning care, summer camps and services for school families.',
      keywords: [
        'afa bernat desclot',
        'ampa bernat desclot',
        'bernat desclot school',
        'hospitalet school',
        'hospitalet de llobregat school',
        'family association',
        'parent association barcelona',
        'extracurricular activities',
        'summer camps barcelona',
        'morning care',
        'public school barcelona',
        'education hospitalet',
      ],
    },
    ar: {
      title: 'AFA Bernat Desclot - جمعية عائلات مدرسة هوسبيتاليت دي لوبريغات',
      description: 'جمعية عائلات الطلاب (AFA/AMPA) في مدرسة برنات ديسكلوت في هوسبيتاليت دي لوبريغات، برشلونة. أنشطة خارج المنهج، رعاية صباحية، مخيمات صيفية وخدمات لعائلات المدرسة.',
      keywords: [
        'afa bernat desclot',
        'ampa bernat desclot',
        'مدرسة برنات ديسكلوت',
        'مدرسة هوسبيتاليت',
        'مدرسة برشلونة',
        'جمعية العائلات',
        'أنشطة خارج المنهج',
        'مخيمات صيفية',
        'رعاية صباحية',
        'تعليم برشلونة',
      ],
    },
    ur: {
      title: 'AFA Bernat Desclot - فیملی ایسوسی ایشن اسکول ہوسپٹالیٹ ڈی لوبریگات',
      description: 'برنات ڈیسکلوٹ اسکول کی فیملی ایسوسی ایشن (AFA/AMPA) ہوسپٹالیٹ ڈی لوبریگات، بارسلونا میں۔ نصابی سرگرمیاں، صبح کی دیکھ بھال، گرمیوں کے کیمپ اور اسکول کے خاندانوں کے لیے خدمات۔',
      keywords: [
        'afa bernat desclot',
        'ampa bernat desclot',
        'برنات ڈیسکلوٹ اسکول',
        'ہوسپٹالیٹ اسکول',
        'بارسلونا اسکول',
        'خاندانی انجمن',
        'نصابی سرگرمیاں',
        'گرمیوں کے کیمپ',
        'صبح کی دیکھ بھال',
        'تعلیم بارسلونا',
      ],
    },
  };

  const meta = metadataByLocale[locale] || metadataByLocale.ca;
  const imageUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/logo.webp`;

  return {
    title: {
      default: meta.title,
      template: `%s | AFA Bernat Desclot`,
    },
    description: meta.description,
    keywords: meta.keywords,
    authors: [{ name: 'AFA Bernat Desclot' }],
    creator: 'AFA Bernat Desclot',
    publisher: 'AFA Bernat Desclot',
    metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'),
    alternates: {
      canonical: `/${locale}`,
      languages: {
        'ca': '/ca',
        'es': '/es',
        'en': '/en',
        'ar': '/ar',
        'ur': '/ur',
      },
    },
    openGraph: {
      title: meta.title,
      description: meta.description,
      url: `/${locale}`,
      siteName: 'AFA Bernat Desclot',
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: 'AFA Bernat Desclot',
        },
      ],
      locale: locale,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: meta.title,
      description: meta.description,
      images: [imageUrl],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    verification: {
      google: process.env.GOOGLE_SITE_VERIFICATION,
    },
  };
}

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{locale: string}>;
}) {
  const {locale} = await params;
  
  if (!routing.locales.includes(locale as any)) {
    notFound();
  }

  const messages = await getMessages();
  const gaId = process.env.NEXT_PUBLIC_GA_ID;

  return (
    <html lang={locale} dir={locale === 'ar' || locale === 'ur' ? 'rtl' : 'ltr'}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Baloo+2:wght@400;600;700;800&family=Nunito:wght@400;600;700&display=swap" rel="stylesheet" />
      </head>
      <body>
        {gaId && <GoogleAnalytics gaId={gaId} />}
        <NextIntlClientProvider messages={messages}>
          {children}
          <CookieBanner />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
