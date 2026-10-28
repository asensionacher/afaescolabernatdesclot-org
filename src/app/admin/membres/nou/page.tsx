import Link from 'next/link'
import { getT } from '@/lib/translator'
import { createMemberAction } from '../../actions/members'
import MemberForm from '@/components/admin/MemberForm'

export default async function NewMemberPage() {
  const t = await getT()

  const messages: Record<string, string> = {
    created: t('members.created'),
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
      <h2 className="sectionTitle">{t('members.create')}</h2>
      <p className="muted small mb2">{t('members.subtitle')}</p>

      <div className="card">
        <MemberForm
          action={createMemberAction}
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
            save: t('members.create'),
            saving: t('common.loading'),
            userInfo: t('members.userInfo'),
            personalInfo: t('members.personalInfo'),
            resetPasswordHelp: t('members.resetPasswordHelp'),
          }}
          messages={messages}
        />
      </div>
    </div>
  )
}
