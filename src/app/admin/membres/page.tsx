import Link from 'next/link'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import { getCurrentSchoolYear } from '@/lib/school-year'
import { getT } from '@/lib/translator'
import { deleteMemberAction, toggleMemberActiveAction } from '@/app/admin/actions/members'
import ConfirmButton from '@/components/admin/ConfirmButton'
import styles from './page.module.css'

export default async function MembersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const t = await getT()
  const admin = await getCurrentUser()
  const params = await searchParams
  const query = (params.q ?? '').trim()
  const schoolYear = await getCurrentSchoolYear()

  const members = await prisma.user.findMany({
    where: query
      ? {
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { username: { contains: query, mode: 'insensitive' } },
            { email: { contains: query, mode: 'insensitive' } },
          ],
        }
      : undefined,
    orderBy: [{ role: 'asc' }, { name: 'asc' }],
    include: {
      memberships: schoolYear
        ? { where: { schoolYearId: schoolYear.id } }
        : { where: { id: '__none__' } },
    },
  })

  return (
    <div>
      <div className="rowBetween mb2">
        <div>
          <h2 className="sectionTitle">{t('members.title')}</h2>
          <p className="muted small">{t('members.subtitle')}</p>
        </div>
        <Link href="/admin/membres/nou" className="btn btnAccent">
          + {t('members.new')}
        </Link>
      </div>

      <form method="get" className={styles.search}>
        <input
          type="search"
          name="q"
          defaultValue={query}
          placeholder={t('members.searchPlaceholder')}
          className="input"
          aria-label={t('common.search')}
        />
        <button type="submit" className="btn btnSecondary">
          {t('common.search')}
        </button>
        {query ? (
          <Link href="/admin/membres" className="btn btnGhost">
            {t('common.clearFilters')}
          </Link>
        ) : null}
      </form>

      {members.length === 0 ? (
        <p className="alert">{query ? t('common.noResults') : t('members.noMembers')}</p>
      ) : (
        <div className="tableWrap">
          <table className="table">
            <thead>
              <tr>
                <th>{t('common.name')}</th>
                <th>{t('common.username')}</th>
                <th>{t('common.email')}</th>
                <th>{t('members.setQuota', { year: schoolYear?.name ?? '—' })}</th>
                <th>{t('common.status')}</th>
                <th>{t('common.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {members.map((member) => {
                const membership = member.memberships[0]
                return (
                  <tr key={member.id}>
                    <td data-label={t('common.name')}>
                      <Link href={`/admin/membres/${member.id}`}>
                        <strong>{member.name}</strong>
                      </Link>
                      {member.phone ? <div className="small muted">{member.phone}</div> : null}
                    </td>
                    <td data-label={t('common.username')} className="small">{member.username}</td>
                    <td data-label={t('common.email')} className="small">{member.email}</td>
                    <td data-label={t('members.setQuota', { year: schoolYear?.name ?? '—' })}>
                      {membership ? (
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
                      ) : (
                        <span className="badge badgeMuted">{t('common.none')}</span>
                      )}
                    </td>
                    <td data-label={t('common.status')}>
                      {member.role === 'ADMIN' ? (
                        <span className="badge">{t('common.admin')}</span>
                      ) : (
                        <span className="badge badgeMuted">{t('common.member')}</span>
                      )}
                      {!member.active ? (
                        <span className="badge badgeDanger" style={{ marginLeft: '0.3rem' }}>
                          {t('common.inactive')}
                        </span>
                      ) : null}
                    </td>
                    <td data-label={t('common.actions')}>
                      <div className={styles.actions}>
                        <Link href={`/admin/membres/${member.id}`} className="btn btnSmall btnGhost">
                          {t('common.edit')}
                        </Link>
                        {member.id !== admin?.id ? (
                          <>
                            <ConfirmButton
                              action={toggleMemberActiveAction}
                              id={member.id}
                              label={member.active ? t('common.deactivate') : t('common.activate')}
                              className="btn btnSmall btnGhost"
                              message={t('common.confirm')}
                            />
                            <ConfirmButton
                              action={deleteMemberAction}
                              id={member.id}
                              label={t('common.delete')}
                              className="btn btnSmall btnDanger"
                              message={t('common.deleteNamed', { name: member.name })}
                            />
                          </>
                        ) : null}
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
