import Link from 'next/link'
import { localizedValue, isFormExpired, type FormLike } from '@/lib/forms'
import { formatPrice } from '@/lib/i18n'
import type { Locale } from '@/lib/i18n'
import { getT } from '@/lib/translator'
import styles from './FormCard.module.css'

export interface FormCardProps {
  form: FormLike
  locale: Locale
  isLoggedIn: boolean
  isMember: boolean
  price: number
  memberPrice: number
}

export default async function FormCard({
  form,
  locale,
  isLoggedIn,
  isMember,
  price,
  memberPrice,
}: FormCardProps) {
  const t = await getT()
  const expired = isFormExpired(form)
  const title = localizedValue(form.title, locale)
  const description = localizedValue(form.description, locale)
  const membersOnly = form.visibility === 'MEMBERS_ONLY'
  const needsLogin = membersOnly && !isLoggedIn && !expired

  const classNames = [styles.card, expired ? styles.expired : ''].filter(Boolean).join(' ')

  return (
    <article className={classNames}>
      <div className={styles.main}>
        <div className={styles.head}>
          <h2 className={styles.title}>
            <Link href={`/formularis/${form.slug}`}>{title}</Link>
          </h2>
          <div className={styles.badges}>
            {form.pinned && !expired && <span className="badge badgeAccent">{t('home.pinned')}</span>}
            {membersOnly ? (
              <span className="badge">{t('home.membersOnly')}</span>
            ) : (
              <span className="badge badgeSuccess">{t('home.isPublic')}</span>
            )}
            {expired && <span className="badge badgeMuted">{t('home.expired')}</span>}
          </div>
        </div>

        {description ? <p className={styles.description}>{description}</p> : null}

        <div className={styles.meta}>
          <span className={styles.price}>
            <span className={styles.priceLabel}>{t('formPage.yourPrice')}</span>
            <strong>{formatPrice(price, locale)}</strong>
          </span>
          {!isLoggedIn ? (
            <span className={styles.priceHint}>
              {t('formPage.memberPrice')}: {formatPrice(memberPrice, locale)}
            </span>
          ) : !isMember ? (
            <span className={styles.priceHint}>{t('formPage.nonMemberPrice')}</span>
          ) : null}
          {form.closesAt ? (
            <span className={styles.deadline}>
              {t('home.endsOn', {
                date: new Intl.DateTimeFormat(locale === 'ca' ? 'ca-ES' : 'es-ES', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                }).format(new Date(form.closesAt)),
              })}
            </span>
          ) : null}
        </div>
      </div>

      <Link
        href={needsLogin ? `/login?next=/formularis/${form.slug}` : `/formularis/${form.slug}`}
        className={`btn ${expired ? 'btnSecondary' : 'btnAccent'} ${styles.cta}`}
        aria-label={`${expired ? t('home.viewForm') : needsLogin ? t('nav.login') : t('home.fillForm')}: ${title}`}
      >
        {expired ? t('home.viewForm') : needsLogin ? t('home.loginToApply') : t('home.fillForm')}
        <span aria-hidden="true">→</span>
      </Link>
    </article>
  )
}
