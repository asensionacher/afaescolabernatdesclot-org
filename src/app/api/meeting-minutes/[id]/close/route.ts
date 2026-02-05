import { NextRequest, NextResponse } from 'next/server'
import { getMeetingReportById, closeMeetingReport } from '@/lib/sanity'
import { isAuthenticated } from '@/lib/auth'

export const dynamic = 'force-dynamic'

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
      return NextResponse.json({ error: 'Parte no encontrado' }, { status: 404 })
    }

    if (report.status === 'closed') {
      return NextResponse.json(
        { error: 'El parte ya está cerrado' },
        { status: 400 }
      )
    }

    const closedReport = await closeMeetingReport(id)

    return NextResponse.json(closedReport)
  } catch (error) {
    console.error('Error closing meeting report:', error)
    return NextResponse.json(
      { error: 'Error al cerrar el parte' },
      { status: 500 }
    )
  }
}
