import type { MembershipStatus } from '@prisma/client'
import { getMembershipStatus, isPaidMember } from '@/lib/school-year'

export type PriceTier = 'MEMBER' | 'NON_MEMBER'

export interface PriceResolution {
  tier: PriceTier
  /** Precio aplicable en céntimos. */
  price: number
  memberPrice: number
  nonMemberPrice: number
  membershipStatus: MembershipStatus | null
  /** El usuario tiene precio de miembro (sesión iniciada y cuota pagada). */
  isMember: boolean
}

/**
 * Resuelve el precio de un formulario.
 * - Miembro con la cuota del curso pagada (o exenta) → precio de miembro.
 * - Cualquier otro caso (no registrado, sin cuota o cuota pendiente) → precio de no miembro.
 */
export async function resolvePrice(
  form: { memberPrice: number; nonMemberPrice: number; schoolYearId: string },
  userId: string | null | undefined,
): Promise<PriceResolution> {
  const status = await getMembershipStatus(userId, form.schoolYearId)
  const member = isPaidMember(status)

  return {
    tier: member ? 'MEMBER' : 'NON_MEMBER',
    price: member ? form.memberPrice : form.nonMemberPrice,
    memberPrice: form.memberPrice,
    nonMemberPrice: form.nonMemberPrice,
    membershipStatus: status,
    isMember: member,
  }
}
