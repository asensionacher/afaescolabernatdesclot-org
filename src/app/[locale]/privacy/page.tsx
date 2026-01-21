import { getTranslations } from 'next-intl/server';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import styles from './page.module.css';

export default async function PrivacyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations('privacy');

  return (
    <>
      <Navigation locale={locale} />
      <main className={styles.main}>
        <div className={styles.container}>
          <h1>{t('title')}</h1>
          
          <section className={styles.section}>
            <p className={styles.intro}>{t('intro')}</p>
          </section>

          <section className={styles.section}>
            <h2>{t('dataController')}</h2>
            <p>{t('dataControllerText')}</p>
          </section>

          <section className={styles.section}>
            <h2>{t('dataCollected')}</h2>
            <p>{t('dataCollectedText')}</p>
          </section>

          <section className={styles.section}>
            <h2>{t('cookies')}</h2>
            <p>{t('cookiesText')}</p>
          </section>

          <section className={styles.section}>
            <h2>{t('rights')}</h2>
            <p>{t('rightsText')}</p>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
