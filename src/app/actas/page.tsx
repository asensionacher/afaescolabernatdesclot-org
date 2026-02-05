import { isAuthenticated } from '@/lib/auth'
import LoginForm from '@/components/LoginForm'
import MeetingReportsList from '@/components/MeetingReportsList'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function ActasPage() {
  const authenticated = await isAuthenticated()

  if (!authenticated) {
    return <LoginForm />
  }

  return <MeetingReportsList />
}
