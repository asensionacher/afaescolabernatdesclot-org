'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { login, logout } from '@/lib/auth'

export interface LoginState {
  error?: string
}

export async function loginAction(_previous: LoginState, formData: FormData): Promise<LoginState> {
  const username = String(formData.get('username') ?? '').trim()
  const password = String(formData.get('password') ?? '')
  const next = String(formData.get('next') ?? '')

  if (!username || !password) {
    return { error: 'invalid' }
  }

  const result = await login(username, password)
  if (!result.success) {
    return { error: result.error ?? 'invalid' }
  }

  revalidatePath('/', 'layout')
  const fallback = result.user?.role === 'ADMIN' ? '/admin' : '/el-meu-compte'
  redirect(next.startsWith('/') ? next : fallback)
}

export async function logoutAction(): Promise<void> {
  await logout()
  revalidatePath('/', 'layout')
  redirect('/')
}
