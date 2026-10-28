import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const user = await getCurrentUser()

  if (!user) {
    return NextResponse.json({ error: 'No autoritzat' }, { status: 401 })
  }

  const upload = await prisma.upload.findUnique({ where: { id } })
  if (!upload) {
    return NextResponse.json({ error: 'Fitxer no trobat' }, { status: 404 })
  }

  if (user.role !== 'ADMIN') {
    const owns = await prisma.submission.findFirst({
      where: { userId: user.id, answers: { array_contains: [{ value: id }] } },
      select: { id: true },
    })
    if (!owns) {
      return NextResponse.json({ error: 'No autoritzat' }, { status: 403 })
    }
  }

  return new NextResponse(new Uint8Array(upload.data), {
    headers: {
      'Content-Type': upload.mimeType,
      'Content-Disposition': `inline; filename="${upload.filename.replace(/"/g, '')}"`,
      'Cache-Control': 'private, no-store',
    },
  })
}
