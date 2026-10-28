import Link from 'next/link'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import { getLocale, formatPrice } from '@/lib/i18n'
import { getT } from '@/lib/translator'
import { fieldLabel, isFormExpired, localizedValue, parseFields } from '@/lib/forms'
import { resolvePrice } from '@/lib/pricing'
import FormFiller, { type FillerField } from '@/components/FormFiller'
import styles from './page.module.css'

export default async function FormPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const t = await getT()
  const locale = await getLocale()
  const user = await getCurrentUser()

  const form = await prisma.form.findUnique({
    where: { slug },
    include: { schoolYear: true },
  })

  if (!form) notFound()

  const isAdmin = user?.role === 'ADMIN'
  const expired = isFormExpired(form)
  const membersOnly = form.visibility === 'MEMBERS_ONLY'
  const published = form.status === 'PUBLISHED'

  if (!published && !isAdmin) {
    return (
      <div className="containerNarrow">
        <h1 className="pageTitle">{localizedValue(form.title, locale)}</h1>
        <div className="alert alertWarning">{t('formPage.notPublished')}</div>
        <Link href="/" className="btn btnGhost">
          ← {t('formPage.backToForms')}
        </Link>
      </div>
    )
  }

  const price = await resolvePrice(form, user?.id)
  const fields: FillerField[] = parseFields(form.fields).map((field) => ({
    id: field.id,
    label: fieldLabel(field, locale),
    type: field.type,
    required: field.required,
    help: field.help,
    placeholder: field.placeholder,
    options: field.options,
  }))

  const notice = localizedValue(form.notice, locale)
  const locked = expired || !published

  return (
    <div className="containerNarrow">
      <Link href="/#formularis" className="btn btnGhost mb2">
        ← {t('formPage.backToForms')}
      </Link>

      <h1 className="pageTitle">{localizedValue(form.title, locale)}</h1>
      <p className={styles.meta}>
        {form.schoolYear.name}
        {form.closesAt
          ? ` · ${t('formPage.openUntil', {
              date: new Intl.DateTimeFormat(locale === 'ca' ? 'ca-ES' : 'es-ES').format(
                new Date(form.closesAt),
              ),
            })}`
          : ''}
      </p>

      {membersOnly && !user ? (
        <div className="alert alertWarning">
          <p>{t('home.membersOnlyNotice')}</p>
          <Link href={`/login?next=/formularis/${form.slug}`} className="btn btnSmall mt1">
            {t('home.loginToApply')}
          </Link>
        </div>
      ) : null}

      {expired ? <div className="alert alertWarning">{t('formPage.formExpired')}</div> : null}

      {notice ? <div className="alert">{notice}</div> : null}

      <section className={styles.priceBox}>
        <h2 className="stylesPriceTitle">{t('formPage.priceTitle')}</h2>
        <div className={styles.priceGrid}>
          <div className={styles.priceItem}>
            <span className={styles.priceLabel}>{t('formPage.memberPrice')}</span>
            <strong>{formatPrice(price.memberPrice, locale)}</strong>
          </div>
          <div className={styles.priceItem}>
            <span className={styles.priceLabel}>{t('formPage.nonMemberPrice')}</span>
            <strong>{formatPrice(price.nonMemberPrice, locale)}</strong>
          </div>
          <div className={`${styles.priceItem} ${styles.priceItemAccent}`}>
            <span className={styles.priceLabel}>{t('formPage.yourPrice')}</span>
            <strong>{formatPrice(price.price, locale)}</strong>
          </div>
        </div>
        {!price.isMember && user ? (
          <p className={styles.priceNote}>
            {t('home.quotaPending', { year: form.schoolYear.name })}
          </p>
        ) : null}
      </section>

      {fields.length > 0 ? (
        <FormFiller
          formId={form.id}
          fields={fields}
          locked={locked}
          defaultName={user?.name ?? ''}
          defaultEmail={user?.email ?? ''}
          defaultPhone={user?.phone ?? ''}
          labels={{
            contactLegend: t('formPage.contactLegend'),
            submit: t('formPage.submit'),
            submitting: t('formPage.submitting'),
            requiredHint: t('formPage.requiredHint'),
            success: t('formPage.successPending'),
            errorGeneric: t('formPage.errorGeneric'),
            uploadFile: t('formPage.uploadFile'),
            selectOption: t('formPage.selectOption'),
            yesNo: t('formPage.yesNo'),
            errors: {
              required: t('common.errorRequired'),
              email: t('common.errorEmail'),
              number: t('common.errorRequired'),
              fileTooBig: t('formPage.fileTooBig'),
            },
          }}
        />
      ) : (
        <div className="alert">{t('forms.atLeastOneField')}</div>
      )}
    </div>
  )
}
