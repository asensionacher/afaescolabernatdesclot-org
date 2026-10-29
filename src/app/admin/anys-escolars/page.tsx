import Link from 'next/link'
import { prisma } from '@/lib/db'
import { getT } from '@/lib/translator'
import { getLocale, formatDate, formatPrice } from '@/lib/i18n'
import {
  createSchoolYearAction,
  setCurrentSchoolYearAction,
} from '@/app/admin/actions/school-years'
import SchoolYearForm from '@/components/admin/SchoolYearForm'
import ConfirmButton from '@/components/admin/ConfirmButton'
import styles from './page.module.css'

export default async function SchoolYearsPage() {
  const t = await getT()
  const locale = await getLocale()

  const years = await prisma.schoolYear.findMany({
    orderBy: [{ isCurrent: 'desc' }, { startDate: 'desc' }],
    include: {
      _count: { select: { forms: true, memberships: true } },
    },
  })

  const messages: Record<string, string> = {
    created: t('schoolYears.created'),
    default: t('common.errorGeneric'),
    nameTaken: t('common.errorGeneric'),
    required: t('common.errorRequired'),
    invalidRange: t('common.errorGeneric'),
  }

  return (
    <div>
      <h2 className="sectionTitle">{t('schoolYears.title')}</h2>
      <p className="muted small mb2">{t('schoolYears.subtitle')}</p>

      <div className={styles.top}>
        <section className="card">
          <h3 className="cardTitle">{t('schoolYears.new')}</h3>
          <SchoolYearForm
            action={createSchoolYearAction}
            labels={{
              name: t('schoolYears.name'),
              startDate: t('schoolYears.startDate'),
              endDate: t('schoolYears.endDate'),
              quotaAmount: t('schoolYears.quotaAmount'),
              isCurrent: t('schoolYears.isCurrent'),
              save: t('common.create'),
              saving: t('common.loading'),
            }}
            messages={messages}
          />
        </section>

        <section>
          {years.length === 0 ? (
            <p className="muted">{t('schoolYears.noYears')}</p>
          ) : (
            <div className="tableWrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>{t('schoolYears.name')}</th>
                    <th>{t('common.date')}</th>
                    <th>{t('schoolYears.quotaAmount')}</th>
                    <th>{t('common.status')}</th>
                    <th>{t('common.actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {years.map((year) => (
                    <tr key={year.id}>
                      <td data-label={t('schoolYears.name')}>
                        <Link href={`/admin/anys-escolars/${year.id}`}>
                          <strong>{year.name}</strong>
                        </Link>
                        <div className="small muted">
                          {t('schoolYears.membersCount', { count: year._count.memberships })}
                        </div>
                      </td>
                      <td data-label={t('common.date')} className="small muted">
                        {formatDate(year.startDate, locale)} → {formatDate(year.endDate, locale)}
                      </td>
                      <td data-label={t('schoolYears.quotaAmount')}>{formatPrice(year.quotaAmount, locale)}</td>
                      <td data-label={t('common.status')}>
                        {year.isCurrent ? (
                          <span className="badge badgeSuccess">{t('schoolYears.current')}</span>
                        ) : (
                          <span className="badge badgeMuted">{t('schoolYears.notCurrent')}</span>
                        )}
                      </td>
                      <td data-label={t('common.actions')}>
                        <div className={styles.actions}>
                          {!year.isCurrent ? (
                            <ConfirmButton
                              action={setCurrentSchoolYearAction}
                              id={year.id}
                              label={t('schoolYears.setCurrent')}
                              className="btn btnSmall btnGhost"
                              message={t('common.confirm')}
                            />
                          ) : null}
                          <Link href={`/admin/anys-escolars/${year.id}`} className="btn btnSmall btnGhost">
                            {t('common.edit')}
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
