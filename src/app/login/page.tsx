import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { getT } from '@/lib/translator'
import { loginAction } from '@/app/actions/auth'
import LoginForm from './LoginForm'
import styles from './page.module.css'

export const metadata = { title: 'Inicia la sessió' }

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>
}) {
  const t = await getT()
  const params = await searchParams
  const next = params.next && params.next.startsWith('/') ? params.next : ''

  const user = await getCurrentUser()
  if (user) {
    redirect(next || (user.role === 'ADMIN' ? '/admin' : '/el-meu-compte'))
  }

  return (
    <div className="containerNarrow">
      <div className={styles.wrapper}>
        <h1 className="pageTitle">{t('login.title')}</h1>
        <p className="pageSubtitle">{t('login.subtitle')}</p>

        <LoginForm
          action={loginAction}
          next={next}
          labels={{
            username: t('login.username'),
            password: t('login.password'),
            submit: t('login.submit'),
            loading: t('common.loading'),
            invalid: t('login.invalid'),
            rateLimited: t('login.rateLimited'),
            showPassword: t('login.showPassword'),
            hidePassword: t('login.hidePassword'),
          }}
        />

        <p className={`${styles.note} mt2`}>{t('login.needAccount')}</p>
        <Link href="/" className="btn btnGhost">
          ← {t('login.backHome')}
        </Link>
      </div>
    </div>
  )
}
