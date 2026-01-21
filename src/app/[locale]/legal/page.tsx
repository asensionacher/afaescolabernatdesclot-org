import { getTranslations } from 'next-intl/server';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import styles from '../privacy/page.module.css';

export default async function LegalPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations('legal');

  return (
    <>
      <Navigation locale={locale} />
      <main className={styles.main}>
        <div className={styles.container}>
          <h1>{t('title')}</h1>

          <section className={styles.section}>
            <h2>{t('owner')}</h2>
            <p>{t('ownerText')}</p>
          </section>

          <section className={styles.section}>
            <h2>{t('purpose')}</h2>
            <p>{t('purposeText')}</p>
          </section>

          <section className={styles.section}>
            <h2>{t('liability')}</h2>
            <p>{t('liabilityText')}</p>
          </section>

          <section className={styles.section}>
            <h2>{t('intellectualProperty')}</h2>
            <p>{t('intellectualPropertyText')}</p>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
