import { getTranslations } from 'next-intl/server';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import UpcomingEvents from '@/components/UpcomingEvents';
import { Link } from '@/i18n/routing';
import { getAllEvents, getRecentPosts } from '@/lib/sanity';
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
    ca: 'AFA Bernat Desclot - Associació de Famílies de Barcelona',
    es: 'AFA Bernat Desclot - Asociación de Familias de Barcelona',
    en: 'AFA Bernat Desclot - Family Association in Barcelona',
    ar: 'AFA Bernat Desclot - جمعية العائلات في برشلونة',
    ur: 'AFA Bernat Desclot - بارسلونا میں خاندانی انجمن',
  };

  const descriptions: Record<string, string> = {
    ca: 'Associació de Famílies de l\'escola Bernat Desclot a Barcelona. Oferim activitats extraescolars, acollida matinal i de tardes, casals, colònies i molt més!',
    es: 'Asociación de Familias de la escuela Bernat Desclot en Barcelona. Ofrecemos actividades extraescolares, acogida matinal y de tardes, casales, colonias y mucho más!',
    en: 'Family Association of Bernat Desclot school in Barcelona. We offer extracurricular activities, morning and afternoon care, camps, and much more!',
    ar: 'جمعية العائلات لمدرسة برنات ديسكلوت في برشلونة. نقدم أنشطة خارج المنهج ورعاية صباحية ومسائية ومخيمات وأكثر من ذلك بكثير!',
    ur: 'بارسلونا میں برنات ڈیسکلوٹ اسکول کی فیملی ایسوسی ایشن۔ ہم نصابی سرگرمیاں، صبح اور دوپہر کی دیکھ بھال، کیمپس، اور بہت کچھ پیش کرتے ہیں!',
  };

  const title = titles[locale] || titles.ca;
  const description = descriptions[locale] || descriptions.ca;
  const imageUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/logo.webp`;
  const url = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/${locale}`;

  return {
    title,
    description,
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
  const tCalendar = await getTranslations('calendar');
  
  // Fetch events and blog posts from Sanity
  const events = await getAllEvents();
  const posts = await getRecentPosts(3);

  return (
    <>
      <Navigation locale={locale} />
      <main className={styles.main}>
        {/* Hero Section */}
        <section className={styles.hero}>
          <div className={styles.heroContent}>
            <h1>👋 {t('title')}</h1>
            <p className={styles.subtitle}>{t('subtitle')}</p>
            <p className={styles.description}>{t('description')}</p>
            <div className={styles.ctaButtons}>
              <a href="#esdeveniments" className={styles.cta}>
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

        {/* Events Section - Esdeveniments */}
        <section id="esdeveniments" className={styles.sectionAlt}>
          <div className={styles.container}>
            <h2>📅 {tBlog('upcomingEvents')}</h2>
            <UpcomingEvents 
              events={events}
              locale={locale}
              translations={{
                viewFullCalendar: tCalendar('viewFullCalendar'),
                noEvents: tCalendar('noEvents'),
              }}
            />
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
                  <a 
                    href="/documents/formulario-inscripcion.pdf" 
                    download
                    className={styles.signUpButton}
                  >
                    {tSchedule('download')}
                  </a>
                  {/* Online form link hidden - URL still accessible for those who know it */}
                  {/* <Link 
                    href="/inscripcion"
                    className={styles.onlineFormLink}
                  >
                    {tSchedule('onlineForm')}
                  </Link> */}
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
