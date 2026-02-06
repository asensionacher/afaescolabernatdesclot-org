import { jsPDF } from 'jspdf'
import type { MeetingReport } from './sanity'

// Add custom font support for Catalan characters
function addFont(doc: jsPDF) {
  doc.setFont('helvetica')
}

// Remove emojis and other special characters that don't render well in PDF
function removeEmojis(text: string): string {
  return text
    .replace(/[\u{1F600}-\u{1F64F}]/gu, '') // Emoticons
    .replace(/[\u{1F300}-\u{1F5FF}]/gu, '') // Misc Symbols and Pictographs
    .replace(/[\u{1F680}-\u{1F6FF}]/gu, '') // Transport and Map
    .replace(/[\u{1F1E0}-\u{1F1FF}]/gu, '') // Flags
    .replace(/[\u{2600}-\u{26FF}]/gu, '')   // Misc symbols
    .replace(/[\u{2700}-\u{27BF}]/gu, '')   // Dingbats
    .replace(/[\u{1F900}-\u{1F9FF}]/gu, '') // Supplemental Symbols and Pictographs
    .replace(/[\u{1FA00}-\u{1FA6F}]/gu, '') // Chess Symbols
    .replace(/[\u{1FA70}-\u{1FAFF}]/gu, '') // Symbols and Pictographs Extended-A
    .replace(/🧪/g, '')
    .trim()
}

export function generateActaPDF(report: MeetingReport): Buffer {
  const doc = new jsPDF()
  addFont(doc)

  const pageWidth = doc.internal.pageSize.getWidth()
  const margin = 20
  const maxWidth = pageWidth - 2 * margin
  let y = 20

  // Helper function to check if we need a new page
  const checkNewPage = (requiredSpace: number = 10) => {
    if (y + requiredSpace > 270) {
      doc.addPage()
      y = 20
    }
  }

  // Header - Organization name
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.text('AMPA ESCOLA BERNAT DESCLOT', pageWidth / 2, y, { align: 'center' })
  y += 10

  // Title (remove emojis) - with word wrap
  doc.setFontSize(14)
  const cleanTitle = removeEmojis(report.title)
  const titleLines = doc.splitTextToSize(cleanTitle, maxWidth)
  
  // Center each line of the title
  titleLines.forEach((line: string) => {
    doc.text(line, pageWidth / 2, y, { align: 'center' })
    y += 7
  })
  
  y += 8 // Extra space after title

  // Meeting Date
  doc.setFontSize(11)
  doc.setFont('helvetica', 'normal')
  const formattedDate = new Date(report.meetingDate).toLocaleDateString('ca-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
  doc.text(`Data: ${formattedDate}`, margin, y)
  y += 10

  // Attendees section
  checkNewPage(20)
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text('Assistents:', margin, y)
  y += 7

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  
  report.attendees.forEach((attendee) => {
    checkNewPage(15)
    const cleanStudentName = removeEmojis(attendee.studentName)
    const cleanCourse = removeEmojis(attendee.course)
    const cleanAttendantName = removeEmojis(attendee.attendantName)
    
    doc.text(`• Alumne/a: ${cleanStudentName}`, margin + 5, y)
    y += 5
    doc.text(`  Curs: ${cleanCourse}`, margin + 5, y)
    y += 5
    doc.text(`  Assistent: ${cleanAttendantName}`, margin + 5, y)
    y += 7
  })

  y += 5

  // Content section
  checkNewPage(20)
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text('Contingut:', margin, y)
  y += 7

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')

  // Parse HTML content and render as plain text with basic formatting
  const tempDiv = {
    innerHTML: report.content,
    querySelectorAll: () => [],
    textContent: report.content
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/p>/gi, '\n')
      .replace(/<p>/gi, '')
      .replace(/<li>/gi, '• ')
      .replace(/<\/li>/gi, '\n')
      .replace(/<[^>]+>/g, '')
      .replace(/&nbsp;/g, ' ')
  }

  const cleanContent = removeEmojis(tempDiv.textContent || '')
  const contentLines = doc.splitTextToSize(cleanContent, maxWidth)
  
  contentLines.forEach((line: string) => {
    checkNewPage()
    doc.text(line, margin, y)
    y += 5
  })

  y += 10

  // Signer section
  checkNewPage(30)
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text('Signat per:', margin, y)
  y += 7
  
  doc.setFont('helvetica', 'bold')
  doc.text(removeEmojis(report.signerName), margin, y)
  y += 5
  
  doc.setFont('helvetica', 'normal')
  doc.text(removeEmojis(report.signerRole), margin, y)

  // Generate PDF buffer
  return Buffer.from(doc.output('arraybuffer'))
}
