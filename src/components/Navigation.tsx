'use client';

import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/routing';
import styles from './Navigation.module.css';
import Image from 'next/image';
import { useState, useEffect, useRef } from 'react';

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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const langDropdownRef = useRef<HTMLDivElement>(null);

  const locales = ['ca', 'es', 'en', 'ar', 'ur'];

  const closeMenu = () => {
    setIsMobileMenuOpen(false);
  };

  // Close language dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (langDropdownRef.current && !langDropdownRef.current.contains(event.target as Node)) {
        setIsLangOpen(false);
      }
    }

    if (isLangOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isLangOpen]);

  return (
    <nav className={styles.nav}>
      <div className={styles.container}>
        <Link href="/" className={styles.logo}>
          <Image 
            src="/logo.webp" 
            alt="AFA Bernat Desclot Logo" 
            width={80} 
            height={80}
            className={styles.logoImage}
          />
          <span className={styles.logoText}>AFA Bernat Desclot</span>
        </Link>

        {/* Hamburger Button */}
        <button 
          className={styles.hamburger}
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle menu"
        >
          <span className={`${styles.hamburgerLine} ${isMobileMenuOpen ? styles.hamburgerLineOpen : ''}`}></span>
          <span className={`${styles.hamburgerLine} ${isMobileMenuOpen ? styles.hamburgerLineOpen : ''}`}></span>
          <span className={`${styles.hamburgerLine} ${isMobileMenuOpen ? styles.hamburgerLineOpen : ''}`}></span>
        </button>
        
        {/* Desktop Menu */}
        <div className={styles.menu}>
          <Link href="/#qui-som" className={styles.menuLink}>
            {t('about')}
          </Link>
          <Link href="/#serveis" className={styles.menuLink}>
            {t('services')}
          </Link>
          <Link href="/blog" className={pathname === '/blog' ? styles.active : styles.menuLink}>
            Blog
          </Link>
          <Link href="/#contacte" className={styles.menuLink}>
            {t('contact')}
          </Link>
        </div>

        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
          <div className={styles.mobileMenuOverlay} onClick={closeMenu}>
            <div className={styles.mobileMenu} onClick={(e) => e.stopPropagation()}>
              <Link href="/#qui-som" className={styles.mobileMenuLink} onClick={closeMenu}>
                {t('about')}
              </Link>
              <Link href="/#serveis" className={styles.mobileMenuLink} onClick={closeMenu}>
                {t('services')}
              </Link>
              <Link href="/blog" className={styles.mobileMenuLink} onClick={closeMenu}>
                Blog
              </Link>
              <Link href="/#contacte" className={styles.mobileMenuLink} onClick={closeMenu}>
                {t('contact')}
              </Link>
            </div>
          </div>
        )}

        {/* Language Dropdown */}
        <div className={styles.langDropdown} ref={langDropdownRef}>
          <button 
            className={styles.langButton}
            onClick={() => setIsLangOpen(!isLangOpen)}
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
                  onClick={() => setIsLangOpen(false)}
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
