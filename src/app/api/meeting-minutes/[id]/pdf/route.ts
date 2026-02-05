import { NextRequest, NextResponse } from 'next/server'
import { jsPDF } from 'jspdf'
import { getMeetingReportById } from '@/lib/sanity'
import { isAuthenticated } from '@/lib/auth'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

interface RouteParams {
  params: Promise<{
    id: string
  }>
}

// Add custom font support for Catalan characters
function addFont(doc: jsPDF) {
  // Set default font
  doc.setFont('helvetica')
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('ca-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
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
    .replace(/🧪/g, '')                      // Test tube emoji
    .trim()
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const authenticated = await isAuthenticated()
    
    if (!authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const report = await getMeetingReportById(id)

    if (!report) {
      return NextResponse.json({ error: 'Parte no encontrado' }, { status: 404 })
    }

    // Create PDF
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

    // Title (remove emojis)
    doc.setFontSize(14)
    const cleanTitle = removeEmojis(report.title)
    doc.text(cleanTitle, pageWidth / 2, y, { align: 'center' })
    y += 15

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
    y += 12

    // Attendees section
    if (report.attendees && report.attendees.length > 0) {
      checkNewPage(20)
      
      doc.setFontSize(12)
      doc.setFont('helvetica', 'bold')
      doc.text('Assistents:', margin, y)
      y += 8

      // Attendees table
      const tableStartX = margin
      const colWidths = [60, 30, 70]
      
      // Table header
      doc.setFontSize(10)
      doc.setFont('helvetica', 'bold')
      doc.text("Nom de l'alumne/a", tableStartX, y)
      doc.text('Curs', tableStartX + colWidths[0], y)
      doc.text("Nom de l'assistent", tableStartX + colWidths[0] + colWidths[1], y)
      y += 5

      // Table rows
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(9)

      report.attendees.forEach((attendee) => {
        checkNewPage(8)
        
        // Draw borders
        doc.rect(tableStartX, y - 4, colWidths[0], 6)
        doc.rect(tableStartX + colWidths[0], y - 4, colWidths[1], 6)
        doc.rect(tableStartX + colWidths[0] + colWidths[1], y - 4, colWidths[2], 6)

        // Draw text (remove emojis)
        doc.text(removeEmojis(attendee.studentName), tableStartX + 1, y)
        doc.text(removeEmojis(attendee.course), tableStartX + colWidths[0] + 1, y)
        doc.text(removeEmojis(attendee.attendantName), tableStartX + colWidths[0] + colWidths[1] + 1, y)
        y += 6
      })

      y += 12
    }

    // Content section - parse HTML from Quill editor
    if (report.content) {
      checkNewPage(15)
      
      doc.setFontSize(12)
      doc.setFont('helvetica', 'bold')
      doc.text('Contingut:', margin, y)
      y += 8

      // Simple HTML parser for basic formatting
      // Remove HTML tags and convert to plain text with basic formatting
      const htmlContent = report.content
      
      // Convert HTML to lines with basic formatting
      const tempDiv = htmlContent
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(/<\/p>/gi, '\n\n')
        .replace(/<p>/gi, '')
        .replace(/<strong>(.*?)<\/strong>/gi, '$1') // Keep bold text (jsPDF doesn't support inline bold easily)
        .replace(/<em>(.*?)<\/em>/gi, '$1') // Keep italic text
        .replace(/<u>(.*?)<\/u>/gi, '$1') // Keep underlined text
        .replace(/<li>(.*?)<\/li>/gi, '  • $1\n')
        .replace(/<\/?ul>/gi, '\n')
        .replace(/<\/?ol>/gi, '\n')
        .replace(/<[^>]*>/g, '') // Remove remaining HTML tags
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
      
      // Remove emojis from content
      const cleanContent = removeEmojis(tempDiv.trim())
      
      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      
      const contentLines = doc.splitTextToSize(cleanContent, maxWidth)
      
      contentLines.forEach((line: string) => {
        checkNewPage()
        doc.text(line, margin, y)
        y += 5
      })

      y += 10
    }

    // Signature section
    checkNewPage(20)
    
    y += 5
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text('Signat per:', margin, y)
    y += 7
    
    doc.setFont('helvetica', 'bold')
    doc.text(removeEmojis(report.signerName), margin, y)
    y += 5
    
    doc.setFont('helvetica', 'normal')
    doc.text(removeEmojis(report.signerRole), margin, y)

    // Generate PDF buffer
    const pdfBuffer = Buffer.from(doc.output('arraybuffer'))

    // Return PDF
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="parte_${report.meetingDate.split('T')[0]}.pdf"`,
      },
    })
  } catch (error) {
    console.error('Error generating PDF:', error)
    return NextResponse.json(
      { error: 'Error al generar el PDF' },
      { status: 500 }
    )
  }
}
