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
    console.log('🗑️ Attempting to delete meeting report:', id)
    
    const report = await getMeetingReportById(id)

    if (!report) {
      console.log('❌ Report not found:', id)
      return NextResponse.json({ error: 'Parte no encontrado' }, { status: 404 })
    }

    if (report.status === 'closed') {
      console.log('❌ Cannot delete closed report:', id)
      return NextResponse.json(
        { error: 'No se puede eliminar un parte cerrado' },
        { status: 400 }
      )
    }

    console.log('📝 Deleting report:', { id, title: report.title, status: report.status })
    await deleteMeetingReport(id)
    console.log('✅ Report deleted successfully:', id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('❌ Error deleting meeting report:', error)
    console.error('Error details:', {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : String(error),
    })
    return NextResponse.json(
      { error: 'Error al eliminar el parte', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}
