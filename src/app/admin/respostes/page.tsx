import Link from 'next/link'
import { prisma } from '@/lib/db'
import { getT } from '@/lib/translator'
import { getLocale, formatDateTime, formatPrice } from '@/lib/i18n'
import { localizedValue } from '@/lib/forms'
import type { SubmissionStatus } from '@prisma/client'
import styles from './page.module.css'

export default async function AdminSubmissionsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; form?: string }>
}) {
  const t = await getT()
  const locale = await getLocale()
  const params = await searchParams

  const status: SubmissionStatus | undefined =
    params.status === 'PENDING' || params.status === 'ACCEPTED' || params.status === 'DENIED'
      ? params.status
      : undefined
  const formId = params.form || undefined

  const [submissions, forms, counts] = await Promise.all([
    prisma.submission.findMany({
      where: { status, formId },
      orderBy: { createdAt: 'desc' },
      include: { form: true, user: true },
    }),
    prisma.form.findMany({
      orderBy: { publishedAt: 'desc' },
      select: { id: true, title: true },
    }),
    prisma.submission.groupBy({ by: ['status'], _count: true }),
  ])

  const countFor = (value: string): number =>
    counts.find((group) => group.status === value)?._count ?? 0

  const tabs = [
    { value: 'PENDING', label: t('submissions.pending') },
    { value: 'ACCEPTED', label: t('submissions.accepted') },
    { value: 'DENIED', label: t('submissions.denied') },
    { value: 'ALL', label: t('submissions.all') },
  ]

  return (
    <div>
      <h2 className="sectionTitle">{t('submissions.title')}</h2>
      <p className="muted small mb2">{t('submissions.subtitle')}</p>

      <div className={styles.tabs}>
        {tabs.map((tab) => (
          <Link
            key={tab.value}
            href={
              tab.value === 'ALL'
                ? `/admin/respostes${formId ? `?form=${encodeURIComponent(formId)}` : ''}`
                : `/admin/respostes?status=${tab.value}${formId ? `&form=${formId}` : ''}`
            }
            className={styles.tab}
            aria-current={(status ?? 'ALL') === tab.value ? 'page' : undefined}
          >
            {tab.label}
            {tab.value === 'ALL'
              ? ''
              : ` (${countFor(tab.value)})`}
          </Link>
        ))}
      </div>

      <form method="get" className={styles.filter}>
        <div className="field">
        <label className="label" htmlFor="filter-status">{t('common.status')}</label>
        <select id="filter-status" name="status" className="select" defaultValue={status ?? 'ALL'}>
          <option value="ALL">{t('submissions.all')}</option>
          <option value="PENDING">{t('submissions.pending')}</option>
          <option value="ACCEPTED">{t('submissions.accepted')}</option>
          <option value="DENIED">{t('submissions.denied')}</option>
        </select>
        </div>
        <div className="field">
        <label className="label" htmlFor="filter-form">{t('submissions.form')}</label>
        <select id="filter-form" name="form" className="select" defaultValue={formId ?? ''}>
          <option value="">{t('submissions.all')}</option>
          {forms.map((form) => (
            <option key={form.id} value={form.id}>
              {localizedValue(form.title, locale)}
            </option>
          ))}
        </select>
        </div>
        <button type="submit" className="btn btnSecondary">
          {t('common.filter')}
        </button>
        {status || formId ? (
          <Link href="/admin/respostes" className="btn btnGhost">{t('common.clearFilters')}</Link>
        ) : null}
      </form>

      {submissions.length === 0 ? (
        <p className="alert">{status || formId ? t('common.noResults') : t('submissions.noSubmissions')}</p>
      ) : (
        <div className="tableWrap">
          <table className="table">
            <thead>
              <tr>
                <th>{t('submissions.form')}</th>
                <th>{t('submissions.applicant')}</th>
                <th>{t('submissions.submittedAt')}</th>
                <th>{t('submissions.priceAtSubmit')}</th>
                <th>{t('common.status')}</th>
                <th>{t('common.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {submissions.map((submission) => (
                <tr key={submission.id}>
                  <td data-label={t('submissions.form')}>{localizedValue(submission.form.title, locale)}</td>
                  <td data-label={t('submissions.applicant')}>
                    <strong>{submission.contactName}</strong>
                    <div className="small muted">{submission.contactEmail}</div>
                  </td>
                  <td data-label={t('submissions.submittedAt')} className="small muted">{formatDateTime(submission.createdAt, locale)}</td>
                  <td data-label={t('submissions.priceAtSubmit')} className="small">
                    {formatPrice(submission.price, locale)}
                    <div className="small muted">
                      {submission.priceTier === 'MEMBER'
                        ? t('submissions.member')
                        : t('submissions.nonMember')}
                    </div>
                  </td>
                  <td data-label={t('common.status')}>
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
                  </td>
                  <td data-label={t('common.actions')}>
                    <Link
                      href={`/admin/respostes/${submission.id}`}
                      className="btn btnSmall btnSecondary"
                      aria-label={`${t('common.view')}: ${submission.contactName} — ${localizedValue(submission.form.title, locale)}`}
                    >
                      {t('common.view')}
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
