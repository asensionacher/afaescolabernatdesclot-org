import Link from 'next/link'
import { prisma } from '@/lib/db'
import { getCurrentSchoolYear } from '@/lib/school-year'
import { getT } from '@/lib/translator'
import { formatDateTime, getLocale } from '@/lib/i18n'
import { localizedValue } from '@/lib/forms'
import styles from './page.module.css'

export default async function AdminDashboard() {
  const t = await getT()
  const locale = await getLocale()
  const schoolYear = await getCurrentSchoolYear()

  const [members, paid, pending, forms, recent] = await Promise.all([
    prisma.user.count({ where: { role: 'MEMBER', active: true } }),
    schoolYear
      ? prisma.membership.count({ where: { schoolYearId: schoolYear.id, status: 'PAID' } })
      : 0,
    prisma.submission.count({ where: { status: 'PENDING' } }),
    schoolYear
      ? prisma.form.count({ where: { schoolYearId: schoolYear.id, status: 'PUBLISHED' } })
      : 0,
    prisma.submission.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { form: true },
    }),
  ])

  const stats = [
    { label: t('admin.statPendingSubmissions'), value: pending, href: '/admin/respostes?status=PENDING' },
    { label: t('admin.statMembers'), value: members, href: '/admin/membres' },
    { label: t('admin.statPaid', { year: schoolYear?.name ?? '—' }), value: paid, href: '/admin/membres' },
    { label: t('admin.statForms'), value: forms, href: '/admin/formularis' },
  ]

  return (
    <div>
      <p className="pageSubtitle">{t('admin.dashboardIntro')}</p>

      {!schoolYear ? (
        <div className="alert alertWarning">
          <h2 className="cardTitle">{t('admin.setupYear')}</h2>
          <p>{t('admin.setupYearHelp')}</p>
          <Link href="/admin/anys-escolars" className="btn mt1">{t('admin.schoolYears')} →</Link>
        </div>
      ) : null}

      <div className={styles.stats}>
        {stats.map((stat) => (
          <Link href={stat.href} className={styles.stat} key={stat.label}>
            <span className={styles.statValue}>{stat.value}</span>
            <span className={styles.statLabel}>{stat.label}</span>
          </Link>
        ))}
      </div>

      <section className="mb2">
        <h2 className="sectionTitle">{t('admin.nextTask')}</h2>
        <div className={styles.tasks}>
          {[
            { href: '/admin/respostes?status=PENDING', title: 'reviewPending', help: 'reviewHelp' },
            { href: '/admin/membres', title: 'members', help: 'membersHelp' },
            { href: '/admin/formularis', title: 'forms', help: 'formsHelp' },
            { href: '/admin/anys-escolars', title: 'schoolYears', help: 'yearsHelp' },
            { href: '/admin/configuracio', title: 'settings', help: 'settingsHelp' },
          ].map((task) => (
            <Link href={task.href} className={styles.task} key={task.href}>
              <h3>{t(`admin.${task.title}`)} <span aria-hidden="true">→</span></h3>
              <p>{t(`admin.${task.help}`)}</p>
            </Link>
          ))}
        </div>
      </section>

      <div className={styles.columns}>
        <section>
          <div className="rowBetween mb1">
            <h2 className="sectionTitle">{t('admin.recentSubmissions')}</h2>
            <Link href="/admin/respostes" className="btn btnGhost">
              {t('admin.viewAll')}
            </Link>
          </div>

          {recent.length === 0 ? (
            <p className="muted">{t('admin.noRecentSubmissions')}</p>
          ) : (
            <div className="tableWrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>{t('submissions.form')}</th>
                    <th>{t('submissions.applicant')}</th>
                    <th>{t('submissions.submittedAt')}</th>
                    <th>{t('common.status')}</th>
                  </tr>
                </thead>
                <tbody>
                  {recent.map((submission) => (
                    <tr key={submission.id}>
                      <td data-label={t('submissions.form')}>
                        <Link href={`/admin/respostes/${submission.id}`}>
                          {localizedValue(submission.form.title, locale)}
                        </Link>
                      </td>
                      <td data-label={t('submissions.applicant')}>{submission.contactName}</td>
                      <td data-label={t('submissions.submittedAt')} className="small muted">
                        {formatDateTime(submission.createdAt, locale)}
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
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section>
          <h2 className="sectionTitle">{t('admin.quickActions')}</h2>
          <div className={styles.actions}>
            <Link href="/admin/membres/nou" className="btn btnSecondary">
              + {t('admin.newMember')}
            </Link>
            <Link href="/admin/anys-escolars" className="btn btnSecondary">
              + {t('admin.newSchoolYear')}
            </Link>
            <Link href="/admin/formularis/nou" className="btn btnSecondary">
              + {t('admin.newForm')}
            </Link>
          </div>
        </section>
      </div>
    </div>
  )
}
