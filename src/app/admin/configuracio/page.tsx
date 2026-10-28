import { getCurrentUser } from '@/lib/auth'
import { getT } from '@/lib/translator'
import { getEmailSettings } from '@/lib/settings'
import {
  changeAdminCredentialsAction,
  saveEmailSettingsAction,
  sendTestEmailAction,
} from '../actions/settings'
import EmailSettingsForm from '@/components/admin/EmailSettingsForm'
import CredentialsForm from '@/components/admin/CredentialsForm'

export default async function SettingsPage() {
  const t = await getT()
  const admin = await getCurrentUser()
  const email = await getEmailSettings()

  const emailMessages: Record<string, string> = {
    emailSaved: t('settings.emailSaved'),
    testEmailSent: t('settings.testEmailSent'),
    testEmailFailed: t('settings.testEmailFailed'),
    default: t('common.errorGeneric'),
    required: t('common.errorRequired'),
  }

  const credentialMessages: Record<string, string> = {
    credentialsSaved: t('settings.credentialsSaved'),
    default: t('common.errorGeneric'),
    usernameTaken: t('settings.usernameTaken'),
    usernameInvalid: t('members.usernameInvalid'),
    passwordTooShort: t('settings.passwordTooShort'),
    passwordMismatch: t('settings.passwordMismatch'),
    invalidCurrentPassword: t('login.invalid'),
  }

  return (
    <div>
      <h2 className="sectionTitle">{t('settings.title')}</h2>

      <section className="card mb2">
        <h3 className="cardTitle">{t('settings.email')}</h3>
        <p className="small muted mb2">{t('settings.emailIntro')}</p>
        <EmailSettingsForm
          action={saveEmailSettingsAction}
          testAction={sendTestEmailAction}
          values={{
            host: email.host,
            port: email.port,
            user: email.user,
            password: email.password,
            secure: email.secure,
            fromName: email.fromName,
            fromEmail: email.fromEmail,
          }}
          labels={{
            host: t('settings.smtpHost'),
            port: t('settings.smtpPort'),
            user: t('settings.smtpUser'),
            password: t('settings.smtpPassword'),
            secure: t('settings.smtpSecure'),
            fromName: t('settings.fromName'),
            fromEmail: t('settings.fromEmail'),
            save: t('common.save'),
            saving: t('common.loading'),
            test: t('settings.testEmail'),
            testTo: t('common.email'),
          }}
          messages={emailMessages}
        />
        <p className="small muted mt1">{t('settings.testEmailNote')}</p>
      </section>

      <section className="card">
        <h3 className="cardTitle">{t('settings.credentials')}</h3>
        <p className="small muted mb2">
          {t('settings.credentialsIntro')} ({t('settings.currentUsername')}:{' '}
          <strong>{admin?.username}</strong>)
        </p>
        <CredentialsForm
          action={changeAdminCredentialsAction}
          labels={{
            currentPassword: t('settings.currentPassword'),
            username: t('settings.newUsername'),
            password: t('settings.newPassword'),
            confirmPassword: t('settings.confirmPassword'),
            save: t('common.save'),
            saving: t('common.loading'),
          }}
          messages={credentialMessages}
        />
      </section>
    </div>
  )
}
