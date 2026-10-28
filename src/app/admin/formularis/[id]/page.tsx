import Link from 'next/link'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/db'
import { listSchoolYears } from '@/lib/school-year'
import { getT } from '@/lib/translator'
import { getLocale, formatDate } from '@/lib/i18n'
import { parseFields, parseLocalized } from '@/lib/forms'
import { saveFormAction, deleteFormAction } from '../../actions/forms'
import FormEditor, { type FormEditorLabels } from '@/components/admin/FormEditor'
import ConfirmButton from '@/components/admin/ConfirmButton'
import styles from './page.module.css'

function toDateInput(value: Date | null): string {
  if (!value) return ''
  return new Date(value).toISOString().slice(0, 10)
}

export default async function EditFormPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const t = await getT()
  const locale = await getLocale()

  const form = await prisma.form.findUnique({
    where: { id },
    include: { _count: { select: { submissions: true } } },
  })
  if (!form) notFound()

  const years = await listSchoolYears()
  const title = parseLocalized(form.title)
  const description = parseLocalized(form.description)
  const notice = parseLocalized(form.notice)

  const messages: Record<string, string> = {
    created: t('forms.created'),
    updated: t('forms.updated'),
    default: t('common.errorGeneric'),
    titleRequired: t('forms.titleRequired'),
    atLeastOneField: t('forms.atLeastOneField'),
    slugTaken: t('forms.slugTaken'),
    invalidFields: t('common.errorGeneric'),
    required: t('common.errorRequired'),
  }

  const labels: FormEditorLabels = {
    general: t('forms.general'),
    content: t('forms.content'),
    fields: t('forms.fields'),
    pricing: t('forms.pricing'),
    visibility: t('forms.visibility'),
    publishing: t('forms.publishing'),
    formTitle: t('forms.formTitle'),
    titleCa: t('forms.titleCa'),
    titleEs: t('forms.titleEs'),
    descriptionCa: t('forms.descriptionCa'),
    descriptionEs: t('forms.descriptionEs'),
    noticeCa: t('forms.noticeCa'),
    noticeEs: t('forms.noticeEs'),
    slug: t('forms.slug'),
    schoolYear: t('schoolYears.selectYear'),
    visibilityPublic: t('forms.visibilityPublic'),
    visibilityMembers: t('forms.visibilityMembers'),
    memberPrice: t('forms.memberPrice'),
    memberPriceHint: t('forms.memberPriceHint'),
    nonMemberPrice: t('forms.nonMemberPrice'),
    nonMemberPriceHint: t('forms.nonMemberPriceHint'),
    publishedAt: t('forms.publishedAt'),
    closesAt: t('forms.closesAt'),
    pinned: t('forms.pinned'),
    status: t('common.status'),
    fieldLabel: t('forms.fieldLabel'),
    fieldLabelEs: t('forms.fieldLabelEs'),
    fieldType: t('forms.fieldType'),
    fieldHelp: t('forms.fieldHelp'),
    fieldRequired: t('forms.fieldRequired'),
    fieldOptions: t('forms.fieldOptions'),
    fieldPlaceholder: t('forms.fieldPlaceholder'),
    addField: t('forms.addField'),
    noFields: t('forms.noFields'),
    moveUp: t('forms.moveUp'),
    moveDown: t('forms.moveDown'),
    remove: t('common.remove'),
    save: t('common.save'),
    saving: t('common.loading'),
    draft: t('common.draft'),
    published: t('common.published'),
    languageNote: t('forms.languageNote'),
  }

  return (
    <div>
      <Link href="/admin/formularis" className="btn btnGhost mb2">
        ← {t('common.back')}
      </Link>

      <div className="rowBetween mb2">
        <h2 className="sectionTitle">{t('forms.edit')}</h2>
        <div className="row">
          <Link href={`/formularis/${form.slug}`} target="_blank" className="btn btnSmall btnSecondary">
            {t('forms.previewLink')}
          </Link>
          <ConfirmButton
            action={deleteFormAction}
            id={form.id}
            label={t('common.delete')}
            className="btn btnSmall btnDanger"
            message={t('common.confirm')}
          />
        </div>
      </div>

      <p className={styles.meta}>
        /formularis/{form.slug} · {form._count.submissions} {t('submissions.title').toLowerCase()}
        {form.publishedAt ? ` · ${formatDate(form.publishedAt, locale)}` : ''}
      </p>

      <FormEditor
        action={saveFormAction}
        form={{
          id: form.id,
          slug: form.slug,
          titleCa: title.ca ?? '',
          titleEs: title.es ?? '',
          descriptionCa: description.ca ?? '',
          descriptionEs: description.es ?? '',
          noticeCa: notice.ca ?? '',
          noticeEs: notice.es ?? '',
          schoolYearId: form.schoolYearId,
          visibility: form.visibility,
          status: form.status,
          memberPrice: form.memberPrice,
          nonMemberPrice: form.nonMemberPrice,
          publishedAt: toDateInput(form.publishedAt),
          closesAt: toDateInput(form.closesAt),
          pinned: form.pinned,
          fields: parseFields(form.fields),
        }}
        years={years.map((year) => ({ id: year.id, name: year.name }))}
        currentYearId={form.schoolYearId}
        labels={labels}
        messages={messages}
      />
    </div>
  )
}
