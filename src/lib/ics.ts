/**
 * Generates an ICS (iCalendar) file content for calendar events
 * @param event - Event details
 * @returns ICS file content as string
 */
export function generateICSContent(event: {
  title: string;
  description: string;
  location: string;
  startTime: string; // ISO string
  endTime: string;   // ISO string
  id: string;
}): string {
  // Format dates for ICS (YYYYMMDDTHHMMSSZ)
  const startDate = new Date(event.startTime).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  const endDate = new Date(event.endTime).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  const now = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

  return `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Offly//Event Booking//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
BEGIN:VEVENT
UID:${event.id}@offly.app
DTSTAMP:${now}
DTSTART:${startDate}
DTEND:${endDate}
SUMMARY:${event.title}
DESCRIPTION:${event.description}
LOCATION:${event.location}
STATUS:CONFIRMED
SEQUENCE:0
BEGIN:VALARM
TRIGGER:-PT15M
ACTION:DISPLAY
DESCRIPTION:Reminder: ${event.title}
END:VALARM
END:VEVENT
END:VCALENDAR`.trim();
}

/**
 * Converts ICS content to base64 for email attachment
 * @param icsContent - The ICS file content
 * @returns Base64 encoded string
 */
export function icsToBase64(icsContent: string): string {
  return Buffer.from(icsContent, 'utf-8').toString('base64');
}