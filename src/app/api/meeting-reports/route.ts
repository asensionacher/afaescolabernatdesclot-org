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
    console.error('Error fetching meeting reports:', error)
    return NextResponse.json(
      { error: 'Error al cargar los partes' },
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
    console.error('Error creating meeting report:', error)
    return NextResponse.json(
      { error: 'Error al crear el parte' },
      { status: 500 }
    )
  }
}
