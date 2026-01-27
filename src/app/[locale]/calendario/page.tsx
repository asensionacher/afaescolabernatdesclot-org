import { getTranslations } from 'next-intl/server';
import { getAllEvents } from '@/lib/sanity';
import EventCalendar from '@/components/EventCalendar';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Metadata } from 'next';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  
  return {
    title: locale === 'ca' ? 'Calendari d\'Esdeveniments - AFA Bernat Desclot' :
           locale === 'es' ? 'Calendario de Eventos - AFA Bernat Desclot' :
           locale === 'en' ? 'Events Calendar - AFA Bernat Desclot' :
           locale === 'ar' ? 'تقويم الفعاليات - AFA Bernat Desclot' :
           'واقعات کی تقویم - AFA Bernat Desclot',
    description: locale === 'ca' ? 'Consulta tots els esdeveniments de l\'AFA Escola Bernat Desclot' :
                 locale === 'es' ? 'Consulta todos los eventos de la AFA Escuela Bernat Desclot' :
                 locale === 'en' ? 'View all AFA Bernat Desclot School events' :
                 locale === 'ar' ? 'عرض جميع فعاليات مدرسة AFA Bernat Desclot' :
                 'AFA Bernat Desclot اسکول کے تمام واقعات دیکھیں',
  };
}

export default async function CalendarPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const tCalendar = await getTranslations('calendar');
  const tPage = await getTranslations('calendarPage');
  
  // Get all events from Sanity
  const events = await getAllEvents();

  return (
    <>
      <Navigation locale={locale} />
      <main style={{ padding: '2rem 0', background: 'var(--color-bg)', minHeight: 'calc(100vh - 80px - 200px)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <h1 style={{ fontSize: '2.5rem', fontWeight: '800', color: 'var(--color-primary)', marginBottom: '1rem', fontFamily: 'var(--font-primary)' }}>
              {tPage('title')}
            </h1>
            <p style={{ fontSize: '1.2rem', color: 'var(--color-text-light)', maxWidth: '600px', margin: '0 auto', lineHeight: '1.8' }}>
              {tPage('description')}
            </p>
          </div>

          <EventCalendar 
            events={events}
            locale={locale}
            translations={{
              previousMonth: tCalendar('previousMonth'),
              nextMonth: tCalendar('nextMonth'),
              noEvents: tCalendar('noEvents'),
              pastEvent: tCalendar('pastEvent'),
              event: tCalendar('event'),
              events: tCalendar('events'),
              allDay: tCalendar('allDay'),
              subscribeCalendar: tCalendar('subscribeCalendar'),
              months: tCalendar.raw('months') as string[],
              weekDays: tCalendar.raw('weekDays') as string[],
              subscribeModal: tCalendar.raw('subscribeModal') as {
                title: string;
                description: string;
                copyUrl: string;
                urlCopied: string;
                close: string;
              },
            }}
          />
        </div>
      </main>
      <Footer />
    </>
  );
}
