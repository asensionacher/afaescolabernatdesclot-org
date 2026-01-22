import { getTranslations } from 'next-intl/server';
import { Metadata } from 'next';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import RegistrationForm from '@/components/RegistrationForm';
import styles from './page.module.css';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'registration' });
  
  return {
    title: `${t('title')} | AFA Bernat Desclot`,
    description: t('subtitle'),
  };
}

export default async function RegistrationPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations('registration');

  return (
    <>
      <Navigation locale={locale} />
      <main className={styles.main}>
        <div className={styles.container}>
          <h1 className={styles.title}>{t('title')}</h1>
          <p className={styles.subtitle}>{t('subtitle')}</p>
          <RegistrationForm locale={locale} />
        </div>
      </main>
      <Footer />
    </>
  );
}
