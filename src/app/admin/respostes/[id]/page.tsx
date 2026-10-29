import Link from 'next/link'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/db'
import { getT } from '@/lib/translator'
import { getLocale, formatDateTime, formatPrice } from '@/lib/i18n'
import { localizedValue } from '@/lib/forms'
import { acceptSubmissionAction, denySubmissionAction } from '../../actions/submissions'
import ReviewForm from '@/components/admin/ReviewForm'
import styles from './page.module.css'

interface StoredAnswer {
  fieldId: string
  label: string
  type: string
  value: string
}

function parseAnswers(value: unknown): StoredAnswer[] {
  if (!Array.isArray(value)) return []
  return value.filter(
    (answer): answer is StoredAnswer =>
      Boolean(answer) && typeof answer === 'object' && typeof (answer as StoredAnswer).value === 'string',
  )
}

export default async function SubmissionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const t = await getT()
  const locale = await getLocale()

  const submission = await prisma.submission.findUnique({
    where: { id },
    include: { form: { include: { schoolYear: true } }, user: true, reviewedBy: true },
  })
  if (!submission) notFound()

  const answers = parseAnswers(submission.answers)
  const uploadIds = answers.filter((a) => a.type === 'FILE' && a.value).map((a) => a.value)
  const uploads = uploadIds.length
    ? await prisma.upload.findMany({ where: { id: { in: uploadIds } } })
    : []
  const uploadNames = new Map(uploads.map((upload) => [upload.id, upload.filename]))

  const messages: Record<string, string> = {
    acceptedOk: t('submissions.acceptedOk'),
    deniedOk: t('submissions.deniedOk'),
    denialReasonRequired: t('submissions.denialReasonRequired'),
    default: t('common.errorGeneric'),
  }

  return (
    <div>
      <Link href="/admin/respostes" className="btn btnGhost mb2">
        ← {t('common.back')}
      </Link>

      <div className="rowBetween mb2">
        <h2 className="sectionTitle">
          {t('submissions.responseFor', { title: localizedValue(submission.form.title, locale) })}
        </h2>
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

      <p className={styles.meta}>
        {formatDateTime(submission.createdAt, locale)} · {submission.form.schoolYear.name} ·{' '}
        {submission.priceTier === 'MEMBER' ? t('submissions.member') : t('submissions.nonMember')}
      </p>

      <div className={styles.columns}>
        <section className="card">
          <h3 className="cardTitle">{t('submissions.answers')}</h3>

          {answers.length === 0 ? (
            <p className="muted">{t('common.nothingHere')}</p>
          ) : (
            <dl className={styles.answers}>
              {answers.map((answer, index) => (
                <div className={styles.answer} key={`${answer.fieldId}-${index}`}>
                  <dt>{answer.label}</dt>
                  <dd>
                    {answer.type === 'FILE' ? (
                      answer.value ? (
                        <a href={`/api/uploads/${answer.value}`} target="_blank">
                          {uploadNames.get(answer.value) ?? answer.value}
                        </a>
                      ) : (
                        '—'
                      )
                    ) : (
                      answer.value || '—'
                    )}
                  </dd>
                </div>
              ))}
            </dl>
          )}
        </section>

        <div className="stack">
          <section className="card">
            <h3 className="cardTitle">{t('submissions.contactInfo')}</h3>
            <p>
              <strong>{submission.contactName}</strong>
            </p>
            <p><a href={`mailto:${submission.contactEmail}`}>{submission.contactEmail}</a></p>
            {submission.contactPhone ? <p><a href={`tel:${submission.contactPhone}`}>{submission.contactPhone}</a></p> : null}
            {submission.user ? (
              <p className="small muted">
                {submission.user.username} · {submission.user.name}
              </p>
            ) : null}
            <p className="mt1">
              {t('submissions.priceAtSubmit')}:{' '}
              <strong>{formatPrice(submission.price, locale)}</strong>
            </p>
          </section>

          {submission.denialReason ? (
            <section className="card">
              <h3 className="cardTitle">{t('submissions.denialReason')}</h3>
              <p className="small">{submission.denialReason}</p>
            </section>
          ) : null}

          {submission.pdfData ? (
            <a
              href={`/api/submissions/${submission.id}/pdf`}
              className="btn btnSecondary btnBlock"
              target="_blank"
            >
              {t('submissions.downloadPdf')}
            </a>
          ) : (
            <p className="muted small">{t('submissions.pdfMissing')}</p>
          )}

          <section className="card">
            <h3 className="cardTitle">{t('submissions.review')}</h3>
            <p className="small muted mb2">{t('submissions.reviewHelp')}</p>
            <ReviewForm
              acceptAction={acceptSubmissionAction}
              denyAction={denySubmissionAction}
              submissionId={submission.id}
              labels={{
                reason: t('submissions.denialReason'),
                accept: t('submissions.accept'),
                deny: t('submissions.deny'),
                saving: t('common.loading'),
                reasonRequired: t('submissions.denialReasonRequired'),
              }}
              messages={messages}
            />
            {submission.status === 'DENIED' ? (
              <p className="small muted mt1">{t('submissions.resubmit')}</p>
            ) : null}
          </section>
        </div>
      </div>
    </div>
  )
}
