import { NextRequest, NextResponse } from 'next/server'
import { getMeetingReportById, closeMeetingReport } from '@/lib/sanity'
import { isAuthenticated } from '@/lib/auth'
import { generateActaPDF } from '@/lib/generateActaPDF'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

interface RouteParams {
  params: Promise<{
    id: string
  }>
}

export async function POST(_request: NextRequest, { params }: RouteParams) {
  try {
    const authenticated = await isAuthenticated()
    
    if (!authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const report = await getMeetingReportById(id)

    if (!report) {
      return NextResponse.json({ error: 'Acta no trobada' }, { status: 404 })
    }

    if (report.status === 'closed') {
      return NextResponse.json(
        { error: "L'acta ja està tancada" },
        { status: 400 }
      )
    }

    // Close the report first
    const closedReport = await closeMeetingReport(id)

    // Generate PDF
    const pdfBuffer = generateActaPDF(closedReport)

    // Send to Telegram if configured
    const botToken = process.env.TELEGRAM_BOT_TOKEN
    const chatId = process.env.TELEGRAM_CHAT_ID

    if (botToken && chatId) {
      try {
        const filename = `acta_${closedReport.meetingDate.split('T')[0]}.pdf`
        
        const formData = new FormData()
        formData.append('chat_id', chatId)
        formData.append('document', new Blob([new Uint8Array(pdfBuffer)], { type: 'application/pdf' }), filename)
        formData.append('caption', `📄 Acta tancada: ${closedReport.title}\nData: ${new Date(closedReport.meetingDate).toLocaleDateString('ca-ES')}`)

        const telegramResponse = await fetch(
          `https://api.telegram.org/bot${botToken}/sendDocument`,
          {
            method: 'POST',
            body: formData,
          }
        )

        if (!telegramResponse.ok) {
          // Log error but don't fail the request
          if (process.env.NODE_ENV === 'development') {
            console.error('Failed to send PDF to Telegram')
          }
        }
      } catch (telegramError) {
        // Log error but don't fail the request
        if (process.env.NODE_ENV === 'development') {
          console.error('Error sending to Telegram:', telegramError)
        }
      }
    }

    return NextResponse.json(closedReport)
  } catch (error) {
    return NextResponse.json(
      { error: "Error al tancar l'acta" },
      { status: 500 }
    )
  }
}

