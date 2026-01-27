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
    allDay: string;
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

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit', hour12: false });
  };

  const formatDateShort = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(locale, { day: 'numeric', month: 'short' });
  };

  const formatTimeRange = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    // Get date strings (YYYY-MM-DD)
    const startDateStr = start.toISOString().split('T')[0];
    const endDateStr = end.toISOString().split('T')[0];
    
    // Same date = all-day event
    if (startDateStr === endDateStr) {
      return translations.allDay; // All-day event
    }
    
    // Multi-day event: show start date/time - end date/time
    const startPart = `${formatDateShort(startDate)} ${formatTime(startDate)}`;
    const endPart = `${formatDateShort(endDate)} ${formatTime(endDate)}`;
    return `${startPart} - ${endPart}`;
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
          const timeRange = formatTimeRange(event.startDate, event.endDate);
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
                <p className={styles.eventTime}>{timeRange}</p>
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
