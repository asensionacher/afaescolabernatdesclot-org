import Link from 'next/link'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/db'
import { getT } from '@/lib/translator'
import { updateSchoolYearAction } from '../../actions/school-years'
import SchoolYearForm from '@/components/admin/SchoolYearForm'

function toDateInput(date: Date): string {
  return date.toISOString().slice(0, 10)
}

export default async function SchoolYearDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const t = await getT()

  const year = await prisma.schoolYear.findUnique({ where: { id } })
  if (!year) notFound()

  const messages: Record<string, string> = {
    updated: t('schoolYears.updated'),
    default: t('common.errorGeneric'),
    nameTaken: t('common.errorGeneric'),
    required: t('common.errorRequired'),
    invalidRange: t('common.errorGeneric'),
  }

  return (
    <div>
      <Link href="/admin/anys-escolars" className="btn btnGhost mb2">
        ← {t('common.back')}
      </Link>
      <h2 className="sectionTitle">
        {t('schoolYears.edit')}: {year.name}
      </h2>

      <div className="card" style={{ maxWidth: 560 }}>
        <SchoolYearForm
          action={updateSchoolYearAction}
          year={{
            id: year.id,
            name: year.name,
            startDate: toDateInput(year.startDate),
            endDate: toDateInput(year.endDate),
            quotaAmount: year.quotaAmount,
            isCurrent: year.isCurrent,
          }}
          labels={{
            name: t('schoolYears.name'),
            startDate: t('schoolYears.startDate'),
            endDate: t('schoolYears.endDate'),
            quotaAmount: t('schoolYears.quotaAmount'),
            isCurrent: t('schoolYears.isCurrent'),
            save: t('common.save'),
            saving: t('common.loading'),
          }}
          messages={messages}
        />
      </div>
    </div>
  )
}
