import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const user = await getCurrentUser()

  if (!user) {
    return NextResponse.json({ error: 'No autoritzat' }, { status: 401 })
  }

  const submission = await prisma.submission.findUnique({
    where: { id },
    select: { pdfData: true, pdfFilename: true, userId: true },
  })

  if (!submission?.pdfData) {
    return NextResponse.json({ error: 'PDF no disponible' }, { status: 404 })
  }

  if (user.role !== 'ADMIN' && submission.userId !== user.id) {
    return NextResponse.json({ error: 'No autoritzat' }, { status: 403 })
  }

  return new NextResponse(new Uint8Array(submission.pdfData), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="${submission.pdfFilename ?? 'formulari.pdf'}"`,
      'Cache-Control': 'private, no-store',
    },
  })
}
