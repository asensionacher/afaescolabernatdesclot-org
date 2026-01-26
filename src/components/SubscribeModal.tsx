'use client';

import { useState } from 'react';
import styles from './SubscribeModal.module.css';

interface SubscribeModalProps {
  isOpen: boolean;
  onClose: () => void;
  calendarUrl: string;
  locale: string;
  translations: {
    title: string;
    description: string;
    copyUrl: string;
    urlCopied: string;
    close: string;
  };
}

export default function SubscribeModal({ isOpen, onClose, calendarUrl, translations }: SubscribeModalProps) {
  const [copiedUrl, setCopiedUrl] = useState(false);

  if (!isOpen) return null;

  const webcalUrl = calendarUrl;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(webcalUrl);
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeButton} onClick={onClose} aria-label={translations.close}>
          ×
        </button>

        <div className={styles.header}>
          <h2 className={styles.title}>📅 {translations.title}</h2>
          <p className={styles.description}>{translations.description}</p>
        </div>

        <div className={styles.content}>
          <div className={styles.urlBox}>
            <code>{webcalUrl}</code>
          </div>
          
          <button 
            className={styles.copyButton} 
            onClick={copyToClipboard}
          >
            {copiedUrl ? '✓ ' + translations.urlCopied : translations.copyUrl}
          </button>
        </div>
      </div>
    </div>
  );
}
