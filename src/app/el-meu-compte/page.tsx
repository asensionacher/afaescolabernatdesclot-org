import Link from 'next/link'
import { prisma } from '@/lib/db'
import { requireUser } from '@/lib/auth'
import { getCurrentSchoolYear } from '@/lib/school-year'
import { getT } from '@/lib/translator'
import { getLocale, formatDate, formatPrice } from '@/lib/i18n'
import { localizedValue } from '@/lib/forms'
import { changeOwnPasswordAction } from '@/app/admin/actions/members'
import ChangePasswordForm from '@/components/ChangePasswordForm'
import styles from './page.module.css'

export default async function AccountPage() {
  const user = await requireUser()
  const t = await getT()
  const locale = await getLocale()
  const schoolYear = await getCurrentSchoolYear()

  const [membership, submissions] = await Promise.all([
    schoolYear
      ? prisma.membership.findUnique({
          where: { userId_schoolYearId: { userId: user.id, schoolYearId: schoolYear.id } },
        })
      : null,
    prisma.submission.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      include: { form: true },
    }),
  ])

  const messages: Record<string, string> = {
    passwordUpdated: t('account.passwordUpdated'),
    default: t('common.errorGeneric'),
    passwordMismatch: t('account.passwordMismatch'),
    passwordTooShort: t('account.passwordTooShort'),
    invalidCurrentPassword: t('login.invalid'),
  }

  return (
    <div className="containerNarrow">
      <h1 className="pageTitle">{t('account.title')}</h1>
      <p className="pageSubtitle">{t('account.intro')}</p>
      <Link href="/#formularis" className="btn btnAccent mb2">{t('home.browse')} →</Link>

      <div className={styles.columns}>
        <section className="card">
          <h2 className="cardTitle">{t('account.profile')}</h2>
          <p>
            <strong>{user.name}</strong>
          </p>
          <p className="small muted">{user.email}</p>
          {user.phone ? <p className="small muted">{user.phone}</p> : null}
          <p className="small muted">
            {t('common.username')}: {user.username}
          </p>
          {user.role === 'ADMIN' ? (
            <p className="small">
              <span className="badge badgeAccent">{t('common.admin')}</span>
            </p>
          ) : null}

          {schoolYear ? (
            <div className={`mt2 ${styles.quota}`}>
              <p className="small muted">{t('account.quotaForYear', { year: schoolYear.name })}</p>
              {membership ? (
                <p>
                  <span
                    className={
                      membership.status === 'PAID'
                        ? 'badge badgeSuccess'
                        : membership.status === 'EXEMPT'
                          ? 'badge badgeAccent'
                          : 'badge badgeWarning'
                    }
                  >
                    {membership.status === 'PAID'
                      ? t('common.paid')
                      : membership.status === 'EXEMPT'
                        ? t('common.exempt')
                        : t('common.unpaid')}
                  </span>
                  {membership.amount > 0 ? (
                    <span className="small muted"> · {formatPrice(membership.amount, locale)}</span>
                  ) : null}
                </p>
              ) : (
                <p className="small muted">{t('common.unpaid')}</p>
              )}
            </div>
          ) : null}
        </section>

        <details className="card">
          <summary className={styles.passwordSummary}>{t('account.changePassword')}</summary>
          <div className="mt2">
          <ChangePasswordForm
            action={changeOwnPasswordAction}
            labels={{
              currentPassword: t('account.currentPassword'),
              newPassword: t('account.newPassword'),
              confirmPassword: t('account.confirmPassword'),
              save: t('common.save'),
              saving: t('common.loading'),
            }}
            messages={messages}
          />
          </div>
        </details>
      </div>

      <section className="card mt2">
        <h2 className="cardTitle">{t('account.mySubmissions')}</h2>
        {submissions.length === 0 ? (
          <p className="muted">{t('account.noSubmissions')}</p>
        ) : (
          <div className={styles.submissions}>
                {submissions.map((submission) => (
                  <article className={styles.submission} key={submission.id}>
                    <div className="rowBetween mb1">
                      <h3 className="cardTitle">
                      <Link href={`/formularis/${submission.form.slug}`}>
                        {localizedValue(submission.form.title, locale)}
                      </Link>
                      </h3>
                      <span
                        className={
                          submission.status === 'PENDING'
                            ? 'badge badgeWarning'
                            : submission.status === 'ACCEPTED'
                              ? 'badge badgeSuccess'
                              : 'badge badgeDanger'
                        }
                      >
                        {submission.status === 'PENDING'
                          ? t('common.pending')
                          : submission.status === 'ACCEPTED'
                            ? t('common.accepted')
                            : t('common.denied')}
                      </span>
                    </div>
                    <p className="small muted">
                      {t('submissions.submittedAt')}: {formatDate(submission.createdAt, locale)}
                      {' · '}{t('common.price')}: {formatPrice(submission.price, locale)}
                    </p>
                    <p className="mt1">
                      {submission.status === 'PENDING' ? t('account.pendingHelp')
                        : submission.status === 'ACCEPTED' ? t('account.acceptedHelp')
                          : t('account.deniedHelp')}
                    </p>
                    {submission.status === 'DENIED' && submission.denialReason ? (
                      <p className="alert alertWarning mt1">
                        <strong>{t('submissions.denialReason')}: </strong>{submission.denialReason}
                      </p>
                    ) : null}
                    {submission.status === 'ACCEPTED' && submission.pdfFilename ? (
                      <a href={`/api/submissions/${submission.id}/pdf`} className="btn btnSecondary mt1">
                        {t('submissions.downloadPdf')}
                      </a>
                    ) : null}
                  </article>
                ))}
          </div>
        )}
      </section>
    </div>
  )
}
