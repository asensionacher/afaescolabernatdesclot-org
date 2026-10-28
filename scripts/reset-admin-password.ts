/**
 * Restablece las credenciales del administrador (usuario y contraseña).
 * Uso: pnpm exec tsx scripts/reset-admin-password.ts [usuario] [contraseña]
 */
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const username = (process.argv[2] ?? 'admin').trim().toLowerCase()
  const password = process.argv[3] ?? 'admin'

  const admin = await prisma.user.findFirst({ where: { role: 'ADMIN' } })
  if (!admin) {
    throw new Error('No hay ningún administrador en la base de datos')
  }

  await prisma.user.update({
    where: { id: admin.id },
    data: { username, passwordHash: await bcrypt.hash(password, 10), active: true },
  })

  console.log(`✓ Administrador restablecido: ${username}`)
}

main()
  .then(async () => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error)
    await prisma.$disconnect()
    process.exit(1)
  })
