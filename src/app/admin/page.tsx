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
    { label: t('admin.statMembers'), value: members },
    { label: t('admin.statPaid', { year: schoolYear?.name ?? '—' }), value: paid },
    { label: t('admin.statPendingSubmissions'), value: pending },
    { label: t('admin.statForms'), value: forms },
  ]

  return (
    <div>
      <p className="pageSubtitle">{t('admin.dashboardIntro')}</p>

      <div className={styles.stats}>
        {stats.map((stat) => (
          <div className={styles.stat} key={stat.label}>
            <span className={styles.statValue}>{stat.value}</span>
            <span className={styles.statLabel}>{stat.label}</span>
          </div>
        ))}
      </div>

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
                      <td>
                        <Link href={`/admin/respostes/${submission.id}`}>
                          {localizedValue(submission.form.title, locale)}
                        </Link>
                      </td>
                      <td>{submission.contactName}</td>
                      <td className="small muted">
                        {formatDateTime(submission.createdAt, locale)}
                      </td>
                      <td>
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
