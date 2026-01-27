import { NextResponse } from 'next/server';
import { getAllEvents } from '@/lib/sanity';
import type { NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 3600; // Revalidate every hour

type Locale = 'ca' | 'es' | 'en' | 'ar' | 'ur';

// Escape special characters for iCal format
function escapeICalText(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n');
}

// Format date for iCal (YYYYMMDDTHHMMSSZ)
function formatICalDate(date: Date): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  const hours = String(date.getUTCHours()).padStart(2, '0');
  const minutes = String(date.getUTCMinutes()).padStart(2, '0');
  const seconds = String(date.getUTCSeconds()).padStart(2, '0');
  return `${year}${month}${day}T${hours}${minutes}${seconds}Z`;
}

// Generate a unique UID for each event
function generateUID(eventId: string, domain: string): string {
  return `${eventId}@${domain}`;
}

export async function GET(request: NextRequest) {
  try {
    // Get locale from URL parameter, default to 'ca'
    const { searchParams } = new URL(request.url);
    const locale = (searchParams.get('locale') || 'ca') as Locale;
    
    const events = await getAllEvents();
    const domain = process.env.NEXT_PUBLIC_BASE_URL?.replace('https://', '').replace('http://', '') || 'afaescolabernatdesclot.org';
    const now = new Date();
    const timestamp = formatICalDate(now);

    // Calendar names in different languages
    const calendarNames: Record<Locale, string> = {
      ca: 'AFA Bernat Desclot - Esdeveniments',
      es: 'AFA Bernat Desclot - Eventos',
      en: 'AFA Bernat Desclot - Events',
      ar: 'AFA Bernat Desclot - الفعاليات',
      ur: 'AFA Bernat Desclot - واقعات',
    };

    const calendarDescriptions: Record<Locale, string> = {
      ca: "Calendari d'esdeveniments de l'AFA Escola Bernat Desclot",
      es: 'Calendario de eventos de la AFA Escuela Bernat Desclot',
      en: 'AFA Bernat Desclot School Events Calendar',
      ar: 'تقويم فعاليات مدرسة AFA Bernat Desclot',
      ur: 'AFA Bernat Desclot اسکول کے واقعات کی تقویم',
    };

    // Start iCal file
    let icalContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//AFA Escola Bernat Desclot//Events Calendar//CA',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      `X-WR-CALNAME:${calendarNames[locale]}`,
      'X-WR-TIMEZONE:Europe/Madrid',
      `X-WR-CALDESC:${calendarDescriptions[locale]}`,
    ].join('\r\n');

    // Add timezone definition for Europe/Madrid
    icalContent += '\r\n' + [
      'BEGIN:VTIMEZONE',
      'TZID:Europe/Madrid',
      'BEGIN:DAYLIGHT',
      'TZOFFSETFROM:+0100',
      'TZOFFSETTO:+0200',
      'TZNAME:CEST',
      'DTSTART:19700329T020000',
      'RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=-1SU',
      'END:DAYLIGHT',
      'BEGIN:STANDARD',
      'TZOFFSETFROM:+0200',
      'TZOFFSETTO:+0100',
      'TZNAME:CET',
      'DTSTART:19701025T030000',
      'RRULE:FREQ=YEARLY;BYMONTH=10;BYDAY=-1SU',
      'END:STANDARD',
      'END:VTIMEZONE',
    ].join('\r\n');

    // Add each event
    for (const event of events) {
      // Use startDate and endDate
      const startDate = new Date(event.startDate);
      const endDate = new Date(event.endDate);
      
      // Get title and description in the requested locale with fallback
      const title = event.title?.[locale] || event.title?.ca || event.title?.es || event.title?.en || 'Event';
      const description = event.excerpt?.[locale] || event.excerpt?.ca || event.excerpt?.es || event.excerpt?.en || '';
      
      // Check if startDate and endDate are EXACTLY the same (date AND time)
      // Only then it's an all-day event
      const isAllDayEvent = startDate.getTime() === endDate.getTime();

      const eventLines = [
        'BEGIN:VEVENT',
        `UID:${generateUID(event._id, domain)}`,
        `DTSTAMP:${timestamp}`,
      ];

      if (isAllDayEvent) {
        // All-day event: use DATE format (no time)
        const startDateStr = startDate.toISOString().split('T')[0];
        const dateFormatted = startDateStr.replace(/-/g, '');
        const nextDay = new Date(startDate);
        nextDay.setDate(nextDay.getDate() + 1);
        const nextDayFormatted = nextDay.toISOString().split('T')[0].replace(/-/g, '');
        
        eventLines.push(`DTSTART;VALUE=DATE:${dateFormatted}`);
        eventLines.push(`DTEND;VALUE=DATE:${nextDayFormatted}`);
      } else {
        // Timed event or multi-day event: use DATE-TIME format
        // For multi-day events, the calendar app will show it spanning multiple days
        eventLines.push(`DTSTART:${formatICalDate(startDate)}`);
        eventLines.push(`DTEND:${formatICalDate(endDate)}`);
      }

      eventLines.push(`SUMMARY:${escapeICalText(title)}`);

      if (description) {
        eventLines.push(`DESCRIPTION:${escapeICalText(description)}`);
      }

      if (event.externalUrl) {
        eventLines.push(`URL:${event.externalUrl}`);
      }

      // Add location with full address and GPS coordinates
      eventLines.push('LOCATION:CEIP Bernat Desclot\\, Carrer de l\'Aprestadora\\, 35\\, 08902 L\'Hospitalet de Llobregat\\, Barcelona');
      eventLines.push('GEO:41.3633139;2.1283367');
      
      // Set status and transparency
      eventLines.push('STATUS:CONFIRMED');
      eventLines.push('TRANSP:TRANSPARENT');
      
      eventLines.push('END:VEVENT');
      
      icalContent += '\r\n' + eventLines.join('\r\n');
    }

    // End iCal file
    icalContent += '\r\n' + 'END:VCALENDAR';

    // Return iCal file with proper headers
    return new NextResponse(icalContent, {
      headers: {
        'Content-Type': 'text/calendar; charset=utf-8',
        'Content-Disposition': `attachment; filename="afa-bernat-desclot-events-${locale}.ics"`,
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    });
  } catch (error) {
    console.error('Error generating iCal:', error);
    return new NextResponse('Error generating calendar', { status: 500 });
  }
}
