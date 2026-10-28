/**
 * Prueba de flujo: crea datos de prueba y verifica la lógica de negocio.
 * Uso: pnpm exec tsx scripts/test-flow.ts
 */
import { Prisma, PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { resolvePrice } from '../src/lib/pricing'
import { sortFormsForListing, isFormExpired, parseFields } from '../src/lib/forms'
import { generateSubmissionPdf } from '../src/lib/pdf'

const prisma = new PrismaClient()

async function main() {
  const schoolYear = await prisma.schoolYear.findFirst({ where: { isCurrent: true } })
  if (!schoolYear) throw new Error('No hay curso escolar actual')
  console.log('Curso actual:', schoolYear.name)

  // Miembro con cuota pagada
  const paid = await prisma.user.upsert({
    where: { username: 'familia_pagada' },
    update: {},
    create: {
      username: 'familia_pagada',
      passwordHash: await bcrypt.hash('testing1234', 10),
      name: 'Família Pagada',
      email: 'pagada@example.com',
    },
  })
  await prisma.membership.upsert({
    where: { userId_schoolYearId: { userId: paid.id, schoolYearId: schoolYear.id } },
    update: { status: 'PAID', amount: 2500 },
    create: { userId: paid.id, schoolYearId: schoolYear.id, status: 'PAID', amount: 2500 },
  })

  // Miembro sin cuota pagada
  const unpaid = await prisma.user.upsert({
    where: { username: 'familia_sin_cuota' },
    update: {},
    create: {
      username: 'familia_sin_cuota',
      passwordHash: await bcrypt.hash('testing1234', 10),
      name: 'Família Sense Quota',
      email: 'sensequota@example.com',
    },
  })
  await prisma.membership.upsert({
    where: { userId_schoolYearId: { userId: unpaid.id, schoolYearId: schoolYear.id } },
    update: { status: 'PENDING' },
    create: { userId: unpaid.id, schoolYearId: schoolYear.id, status: 'PENDING' },
  })

  // Formularios
  const forms: Omit<Prisma.FormUncheckedCreateInput, 'schoolYearId'>[] = [
    {
      slug: 'test-sortida-nadal',
      title: { ca: 'Sortida de Nadal', es: 'Excursión de Navidad' },
      description: { ca: 'Prova de sortida', es: 'Prueba de excursión' },
      notice: { ca: '' },
      visibility: 'PUBLIC' as const,
      status: 'PUBLISHED' as const,
      memberPrice: 0,
      nonMemberPrice: 1500,
      publishedAt: new Date('2026-10-01T10:00:00Z'),
      closesAt: new Date('2027-06-30T23:59:00Z'),
      pinned: false,
      fields: [
        { id: 'noms', label: 'Noms i cognoms', type: 'TEXT', required: true },
        { id: 'talla', label: 'Talla de la samarretra', type: 'SELECT', required: true, options: ['S', 'M', 'L'] },
        { id: 'notes', label: 'Notes', type: 'TEXTAREA', required: false },
        { id: 'justificante', label: 'Justificant', type: 'FILE', required: false },
      ],
    },
    {
      slug: 'test-casals-estiu',
      title: { ca: 'Casals d’estiu' },
      description: { ca: 'Prova casals' },
      notice: { ca: '' },
      visibility: 'MEMBERS_ONLY' as const,
      status: 'PUBLISHED' as const,
      memberPrice: 0,
      nonMemberPrice: 3000,
      publishedAt: new Date('2026-11-01T10:00:00Z'),
      closesAt: new Date('2027-07-15T23:59:00Z'),
      pinned: true,
      fields: [{ id: 'noms', label: 'Noms i cognoms', type: 'TEXT', required: true }],
    },
    {
      slug: 'test-caducat',
      title: { ca: 'Formulari caducat' },
      description: { ca: 'Ja ha passat' },
      notice: { ca: '' },
      visibility: 'PUBLIC' as const,
      status: 'PUBLISHED' as const,
      memberPrice: 0,
      nonMemberPrice: 500,
      publishedAt: new Date('2026-09-01T10:00:00Z'),
      closesAt: new Date('2026-09-30T23:59:00Z'),
      pinned: true,
      fields: [{ id: 'noms', label: 'Noms', type: 'TEXT', required: true }],
    },
  ]

  for (const data of forms) {
    await prisma.form.upsert({
      where: { slug: data.slug },
      update: {},
      create: { ...data, schoolYearId: schoolYear.id } as Prisma.FormUncheckedCreateInput,
    })
  }

  // Comprobación de precios
  const sortida = await prisma.form.findUnique({ where: { slug: 'test-sortida-nadal' } })

  const pricePaid = await resolvePrice(sortida!, paid.id)
  const priceUnpaid = await resolvePrice(sortida!, unpaid.id)
  const priceAnon = await resolvePrice(sortida!, null)

  console.log('\n--- Precios (formulario mixto 0€/15€) ---')
  console.log('miembro con cuota pagada:', pricePaid.tier, pricePaid.price)
  console.log('miembro sin cuota      :', priceUnpaid.tier, priceUnpaid.price)
  console.log('anónimo                :', priceAnon.tier, priceAnon.price)

  if (pricePaid.price !== 0) throw new Error('El miembro con cuota debe pagar 0')
  if (priceUnpaid.price !== 1500) throw new Error('El miembro sin cuota debe pagar 15')
  if (priceAnon.price !== 1500) throw new Error('El anónimo debe pagar 15')

  // Comprobación del orden del listado
  const all = await prisma.form.findMany({ where: { schoolYearId: schoolYear.id, status: 'PUBLISHED' } })
  const sorted = sortFormsForListing(all)
  console.log('\n--- Orden del listado ---')
  for (const form of sorted) {
    const title = (form.title as { ca?: string }).ca
    console.log(
      `${isFormExpired(form) ? '[caducat]' : '[actiu]  '} ${form.pinned ? '[ancat]' : '       '} ${title}`,
    )
  }

  if (sorted[sorted.length - 1].slug !== 'test-caducat') {
    throw new Error('El formulario caducado debe ir al final')
  }

  // Comprobación del PDF
  const pdf = generateSubmissionPdf({
    submissionId: 'test123',
    formTitle: 'Sortida de Nadal',
    schoolYearName: schoolYear.name,
    status: 'Acceptada',
    contactName: 'Família Pagada',
    contactEmail: 'pagada@example.com',
    contactPhone: '600 000 000',
    priceTierLabel: 'Membre amb quota pagada',
    price: 0,
    total: 0,
    submittedAt: new Date(),
    answers: parseFields(sortida!.fields).map((field) => ({
      label: field.label,
      value: field.id === 'talla' ? 'M' : 'Prova de valor amb accents: àèíóú çñ «»',
    })),
  })
  console.log('\nPDF generado:', pdf.length, 'bytes')
  if (pdf.length < 1000) throw new Error('El PDF parece vacío')

  console.log('\n✓ Todas las comprobaciones han pasado')
}

main()
  .then(async () => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error)
    await prisma.$disconnect()
    process.exit(1)
  })
