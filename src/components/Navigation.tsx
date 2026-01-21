'use client';

import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/routing';
import styles from './Navigation.module.css';
import Image from 'next/image';
import { useState } from 'react';

const localeNames: Record<string, string> = {
  ca: 'Català',
  es: 'Español',
  en: 'English',
  ar: 'العربية',
  ur: 'اردو',
};

export default function Navigation({ locale }: { locale: string }) {
  const t = useTranslations('nav');
  const pathname = usePathname();
  const [isLangOpen, setIsLangOpen] = useState(false);

  const locales = ['ca', 'es', 'en', 'ar', 'ur'];

  return (
    <nav className={styles.nav}>
      <div className={styles.container}>
        <Link href="/" className={styles.logo}>
          <Image 
            src="/logo.png" 
            alt="AFA Bernat Desclot Logo" 
            width={80} 
            height={80}
            className={styles.logoImage}
          />
          <span className={styles.logoText}>AFA Bernat Desclot</span>
        </Link>
        
        <div className={styles.menu}>
          <Link href="/#qui-som" className={styles.menuLink}>
            {t('about')}
          </Link>
          <Link href="/#serveis" className={styles.menuLink}>
            {t('services')}
          </Link>
          <Link href="/#esdeveniments" className={styles.menuLink}>
            {t('events')}
          </Link>
          <Link href="/blog" className={pathname === '/blog' ? styles.active : styles.menuLink}>
            Blog
          </Link>
          <Link href="/#contacte" className={styles.menuLink}>
            {t('contact')}
          </Link>
        </div>

        <div className={styles.langDropdown}>
          <button 
            className={styles.langButton}
            onClick={() => setIsLangOpen(!isLangOpen)}
            onBlur={() => setTimeout(() => setIsLangOpen(false), 200)}
          >
            {localeNames[locale]} ▼
          </button>
          {isLangOpen && (
            <div className={styles.langMenu}>
              {locales.map((loc) => (
                <Link
                  key={loc}
                  href={pathname}
                  locale={loc as any}
                  className={`${styles.langOption} ${locale === loc ? styles.activeLang : ''}`}
                >
                  {localeNames[loc]}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
