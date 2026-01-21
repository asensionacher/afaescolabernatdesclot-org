'use client';

import { useTranslations } from 'next-intl';
import { useState, useEffect } from 'react';
import styles from './CookieBanner.module.css';

export default function CookieBanner() {
  const t = useTranslations('cookieBanner');
  const [showBanner, setShowBanner] = useState(false);
  const [showCustomize, setShowCustomize] = useState(false);
  const [analyticsEnabled, setAnalyticsEnabled] = useState(true);

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      setShowBanner(true);
    }
  }, []);

  const acceptAll = () => {
    localStorage.setItem('cookie-consent', 'accepted');
    localStorage.setItem('analytics-consent', 'true');
    setShowBanner(false);
    window.location.reload(); // Reload to activate GA
  };

  const rejectAll = () => {
    localStorage.setItem('cookie-consent', 'rejected');
    localStorage.setItem('analytics-consent', 'false');
    setShowBanner(false);
  };

  const saveCustom = () => {
    if (analyticsEnabled) {
      localStorage.setItem('cookie-consent', 'analytics');
      localStorage.setItem('analytics-consent', 'true');
      window.location.reload();
    } else {
      localStorage.setItem('cookie-consent', 'rejected');
      localStorage.setItem('analytics-consent', 'false');
    }
    setShowBanner(false);
    setShowCustomize(false);
  };

  if (!showBanner) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.banner}>
        {!showCustomize ? (
          <>
            <p className={styles.message}>{t('message')}</p>
            <div className={styles.buttons}>
              <button onClick={acceptAll} className={styles.accept}>
                {t('accept')}
              </button>
              <button onClick={rejectAll} className={styles.reject}>
                {t('reject')}
              </button>
              <button onClick={() => setShowCustomize(true)} className={styles.customize}>
                {t('customize')}
              </button>
            </div>
          </>
        ) : (
          <>
            <h3 className={styles.title}>{t('customize')}</h3>
            
            <div className={styles.cookieOption}>
              <div className={styles.optionHeader}>
                <input
                  type="checkbox"
                  id="necessary"
                  checked={true}
                  disabled
                  className={styles.checkbox}
                />
                <label htmlFor="necessary" className={styles.label}>
                  {t('necessary')}
                </label>
              </div>
              <p className={styles.description}>{t('necessaryDesc')}</p>
            </div>

            <div className={styles.cookieOption}>
              <div className={styles.optionHeader}>
                <input
                  type="checkbox"
                  id="analytics"
                  checked={analyticsEnabled}
                  onChange={(e) => setAnalyticsEnabled(e.target.checked)}
                  className={styles.checkbox}
                />
                <label htmlFor="analytics" className={styles.label}>
                  {t('analytics')}
                </label>
              </div>
              <p className={styles.description}>{t('analyticsDesc')}</p>
            </div>

            <div className={styles.buttons}>
              <button onClick={saveCustom} className={styles.accept}>
                {t('accept')}
              </button>
              <button onClick={() => setShowCustomize(false)} className={styles.reject}>
                {t('reject')}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
