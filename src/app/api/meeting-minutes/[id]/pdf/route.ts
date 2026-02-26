import { NextRequest, NextResponse } from 'next/server'
import { getMeetingReportById } from '@/lib/sanity'
import { isAuthenticated } from '@/lib/auth'
import { generateActaPDF } from '@/lib/generateActaPDF'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

interface RouteParams {
  params: Promise<{
    id: string
  }>
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
      return NextResponse.json({ error: 'Acta no trobada' }, { status: 404 })
    }

    // Generate PDF using helper function
    const pdfBuffer = generateActaPDF(report)

    // Return PDF
    const actaNum = report.actaNumber ? `_${report.actaNumber}` : ''
    return new NextResponse(pdfBuffer as unknown as BodyInit, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="acta${actaNum}_${report.meetingDate.split('T')[0]}.pdf"`,
      },
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Error al generar el PDF' },
      { status: 500 }
    )
  }
}
