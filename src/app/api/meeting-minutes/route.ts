import { NextRequest, NextResponse } from 'next/server'
import { getAllMeetingReports, createMeetingReport } from '@/lib/sanity'
import { isAuthenticated } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const authenticated = await isAuthenticated()
    
    if (!authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const reports = await getAllMeetingReports()
    return NextResponse.json(reports)
  } catch (error) {
    return NextResponse.json(
      { error: 'Error al carregar les actes' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const authenticated = await isAuthenticated()
    
    if (!authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = await request.json()

    const newReport = await createMeetingReport({
      ...data,
      status: 'draft' as const,
    })

    return NextResponse.json(newReport, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: "Error al crear l'acta", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}
