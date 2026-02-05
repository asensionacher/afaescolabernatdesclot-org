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

    // Header - Title
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('AMPA ESCOLA BERNAT DESCLOT', pageWidth / 2, y, { align: 'center' })
    y += 10

    doc.text(report.title, pageWidth / 2, y, { align: 'center' })
    y += 10

    doc.text(report.location, pageWidth / 2, y, { align: 'center' })
    y += 15

    // Meeting Date
    doc.setFontSize(11)
    doc.setFont('helvetica', 'normal')
    doc.text(`Data: ${formatDate(report.meetingDate)}`, margin, y)
    y += 10

    // Attendees section
    doc.setFont('helvetica', 'bold')
    doc.text('Assistents:', margin, y)
    y += 7

    // Attendees table
    const tableStartX = margin
    const colWidths = [60, 30, 70]
    
    // Table header
    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.text("Nom de l'alumno/a", tableStartX, y)
    doc.text('Curs', tableStartX + colWidths[0], y)
    doc.text("Nom de l'assistent", tableStartX + colWidths[0] + colWidths[1], y)
    y += 5

    // Table rows
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)

    report.attendees.forEach((attendee) => {
      // Draw borders
      doc.rect(tableStartX, y - 4, colWidths[0], 6)
      doc.rect(tableStartX + colWidths[0], y - 4, colWidths[1], 6)
      doc.rect(tableStartX + colWidths[0] + colWidths[1], y - 4, colWidths[2], 6)

      // Draw text
      doc.text(attendee.studentName, tableStartX + 1, y)
      doc.text(attendee.course, tableStartX + colWidths[0] + 1, y)
      doc.text(attendee.attendantName, tableStartX + colWidths[0] + colWidths[1] + 1, y)
      y += 6
    })

    y += 10

    // Convocation info
    if (report.convocationInfo) {
      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      const convocationLines = doc.splitTextToSize(report.convocationInfo, maxWidth)
      doc.text(convocationLines, margin, y)
      y += convocationLines.length * 5 + 5
    }

    // Welcome message (italic)
    if (report.welcomeMessage) {
      doc.setFont('helvetica', 'italic')
      const welcomeLines = doc.splitTextToSize(report.welcomeMessage, maxWidth)
      doc.text(welcomeLines, margin, y)
      y += welcomeLines.length * 5 + 5
    }

    // Topics
    if (report.topics && report.topics.length > 0) {
      doc.setFont('helvetica', 'normal')
      doc.text('Es van valorar diferents tematiques de disfressa:', margin, y)
      y += 7

      report.topics.forEach((topic) => {
        doc.text(`• ${topic}`, margin + 5, y)
        y += 5
      })
      y += 5
    }

    // Main content
    doc.setFont('helvetica', 'normal')
    const contentLines = doc.splitTextToSize(report.content, maxWidth)
    
    contentLines.forEach((line: string) => {
      if (y > 270) {
        doc.addPage()
        y = 20
      }
      doc.text(line, margin, y)
      y += 5
    })

    y += 10

    // Questions
    const questionsText = report.questions
      ? 'Si que hi ha preguntes per part dels assistents i es dona per finalitzada la reunio.'
      : 'No hi ha preguntes per part dels assistents i es dona per finalitzada la reunio.'
    
    if (y > 270) {
      doc.addPage()
      y = 20
    }

    const questionsLines = doc.splitTextToSize(questionsText, maxWidth)
    doc.text(questionsLines, margin, y)
    y += questionsLines.length * 5 + 15

    // Signature
    if (y > 250) {
      doc.addPage()
      y = 20
    }

    doc.text(report.signerName, margin, y)
    y += 5
    doc.text(report.signerRole, margin, y)

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
