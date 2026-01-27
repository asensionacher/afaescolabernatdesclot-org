'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { Event } from '@/lib/sanity';
import SubscribeModal from './SubscribeModal';
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
    allDay: string;
    subscribeCalendar: string;
    months: string[];
    weekDays: string[];
    subscribeModal: {
      title: string;
      description: string;
      copyUrl: string;
      urlCopied: string;
      close: string;
    };
  };
}

export default function EventCalendar({ events, locale, translations }: EventCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
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

  // Filter events for current month (only future or ongoing events)
  const monthEvents = useMemo(() => {
    const now = new Date();
    const firstOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const lastOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

    return events.filter(event => {
      const start = new Date(event.startDate);
      const end = new Date(event.endDate);

      // Event must not have finished yet
      if (end < now) return false;

      // Event intersects with current month: start <= lastOfMonth && end >= firstOfMonth
      return start <= lastOfMonth && end >= firstOfMonth;
    });
  }, [events, currentDate]);

  // Check if event is in the past (based on endDate)
  const isPastEvent = (endDate: string) => {
    const eventEnd = new Date(endDate);
    const now = new Date();
    return eventEnd < now;
  };

  // Get events for a specific day (all events, including past and multi-day events)
  const getEventsForDay = (day: number) => {
    const dateForDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    dateForDay.setHours(0, 0, 0, 0);

    return events.filter(event => {
      const start = new Date(event.startDate);
      const end = new Date(event.endDate);
      start.setHours(0, 0, 0, 0);
      end.setHours(0, 0, 0, 0);

      // Event spans this day if: start <= dateForDay <= end
      return start <= dateForDay && dateForDay <= end;
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

  // Format date short (e.g., "15 ene")
  const formatDateShort = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(locale, { day: 'numeric', month: 'short' });
  };

  // Format time range for events
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

  // Generate calendar URL
  const calendarUrl = `webcal://${typeof window !== 'undefined' ? window.location.host : 'afaescolabernatdesclot.org'}/api/calendar.ics?locale=${currentLocale}`;

  return (
    <>
      <div ref={calendarRef} className={styles.calendarWrapper}>
        {/* Subscribe to Calendar button - moved to top */}
        <div className={styles.subscribeSection}>
          <button 
            onClick={() => setIsModalOpen(true)}
            className={styles.subscribeButton}
          >
            📅 {translations.subscribeCalendar}
          </button>
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
          const hasPastEvents = dayEvents.some(e => isPastEvent(e.endDate));
          const allPast = dayEvents.length > 0 && dayEvents.every(e => isPastEvent(e.endDate));
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
                          className={`${styles.tooltipItem} ${isPastEvent(event.endDate) ? styles.tooltipPast : ''}`}
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
              const eventDate = new Date(event.startDate);
              const day = eventDate.getDate();
              const timeRange = formatTimeRange(event.startDate, event.endDate);

              const eventCard = (
                <div 
                  key={event._id} 
                  className={`${styles.eventCard} ${event.externalUrl ? styles.clickable : ''}`}
                >
                  <div className={styles.eventDate}>
                    <div className={styles.eventDay}>{day}</div>
                    <div className={styles.eventMonth}>{translations.months[eventDate.getMonth()].substring(0, 3)}</div>
                  </div>
                  <div className={styles.eventInfo}>
                    <h5 className={styles.eventTitle}>
                      {event.title?.[currentLocale] || event.title?.ca || 'Sense títol'}
                    </h5>
                    <p className={styles.eventTime}>
                      {timeRange}
                    </p>
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

    <SubscribeModal
      isOpen={isModalOpen}
      onClose={() => setIsModalOpen(false)}
      calendarUrl={calendarUrl}
      locale={locale}
      translations={translations.subscribeModal}
    />
  </>
  );
}
