import { isAuthenticated } from '@/lib/auth'
import LoginForm from '@/components/LoginForm'
import MeetingReportsList from '@/components/MeetingReportsList'
import { redirect } from 'next/navigation'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Actes de Reunió - AMPA Bernat Desclot',
  description: 'Sistema de gestió d\'actes de reunió de l\'AMPA Escola Bernat Desclot',
  robots: {
    index: false,
    follow: false,
  },
}

export default async function ActasPage() {
  const authenticated = await isAuthenticated()

  if (!authenticated) {
    return <LoginForm />
  }

  return <MeetingReportsList />
}
