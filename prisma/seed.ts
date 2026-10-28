import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Administrador inicial. Cambiar usuario/contraseña desde el panel.
  const admin = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      passwordHash: await bcrypt.hash('admin', 10),
      name: 'Administrador AFA',
      email: 'afaescolabernatdesclot@gmail.com',
      role: 'ADMIN',
      active: true,
    },
  })
  console.log(`✓ Administrador: ${admin.username}`)

  // Curso escolar actual.
  const schoolYear = await prisma.schoolYear.upsert({
    where: { name: '2026/2027' },
    update: {},
    create: {
      name: '2026/2027',
      startDate: new Date('2026-09-01T00:00:00.000Z'),
      endDate: new Date('2027-08-31T00:00:00.000Z'),
      isCurrent: true,
      quotaAmount: 0,
    },
  })
  console.log(`✓ Curs escolar: ${schoolYear.name}${schoolYear.isCurrent ? ' (actual)' : ''}`)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (error) => {
    console.error(error)
    await prisma.$disconnect()
    process.exit(1)
  })
