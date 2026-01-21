import { getTranslations } from 'next-intl/server';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import styles from '../privacy/page.module.css';

export default async function CookiesPolicyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations('cookiesPolicy');

  return (
    <>
      <Navigation locale={locale} />
      <main className={styles.main}>
        <div className={styles.container}>
          <h1>{t('title')}</h1>

          <section className={styles.section}>
            <h2>{t('what')}</h2>
            <p>{t('whatText')}</p>
          </section>

          <section className={styles.section}>
            <h2>{t('types')}</h2>
            
            <h3>{t('necessary')}</h3>
            <p>{t('necessaryText')}</p>

            <h3>{t('analytics')}</h3>
            <p>{t('analyticsText')}</p>
          </section>

          <section className={styles.section}>
            <h2>{t('manage')}</h2>
            <p>{t('manageText')}</p>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
