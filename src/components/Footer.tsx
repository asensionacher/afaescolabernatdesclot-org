'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import styles from './Footer.module.css';

export default function Footer() {
  const t = useTranslations('footer');
  const currentYear = new Date().getFullYear();

  const openCookieSettings = () => {
    localStorage.removeItem('cookie-consent');
    window.location.reload();
  };

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.section}>
          <h3>AMPA Bernat Desclot</h3>
          <p>Escola Bernat Desclot</p>
          <div className={styles.opensource}>
            <p>✨ {t('openSource')}</p>
            <a 
              href="https://github.com/asensionacher/afaescolabernatdesclot-org" 
              target="_blank" 
              rel="noopener noreferrer"
              className={styles.link}
            >
              {t('sourceCode')} →
            </a>
          </div>
        </div>
        
        <div className={styles.section}>
          <h4>{t('schoolLink')}</h4>
          <a 
            href="https://agora.xtec.cat/ceip-bernatdesclot/" 
            target="_blank" 
            rel="noopener noreferrer"
            className={styles.link}
          >
            Blog de l'escola
          </a>
        </div>

        <div className={styles.section}>
          <h4>{t('legalLinks')}</h4>
          <div className={styles.legalLinks}>
            <Link href="/privacy" className={styles.link}>
              {t('privacy')}
            </Link>
            <Link href="/legal" className={styles.link}>
              {t('legal')}
            </Link>
            <Link href="/cookies-policy" className={styles.link}>
              {t('cookies')}
            </Link>
            <button onClick={openCookieSettings} className={styles.cookieButton}>
              ⚙️ Configurar cookies
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
