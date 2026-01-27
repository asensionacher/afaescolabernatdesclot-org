'use client';

import { Event } from '@/lib/sanity';
import { Link } from '@/i18n/routing';
import styles from './UpcomingEvents.module.css';

type Locale = 'ca' | 'es' | 'en' | 'ar' | 'ur';

interface UpcomingEventsProps {
  events: Event[];
  locale: string;
  translations: {
    viewFullCalendar: string;
    noEvents: string;
  };
}

export default function UpcomingEvents({ events, locale, translations }: UpcomingEventsProps) {
  const currentLocale = locale as Locale;
  const now = new Date();
  
  // Filter future or ongoing events (endDate >= now) and take only 6
  const upcomingEvents = events
    .filter(event => new Date(event.endDate) >= now)
    .slice(0, 6);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleDateString(locale, { month: 'short' });
    return { day, month };
  };

  if (upcomingEvents.length === 0) {
    return (
      <div className={styles.container}>
        <p className={styles.noEvents}>{translations.noEvents}</p>
        <Link href="/calendario" className={styles.viewAllButton}>
          {translations.viewFullCalendar}
        </Link>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.eventsGrid}>
        {upcomingEvents.map((event) => {
          const { day, month } = formatDate(event.startDate);
          const title = event.title?.[currentLocale] || event.title?.ca || 'Sense títol';
          const excerpt = event.excerpt?.[currentLocale] || event.excerpt?.ca || '';

          const eventCard = (
            <div key={event._id} className={styles.eventCard}>
              <div className={styles.eventDate}>
                <div className={styles.eventMonth}>{month}</div>
                <div className={styles.eventDay}>{day}</div>
              </div>
              <div className={styles.eventInfo}>
                <h3 className={styles.eventTitle}>{title}</h3>
                {excerpt && <p className={styles.eventExcerpt}>{excerpt}</p>}
              </div>
            </div>
          );

          if (event.externalUrl) {
            return (
              <a
                key={event._id}
                href={event.externalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.eventLink}
              >
                {eventCard}
              </a>
            );
          }

          return eventCard;
        })}
      </div>

      <div className={styles.buttonContainer}>
        <Link href="/calendario" className={styles.viewAllButton}>
          {translations.viewFullCalendar}
        </Link>
      </div>
    </div>
  );
}
