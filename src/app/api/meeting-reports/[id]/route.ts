import { NextRequest, NextResponse } from 'next/server'
import { getMeetingReportById, updateMeetingReport, deleteMeetingReport } from '@/lib/sanity'
import { isAuthenticated } from '@/lib/auth'

export const dynamic = 'force-dynamic'

interface RouteParams {
  params: Promise<{
    id: string
  }>
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
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
        { error: 'No se puede editar un parte cerrado' },
        { status: 400 }
      )
    }

    const data = await request.json()
    const updatedReport = await updateMeetingReport(id, data)

    return NextResponse.json(updatedReport)
  } catch (error) {
    console.error('Error updating meeting report:', error)
    return NextResponse.json(
      { error: 'Error al actualizar el parte' },
      { status: 500 }
    )
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
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
        { error: 'No se puede eliminar un parte cerrado' },
        { status: 400 }
      )
    }

    await deleteMeetingReport(id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting meeting report:', error)
    return NextResponse.json(
      { error: 'Error al eliminar el parte' },
      { status: 500 }
    )
  }
}
