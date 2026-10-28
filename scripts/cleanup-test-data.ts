/**
 * Limpia los datos de prueba creados por scripts/test-flow.ts y por las pruebas E2E.
 * Uso: pnpm exec tsx scripts/cleanup-test-data.ts
 */
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const forms = await prisma.form.findMany({
    where: {
      OR: [
        { slug: { startsWith: 'test-' } },
        { title: { path: ['ca'], string_contains: 'E2E' } },
      ],
    },
    select: { id: true, slug: true },
  })

  if (forms.length > 0) {
    await prisma.submission.deleteMany({ where: { formId: { in: forms.map((f) => f.id) } } })
    await prisma.form.deleteMany({ where: { id: { in: forms.map((f) => f.id) } } })
    console.log(`✓ Formularios eliminados: ${forms.map((f) => f.slug).join(', ')}`)
  }

  const users = await prisma.user.findMany({
    where: {
      OR: [
        { username: { startsWith: 'prova_e2e' } },
        { username: { startsWith: 'familia_' } },
      ],
    },
    select: { id: true, username: true },
  })

  if (users.length > 0) {
    await prisma.submission.deleteMany({ where: { userId: { in: users.map((u) => u.id) } } })
    await prisma.user.deleteMany({ where: { id: { in: users.map((u) => u.id) } } })
    console.log(`✓ Miembros eliminados: ${users.map((u) => u.username).join(', ')}`)
  }

  console.log('✓ Limpieza completada')
}

main()
  .then(async () => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error)
    await prisma.$disconnect()
    process.exit(1)
  })
