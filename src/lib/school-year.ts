import { prisma } from '@/lib/db'
import type { MembershipStatus, SchoolYear } from '@prisma/client'

/** Curso escolar actual (marcado como tal). Si no hay, se deduce por fechas. */
export async function getCurrentSchoolYear(): Promise<SchoolYear | null> {
  const flagged = await prisma.schoolYear.findFirst({
    where: { isCurrent: true },
    orderBy: { startDate: 'desc' },
  })
  if (flagged) return flagged

  const now = new Date()
  const byDates = await prisma.schoolYear.findFirst({
    where: { startDate: { lte: now }, endDate: { gte: now } },
    orderBy: { startDate: 'desc' },
  })
  return byDates
}

export async function listSchoolYears(): Promise<SchoolYear[]> {
  return prisma.schoolYear.findMany({
    orderBy: [{ isCurrent: 'desc' }, { startDate: 'desc' }],
  })
}

/** Nombre corto del curso: "2026/2027". */
export function schoolYearLabel(schoolYear: Pick<SchoolYear, 'name'>): string {
  return schoolYear.name
}

/**
 * Estado de la cuota de un usuario para un curso.
 * EXEMPT también da acceso a los precios de miembro.
 */
export async function getMembershipStatus(
  userId: string | null | undefined,
  schoolYearId: string,
): Promise<MembershipStatus | null> {
  if (!userId) return null
  const membership = await prisma.membership.findUnique({
    where: { userId_schoolYearId: { userId, schoolYearId } },
    select: { status: true },
  })
  return membership?.status ?? null
}

/** Un miembro tiene precio de miembro si su cuota está pagada o es exenta. */
export function isPaidMember(status: MembershipStatus | null | undefined): boolean {
  return status === 'PAID' || status === 'EXEMPT'
}
