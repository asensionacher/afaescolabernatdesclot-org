import Link from 'next/link'
import { prisma } from '@/lib/db'
import { getT } from '@/lib/translator'
import { getLocale, formatDate, formatPrice } from '@/lib/i18n'
import { localizedValue, isFormExpired } from '@/lib/forms'
import {
  deleteFormAction,
  publishFormAction,
  togglePinnedAction,
  unpublishFormAction,
} from '@/app/admin/actions/forms'
import ConfirmButton from '@/components/admin/ConfirmButton'
import styles from './page.module.css'

export default async function AdminFormsPage({
  searchParams,
}: {
  searchParams: Promise<{ year?: string }>
}) {
  const t = await getT()
  const locale = await getLocale()
  const params = await searchParams

  const years = await prisma.schoolYear.findMany({ orderBy: { startDate: 'desc' } })
  const selectedYear = params.year ?? ''

  const forms = await prisma.form.findMany({
    where: selectedYear ? { schoolYearId: selectedYear } : undefined,
    orderBy: [{ pinned: 'desc' }, { publishedAt: 'desc' }],
    include: { schoolYear: true, _count: { select: { submissions: true } } },
  })

  return (
    <div>
      <div className="rowBetween mb2">
        <div>
          <h2 className="sectionTitle">{t('forms.title')}</h2>
          <p className="muted small">{t('forms.subtitle')}</p>
        </div>
        <Link href="/admin/formularis/nou" className="btn btnAccent">
          + {t('forms.new')}
        </Link>
      </div>

      <form method="get" className={styles.filter}>
        <label className="label" htmlFor="filter-year">{t('schoolYears.selectYear')}</label>
        <select id="filter-year" name="year" className="select" defaultValue={selectedYear}>
          <option value="">{t('common.all')}</option>
          {years.map((year) => (
            <option key={year.id} value={year.id}>
              {year.name}
            </option>
          ))}
        </select>
        <button type="submit" className="btn btnSecondary">
          {t('common.filter')}
        </button>
        {selectedYear ? (
          <Link href="/admin/formularis" className="btn btnGhost">{t('common.clearFilters')}</Link>
        ) : null}
      </form>

      {forms.length === 0 ? (
        <p className="alert">{selectedYear ? t('common.noResults') : t('forms.noForms')}</p>
      ) : (
        <div className="tableWrap">
          <table className="table">
            <thead>
              <tr>
                <th>{t('forms.formTitle')}</th>
                <th>{t('schoolYears.selectYear')}</th>
                <th>{t('common.price')}</th>
                <th>{t('common.status')}</th>
                <th>{t('common.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {forms.map((form) => {
                const expired = isFormExpired(form)
                return (
                  <tr key={form.id}>
                    <td data-label={t('forms.formTitle')}>
                      <Link href={`/admin/formularis/${form.id}`}>
                        <strong>{localizedValue(form.title, locale)}</strong>
                      </Link>
                      <div className="small muted">
                        /formularis/{form.slug} · {form._count.submissions}{' '}
                        {t('submissions.title').toLowerCase()}
                      </div>
                    </td>
                    <td data-label={t('schoolYears.selectYear')} className="small">{form.schoolYear.name}</td>
                    <td data-label={t('common.price')} className="small">
                      <div>{t('common.member')}: {formatPrice(form.memberPrice, locale)}</div>
                      <div>{t('common.nonMember')}: {formatPrice(form.nonMemberPrice, locale)}</div>
                    </td>
                    <td data-label={t('common.status')}>
                      <div className={styles.badges}>
                        <span
                          className={
                            form.status === 'PUBLISHED'
                              ? 'badge badgeSuccess'
                              : form.status === 'ARCHIVED'
                                ? 'badge badgeMuted'
                                : 'badge badgeWarning'
                          }
                        >
                          {form.status === 'PUBLISHED'
                            ? t('common.published')
                            : form.status === 'ARCHIVED'
                              ? t('common.archived')
                              : t('common.draft')}
                        </span>
                        {form.visibility === 'MEMBERS_ONLY' ? (
                          <span className="badge">{t('home.membersOnly')}</span>
                        ) : null}
                        {form.pinned ? <span className="badge badgeAccent">{t('home.pinned')}</span> : null}
                        {expired ? <span className="badge badgeMuted">{t('home.expired')}</span> : null}
                        {form.publishedAt ? (
                          <div className="small muted">
                            {formatDate(form.publishedAt, locale)}
                          </div>
                        ) : null}
                      </div>
                    </td>
                    <td data-label={t('common.actions')}>
                      <div className={styles.actions}>
                        <Link
                          href={`/formularis/${form.slug}`}
                          className="btn btnSmall btnGhost"
                          target="_blank"
                        >
                          {t('common.view')}
                        </Link>
                        <Link href={`/admin/formularis/${form.id}`} className="btn btnSmall btnGhost">
                          {t('common.edit')}
                        </Link>
                        {form.status === 'PUBLISHED' ? (
                          <ConfirmButton
                            action={unpublishFormAction}
                            id={form.id}
                            label={t('forms.unpublish')}
                            className="btn btnSmall btnGhost"
                            message={t('common.confirm')}
                          />
                        ) : (
                          <ConfirmButton
                            action={publishFormAction}
                            id={form.id}
                            label={t('forms.publish')}
                            className="btn btnSmall btnGhost"
                            message={t('common.confirm')}
                          />
                        )}
                        <ConfirmButton
                          action={togglePinnedAction}
                          id={form.id}
                          label={t('forms.pinned')}
                          className="btn btnSmall btnGhost"
                          message={t('common.confirm')}
                        />
                        <ConfirmButton
                          action={deleteFormAction}
                          id={form.id}
                          label={t('common.delete')}
                          className="btn btnSmall btnDanger"
                          message={t('common.deleteNamed', { name: localizedValue(form.title, locale) })}
                        />
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
