import Link from 'next/link'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/db'
import { getCurrentSchoolYear } from '@/lib/school-year'
import { listSchoolYears } from '@/lib/school-year'
import { getT } from '@/lib/translator'
import { getLocale, formatDate, formatPrice } from '@/lib/i18n'
import { localizedValue } from '@/lib/forms'
import { setQuotaAction, updateMemberAction } from '../../actions/members'
import MemberForm from '@/components/admin/MemberForm'
import QuotaForm from '@/components/admin/QuotaForm'
import styles from './page.module.css'

export default async function MemberDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const t = await getT()
  const locale = await getLocale()

  const member = await prisma.user.findUnique({
    where: { id },
    include: {
      memberships: { include: { schoolYear: true } },
      submissions: {
        orderBy: { createdAt: 'desc' },
        include: { form: true },
      },
    },
  })

  if (!member) notFound()

  const years = await listSchoolYears()
  const currentYear = await getCurrentSchoolYear()
  const currentMembership = member.memberships.find((m) => m.schoolYearId === currentYear?.id)

  const messages: Record<string, string> = {
    updated: t('members.updated'),
    default: t('common.errorGeneric'),
    usernameTaken: t('members.usernameTaken'),
    usernameInvalid: t('members.usernameInvalid'),
    passwordTooShort: t('members.passwordTooShort'),
    required: t('common.errorRequired'),
    email: t('common.errorEmail'),
  }

  return (
    <div>
      <Link href="/admin/membres" className="btn btnGhost mb2">
        ← {t('common.back')}
      </Link>
      <h2 className="sectionTitle">{t('members.edit')}</h2>

      <div className="card mb2">
        <MemberForm
          action={updateMemberAction}
          member={{
            id: member.id,
            username: member.username,
            name: member.name,
            email: member.email,
            phone: member.phone,
            role: member.role,
            active: member.active,
            note: member.note,
          }}
          labels={{
            username: t('common.username'),
            password: t('common.password'),
            newPassword: t('members.newPassword'),
            name: t('common.name'),
            email: t('common.email'),
            phone: t('common.phone'),
            role: t('members.role'),
            admin: t('common.admin'),
            member: t('common.member'),
            active: t('common.active'),
            notes: t('common.notes'),
            save: t('common.save'),
            saving: t('common.loading'),
            userInfo: t('members.userInfo'),
            personalInfo: t('members.personalInfo'),
            resetPasswordHelp: t('members.resetPasswordHelp'),
          }}
          messages={messages}
        />
      </div>

      <section className="card mb2">
        <h3 className="cardTitle">{t('members.setQuota', { year: currentYear?.name ?? '—' })}</h3>
        {currentYear ? (
          <QuotaForm
            action={setQuotaAction}
            userId={member.id}
            years={years.map((year) => ({ id: year.id, name: year.name }))}
            currentYearId={currentYear.id}
            values={{
              status: currentMembership?.status ?? 'PENDING',
              amount: currentMembership?.amount ?? 0,
              method: currentMembership?.method ?? null,
              note: currentMembership?.note ?? null,
            }}
            labels={{
              year: t('schoolYears.selectYear'),
              status: t('common.status'),
              amount: t('members.quotaAmount'),
              method: t('members.quotaMethod'),
              note: t('members.quotaNote'),
              save: t('common.save'),
              saving: t('common.loading'),
              saved: t('common.saved'),
              error: t('common.errorGeneric'),
              pending: t('common.unpaid'),
              paid: t('common.paid'),
              exempt: t('common.exempt'),
            }}
          />
        ) : (
          <p className="muted">{t('common.nothingHere')}</p>
        )}

        {member.memberships.length > 0 ? (
          <table className={`table ${styles.quotas}`}>
            <thead>
              <tr>
                <th>{t('schoolYears.selectYear')}</th>
                <th>{t('common.status')}</th>
                <th>{t('members.quotaAmount')}</th>
                <th>{t('members.quotaMethod')}</th>
              </tr>
            </thead>
            <tbody>
              {member.memberships.map((membership) => (
                <tr key={membership.id}>
                  <td data-label={t('schoolYears.selectYear')}>{membership.schoolYear.name}</td>
                  <td data-label={t('common.status')}>
                    {membership.status === 'PAID'
                      ? t('common.paid')
                      : membership.status === 'EXEMPT'
                        ? t('common.exempt')
                        : t('common.unpaid')}
                  </td>
                  <td data-label={t('members.quotaAmount')}>{formatPrice(membership.amount, locale)}</td>
                  <td data-label={t('members.quotaMethod')} className="small muted">{membership.method ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : null}
      </section>

      <section className="card">
        <h3 className="cardTitle">{t('members.submissionsOf', { name: member.name })}</h3>
        {member.submissions.length === 0 ? (
          <p className="muted">{t('submissions.noSubmissions')}</p>
        ) : (
          <div className="tableWrap">
            <table className="table">
              <thead>
                <tr>
                  <th>{t('submissions.form')}</th>
                  <th>{t('submissions.submittedAt')}</th>
                  <th>{t('submissions.priceAtSubmit')}</th>
                  <th>{t('common.status')}</th>
                </tr>
              </thead>
              <tbody>
                {member.submissions.map((submission) => (
                  <tr key={submission.id}>
                    <td data-label={t('submissions.form')}>
                      <Link href={`/admin/respostes/${submission.id}`}>
                        {localizedValue(submission.form.title, locale)}
                      </Link>
                    </td>
                    <td data-label={t('submissions.submittedAt')} className="small muted">
                      {formatDate(submission.createdAt, locale)}
                    </td>
                    <td data-label={t('submissions.priceAtSubmit')}>{formatPrice(submission.price, locale)}</td>
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
    </div>
  )
}
