import Link from 'next/link'
import { listSchoolYears } from '@/lib/school-year'
import { getCurrentSchoolYear } from '@/lib/school-year'
import { getT } from '@/lib/translator'
import { saveFormAction } from '../../actions/forms'
import FormEditor, { type FormEditorLabels } from '@/components/admin/FormEditor'

export default async function NewFormPage() {
  const t = await getT()
  const years = await listSchoolYears()
  const currentYear = await getCurrentSchoolYear()

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
    editorHelp: t('forms.editorHelp'),
    contentHelp: t('forms.contentHelp'),
    fieldsHelp: t('forms.fieldsHelp'),
    publishingHelp: t('forms.publishingHelp'),
    untitledField: t('forms.untitledField'),
    slugHelp: t('forms.slugHelp'),
    fieldTypes: {
      TEXT: t('forms.fieldTypes.TEXT'),
      TEXTAREA: t('forms.fieldTypes.TEXTAREA'),
      EMAIL: t('forms.fieldTypes.EMAIL'),
      PHONE: t('forms.fieldTypes.PHONE'),
      NUMBER: t('forms.fieldTypes.NUMBER'),
      DATE: t('forms.fieldTypes.DATE'),
      SELECT: t('forms.fieldTypes.SELECT'),
      RADIO: t('forms.fieldTypes.RADIO'),
      CHECKBOX: t('forms.fieldTypes.CHECKBOX'),
      FILE: t('forms.fieldTypes.FILE'),
    },
    archived: t('common.archived'),
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
      <h2 className="sectionTitle">{t('forms.new')}</h2>

      <FormEditor
        action={saveFormAction}
        years={years.map((year) => ({ id: year.id, name: year.name }))}
        currentYearId={currentYear?.id ?? null}
        labels={labels}
        messages={messages}
      />
    </div>
  )
}
