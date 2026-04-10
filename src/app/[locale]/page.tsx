import { getTranslations } from 'next-intl/server';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Link } from '@/i18n/routing';
import styles from './page.module.css';
import type { Metadata } from 'next';

type Locale = 'ca' | 'es' | 'en' | 'ar' | 'ur';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  
  const titles: Record<string, string> = {
    ca: 'AFA Bernat Desclot - AMPA Escola Hospitalet de Llobregat Barcelona',
    es: 'AFA Bernat Desclot - AMPA Escuela Hospitalet de Llobregat Barcelona',
    en: 'AFA Bernat Desclot - Parent Association School Hospitalet Barcelona',
    ar: 'AFA Bernat Desclot - جمعية الآباء مدرسة هوسبيتاليت برشلونة',
    ur: 'AFA Bernat Desclot - والدین کی انجمن اسکول ہوسپٹالیٹ بارسلونا',
  };

  const descriptions: Record<string, string> = {
    ca: 'AMPA de l\'Escola Bernat Desclot a l\'Hospitalet de Llobregat (Barcelona). Associació de famílies del col·legi públic amb activitats extraescolars, casals d\'estiu, acollida matinal, biblioteca, esports i tallers per als alumnes.',
    es: 'AMPA de la Escuela Bernat Desclot en Hospitalet de Llobregat (Barcelona). Asociación de familias del colegio público con actividades extraescolares, casales de verano, acogida matinal, biblioteca, deportes y talleres para los alumnos.',
    en: 'Parent Association (AMPA) of Bernat Desclot School in Hospitalet de Llobregat (Barcelona). Public school family association with extracurricular activities, summer camps, morning care, library, sports and workshops for students.',
    ar: 'جمعية الآباء (AMPA) لمدرسة برنات ديسكلوت في هوسبيتاليت دي لوبريغات (برشلونة). جمعية عائلات المدرسة العامة مع أنشطة خارج المنهج، مخيمات صيفية، رعاية صباحية، مكتبة، رياضة وورش عمل للطلاب.',
    ur: 'برنات ڈیسکلوٹ اسکول کی والدین کی انجمن (AMPA) ہوسپٹالیٹ ڈی لوبریگات (بارسلونا) میں۔ سرکاری اسکول کی خاندانی انجمن نصابی سرگرمیاں، گرمیوں کے کیمپ، صبح کی دیکھ بھال، لائبریری، کھیل اور طلباء کے لیے ورکشاپس کے ساتھ۔',
  };

  const keywords: Record<string, string[]> = {
    ca: [
      'afa bernat desclot',
      'ampa bernat desclot',
      'escola bernat desclot',
      'col·legi bernat desclot hospitalet',
      'escola pública hospitalet',
      'col·legi hospitalet de llobregat',
      'ampa hospitalet',
      'activitats extraescolars hospitalet',
      'casals estiu hospitalet',
      'acollida matinal barcelona',
      'associació famílies escola',
      'escola infantil hospitalet',
      'escola primària hospitalet',
      'educació pública barcelona',
    ],
    es: [
      'afa bernat desclot',
      'ampa bernat desclot',
      'escuela bernat desclot',
      'colegio bernat desclot hospitalet',
      'escuela pública hospitalet',
      'colegio hospitalet de llobregat',
      'ampa hospitalet',
      'actividades extraescolares hospitalet',
      'casales verano hospitalet',
      'acogida matinal barcelona',
      'asociación familias escuela',
      'escuela infantil hospitalet',
      'escuela primaria hospitalet',
      'educación pública barcelona',
    ],
    en: [
      'afa bernat desclot',
      'ampa bernat desclot',
      'bernat desclot school',
      'public school hospitalet',
      'hospitalet de llobregat school',
      'parent association barcelona',
      'extracurricular activities hospitalet',
      'summer camps hospitalet',
      'morning care barcelona',
      'family association school',
      'primary school hospitalet',
      'public education barcelona',
    ],
    ar: [
      'afa bernat desclot',
      'ampa bernat desclot',
      'مدرسة برنات ديسكلوت',
      'مدرسة هوسبيتاليت',
      'مدرسة عامة برشلونة',
      'جمعية الآباء',
      'أنشطة خارج المنهج',
      'مخيمات صيفية',
    ],
    ur: [
      'afa bernat desclot',
      'ampa bernat desclot',
      'برنات ڈیسکلوٹ اسکول',
      'ہوسپٹالیٹ اسکول',
      'سرکاری اسکول بارسلونا',
      'والدین کی انجمن',
      'نصابی سرگرمیاں',
      'گرمیوں کے کیمپ',
    ],
  };

  const title = titles[locale] || titles.ca;
  const description = descriptions[locale] || descriptions.ca;
  const keywordList = keywords[locale] || keywords.ca;
  const imageUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/logo.webp`;
  const url = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/${locale}`;

  return {
    title,
    description,
    keywords: keywordList,
    openGraph: {
      title,
      description,
      url,
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
      title,
      description,
      images: [imageUrl],
    },
  };
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations('home');
  const tAbout = await getTranslations('about');
  const tServices = await getTranslations('services');
  const tBlog = await getTranslations('blog');
  const tContact = await getTranslations('contact');
  const tSchedule = await getTranslations('schedule');
  // Structured data for SEO
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://afaescolabernatdesclot.org';
  
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'EducationalOrganization',
    '@id': `${baseUrl}/#organization`,
    name: 'AFA Bernat Desclot',
    alternateName: ['AMPA Bernat Desclot', 'Associació de Famílies Escola Bernat Desclot'],
    url: baseUrl,
    logo: {
      '@type': 'ImageObject',
      url: `${baseUrl}/logo.webp`,
      width: 512,
      height: 512,
    },
    image: `${baseUrl}/logo.webp`,
    description: t('description'),
    email: 'afaescolabernatdesclot@gmail.com',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Carrer de de l\'Aprestadora, 35',
      addressLocality: 'Hospitalet de Llobregat',
      addressRegion: 'Barcelona',
      postalCode: '08902',
      addressCountry: 'ES',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 41.3635434,
      longitude: 2.1308204
    },
    areaServed: [
      {
        '@type': 'City',
        name: 'Hospitalet de Llobregat',
      },
      {
        '@type': 'City',
        name: 'Barcelona',
      },
    ],
    parentOrganization: {
      '@type': 'EducationalOrganization',
      name: 'Escola Bernat Desclot',
    },
    sameAs: [
      'https://www.instagram.com/afaescolabernatdesclot/',
    ],
  };

  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${baseUrl}/#website`,
    url: baseUrl,
    name: 'AFA Bernat Desclot',
    description: t('description'),
    publisher: {
      '@id': `${baseUrl}/#organization`,
    },
    inLanguage: ['ca', 'es', 'en', 'ar', 'ur'],
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Inicio',
        item: `${baseUrl}/${locale}`,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <Navigation locale={locale} />
      <main className={styles.main}>
        {/* Hero Section */}
        <section className={styles.hero}>
          <div className={styles.heroContent}>
            <h1>👋 {t('title')}</h1>
            <p className={styles.subtitle}>{t('subtitle')}</p>
            <p className={styles.description}>{t('description')}</p>
            <div className={styles.ctaButtons}>
              <a href="#serveis" className={styles.cta}>
                {t('cta')} 🎉
              </a>
              <Link href="/blog" className={styles.ctaSecondary}>
                {tBlog('readMore')} 📚
              </Link>
            </div>
          </div>
          {/* Floating emojis */}
          <div className={styles.floatingEmojis}>
            <span className={styles.emoji}>🎨</span>
            <span className={styles.emoji}>⚽</span>
            <span className={styles.emoji}>🎵</span>
            <span className={styles.emoji}>📖</span>
            <span className={styles.emoji}>🎪</span>
          </div>
        </section>

        {/* About Section - Qui Som */}
        <section id="qui-som" className={styles.sectionAlt}>
          <div className={styles.container}>
            <h2>🌈 {tAbout('title')}</h2>
            <p className={styles.aboutIntro}>{tAbout('description')}</p>
            <p className={styles.aboutIntro}>{tAbout('descriptionSecondary')}</p>
          </div>
        </section>

        {/* Services Section - Serveis */}
        <section id="serveis" className={styles.section}>
          <div className={styles.container}>
            <h2>📋 {tServices('title')}</h2>
            <div className={styles.servicesList}>
              <div className={styles.serviceItem}>
                <span className={styles.serviceIcon}>☀️</span>
                <div>
                  <strong>{tServices('morningCare.title')}</strong>
                  <p>{tServices('morningCare.description')}</p>
                </div>
              </div>
              
              <div className={styles.serviceItem}>
                <span className={styles.serviceIcon}>🌅</span>
                <div>
                  <strong>{tServices('afternoonCare.title')}</strong>
                  <p>{tServices('afternoonCare.description')}</p>
                </div>
              </div>
              
              <div className={styles.serviceItem}>
                <span className={styles.serviceIcon}>📚</span>
                <div>
                  <strong>{tServices('books.title')}</strong>
                  <p>{tServices('books.description')}</p>
                </div>
              </div>
              
              <div className={styles.serviceItem}>
                <span className={styles.serviceIcon}>🏛️</span>
                <div>
                  <strong>{tServices('council.title')}</strong>
                  <p>{tServices('council.description')}</p>
                </div>
              </div>
              
              <div className={styles.serviceItem}>
                <span className={styles.serviceIcon}>⛺</span>
                <div>
                  <strong>{tServices('camps.title')}</strong>
                  <p>{tServices('camps.description')}</p>
                </div>
              </div>
              
              <div className={styles.serviceItem}>
                <span className={styles.serviceIcon}>⚽</span>
                <div>
                  <strong>{tServices('daily.title')}</strong>
                  <p>{tServices('daily.description')}</p>
                </div>
              </div>
              
              <div className={styles.serviceItem}>
                <span className={styles.serviceIcon}>🎉</span>
                <div>
                  <strong>{tServices('events.title')}</strong>
                  <p>{tServices('events.description')}</p>
                </div>
              </div>
              
              <div className={styles.serviceItem}>
                <span className={styles.serviceIcon}>❤️</span>
                <div>
                  <strong>{tServices('solidarity.title')}</strong>
                  <p>{tServices('solidarity.description')}</p>
                </div>
              </div>
              
              <div className={styles.serviceItem}>
                <span className={styles.serviceIcon}>💳</span>
                <div>
                  <strong>{tServices('discounts.title')}</strong>
                  <p>{tServices('discounts.description')}</p>
                  <a 
                    href="/documents/descuentos-ampa.pdf" 
                    download
                    className={styles.downloadLink}
                  >
                    📥 {tServices('discounts.download')}
                  </a>
                </div>
              </div>
              
              <div className={styles.serviceItem}>
                <span className={styles.serviceIcon}>✨</span>
                <div>
                  <strong>{tServices('more.title')}</strong>
                  <p>{tServices('more.description')}</p>
                </div>
              </div>
            </div>

            <p className={styles.finalMessage}>{tAbout('finalMessage')}</p>
          </div>
        </section>

        {/* Contact Section - Contacte */}
        <section id="contacte" className={styles.section}>
          <div className={styles.container}>
            <h2>📮 {tContact('title')}</h2>
            <p className={styles.contactIntro}>{tContact('info')}</p>
            <div className={styles.contactGrid}>
              <div className={styles.contactCard}>
                <div className={styles.contactIcon}>✉️</div>
                <h3>{tContact('email')}</h3>
                <a href="mailto:afaescolabernatdesclot@gmail.com">
                  afaescolabernatdesclot@gmail.com
                </a>
              </div>
              <div className={styles.contactCard}>
                <div className={styles.contactIcon}>🏫</div>
                <h3>{tContact('atSchool')}</h3>
                <p>{tContact('atSchoolText')}</p>
              </div>
              <div className={styles.contactCard}>
                <div className={styles.contactIcon}>🕐</div>
                <h3>{tSchedule('title')}</h3>
                <p>{tSchedule('morning')}</p>
                <p>{tSchedule('afternoon')}</p>
              </div>
              <div className={styles.contactCard}>
                <div className={styles.signUpCard}>
                  <div className={styles.signUpIcon}>📝</div>
                  <h3>{tSchedule('signUp')}</h3>
                  <div className={styles.buttonGroup}>
                    <a 
                      href="/documents/formulario-inscripcion.pdf" 
                      download
                      className={styles.signUpButton}
                    >
                      {tSchedule('download')}
                    </a>
                    <Link 
                      href="/inscripcion"
                      className={styles.onlineFormLink}
                    >
                      {tSchedule('onlineForm')}
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
