'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { Event } from '@/lib/sanity';
import styles from './EventCalendar.module.css';

type Locale = 'ca' | 'es' | 'en' | 'ar' | 'ur';

interface EventCalendarProps {
  events: Event[];
  locale: string;
  translations: {
    previousMonth: string;
    nextMonth: string;
    noEvents: string;
    pastEvent: string;
    event: string;
    events: string;
    subscribeCalendar: string;
    months: string[];
    weekDays: string[];
  };
}

export default function EventCalendar({ events, locale, translations }: EventCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const calendarRef = useRef<HTMLDivElement>(null);
  const currentLocale = locale as Locale;

  // Close tooltip when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
        setSelectedDay(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Get first and last day of current month
  const firstDayOfMonth = useMemo(() => {
    return new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  }, [currentDate]);

  const lastDayOfMonth = useMemo(() => {
    return new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  }, [currentDate]);

  // Filter events for current month (only future events)
  const monthEvents = useMemo(() => {
    const now = new Date();
    return events.filter(event => {
      const eventDate = new Date(event.eventDate);
      const isCurrentMonth = eventDate.getMonth() === currentDate.getMonth() &&
                             eventDate.getFullYear() === currentDate.getFullYear();
      const isFuture = eventDate >= now;
      return isCurrentMonth && isFuture;
    });
  }, [events, currentDate]);

  // Check if event is in the past
  const isPastEvent = (eventDate: string) => {
    const event = new Date(eventDate);
    const now = new Date();
    return event < now;
  };

  // Get events for a specific day (all events, including past)
  const getEventsForDay = (day: number) => {
    return events.filter(event => {
      const eventDate = new Date(event.eventDate);
      return eventDate.getDate() === day &&
             eventDate.getMonth() === currentDate.getMonth() &&
             eventDate.getFullYear() === currentDate.getFullYear();
    });
  };

  // Navigate months
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    setSelectedDay(null);
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    setSelectedDay(null);
  };

  // Handle day click for mobile
  const handleDayClick = (day: number | null, hasEvents: boolean) => {
    if (day && hasEvents) {
      setSelectedDay(selectedDay === day ? null : day);
    }
  };

  // Check if a day is today
  const isToday = (day: number) => {
    const today = new Date();
    return day === today.getDate() &&
           currentDate.getMonth() === today.getMonth() &&
           currentDate.getFullYear() === today.getFullYear();
  };

  // Build calendar grid
  const calendarDays = useMemo(() => {
    const days = [];
    const startingDayOfWeek = firstDayOfMonth.getDay();
    const adjustedStart = startingDayOfWeek === 0 ? 6 : startingDayOfWeek - 1; // Monday = 0

    // Add empty cells for days before month starts
    for (let i = 0; i < adjustedStart; i++) {
      days.push(null);
    }

    // Add all days of the month
    for (let day = 1; day <= lastDayOfMonth.getDate(); day++) {
      days.push(day);
    }

    return days;
  }, [firstDayOfMonth, lastDayOfMonth]);

  // Format time
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit', hour12: false });
  };

  return (
    <div ref={calendarRef} className={styles.calendarWrapper}>
      {/* Subscribe to Calendar button - moved to top */}
      <div className={styles.subscribeSection}>
        <a 
          href={`webcal://${typeof window !== 'undefined' ? window.location.host : 'afaescolabernatdesclot.org'}/api/calendar.ics?locale=${currentLocale}`}
          className={styles.subscribeButton}
          title={translations.subscribeCalendar}
        >
          📅 {translations.subscribeCalendar}
        </a>
      </div>

      {/* Calendar header with month/year navigation */}
      <div className={styles.calendarHeader}>
        <button 
          onClick={goToPreviousMonth} 
          className={styles.navButton}
          aria-label={translations.previousMonth}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12.5 15L7.5 10L12.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <h3 className={styles.monthYear}>
          {translations.months[currentDate.getMonth()]} {currentDate.getFullYear()}
        </h3>
        <button 
          onClick={goToNextMonth} 
          className={styles.navButton}
          aria-label={translations.nextMonth}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M7.5 15L12.5 10L7.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>

      {/* Weekday headers */}
      <div className={styles.weekDays}>
        {translations.weekDays.map((day, index) => (
          <div key={index} className={styles.weekDay}>
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className={styles.calendarGrid}>
        {calendarDays.map((day, index) => {
          const dayEvents = day ? getEventsForDay(day) : [];
          const hasEvents = dayEvents.length > 0;
          const isTodayDate = day ? isToday(day) : false;
          const hasPastEvents = dayEvents.some(e => isPastEvent(e.eventDate));
          const allPast = dayEvents.length > 0 && dayEvents.every(e => isPastEvent(e.eventDate));
          const isSelected = day === selectedDay;

          return (
            <div 
              key={index} 
              className={`${styles.calendarDay} ${!day ? styles.emptyDay : ''} ${hasEvents ? styles.hasEvents : ''} ${isTodayDate ? styles.today : ''} ${allPast ? styles.allPastEvents : ''} ${isSelected ? styles.selected : ''}`}
              title={hasEvents ? dayEvents.map(e => e.title?.[currentLocale] || e.title?.ca || '').join('\n') : ''}
              onClick={() => handleDayClick(day, hasEvents)}
            >
              {day && (
                <>
                  <div className={styles.dayNumber}>{day}</div>
                  {hasEvents && (
                    <div className={styles.eventsIndicator}>
                      {dayEvents.length}
                    </div>
                  )}
                  {isSelected && hasEvents && (
                    <div className={styles.tooltip}>
                      {dayEvents.map((event, idx) => (
                        <div 
                          key={event._id} 
                          className={`${styles.tooltipItem} ${isPastEvent(event.eventDate) ? styles.tooltipPast : ''}`}
                        >
                          {event.title?.[currentLocale] || event.title?.ca || ''}
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* Events list for selected month */}
      <div className={styles.eventsSection}>
        <h4 className={styles.eventsSectionTitle}>
          {translations.months[currentDate.getMonth()]} - {monthEvents.length} {monthEvents.length === 1 ? translations.event : translations.events}
        </h4>
        {monthEvents.length > 0 ? (
          <div className={styles.eventsList}>
            {monthEvents.map((event) => {
              const eventDate = new Date(event.eventDate);
              const day = eventDate.getDate();

              const eventCard = (
                <div 
                  key={event._id} 
                  className={`${styles.eventCard} ${event.externalUrl ? styles.clickable : ''}`}
                >
                  <div className={styles.eventDate}>
                    <div className={styles.eventDay}>{day}</div>
                  </div>
                  <div className={styles.eventInfo}>
                    <h5 className={styles.eventTitle}>
                      {event.title?.[currentLocale] || event.title?.ca || 'Sense títol'}
                    </h5>
                    {event.excerpt?.[currentLocale] && (
                      <p className={styles.eventExcerpt}>
                        {event.excerpt[currentLocale]}
                      </p>
                    )}
                  </div>
                </div>
              );

              // If event has external URL, wrap in anchor tag
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
        ) : (
          <p className={styles.noEvents}>{translations.noEvents}</p>
        )}
      </div>
    </div>
  );
}
