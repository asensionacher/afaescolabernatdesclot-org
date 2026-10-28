import Link from 'next/link'
import { localizedValue, isFormExpired, type FormLike } from '@/lib/forms'
import { formatPrice } from '@/lib/i18n'
import type { Locale } from '@/lib/i18n'
import styles from './FormCard.module.css'

export interface FormCardProps {
  form: FormLike
  locale: Locale
  isLoggedIn: boolean
  isMember: boolean
  price: number
  memberPrice: number
  nonMemberPrice: number
}

export default function FormCard({
  form,
  locale,
  isLoggedIn,
  isMember,
  price,
  memberPrice,
  nonMemberPrice,
}: FormCardProps) {
  const expired = isFormExpired(form)
  const title = localizedValue(form.title, locale)
  const description = localizedValue(form.description, locale)
  const membersOnly = form.visibility === 'MEMBERS_ONLY'

  const classNames = [styles.card, expired ? styles.expired : ''].filter(Boolean).join(' ')

  return (
    <article className={classNames}>
      <div className={styles.head}>
        <h3 className={styles.title}>
          <Link href={`/formularis/${form.slug}`}>{title}</Link>
        </h3>
        <div className={styles.badges}>
          {form.pinned && !expired && <span className="badge badgeAccent">Anclat</span>}
          {membersOnly ? (
            <span className="badge">Només membres</span>
          ) : (
            <span className="badge badgeSuccess">Público</span>
          )}
          {expired && <span className="badge badgeMuted">Caducat</span>}
        </div>
      </div>

      {description && <p className={styles.description}>{description}</p>}

      <div className={styles.footer}>
        <div className={styles.price}>
          {isLoggedIn ? (
            <>
              <span className={styles.priceLabel}>El teu preu</span>
              <strong>{formatPrice(price, locale)}</strong>
              {!isMember && <span className={styles.priceHint}>preu de no membre</span>}
            </>
          ) : (
            <>
              <span className={styles.priceLabel}>Preu membre</span>
              <strong>{formatPrice(memberPrice, locale)}</strong>
              <span className={styles.priceHint}>
                no membre: {formatPrice(nonMemberPrice, locale)}
              </span>
            </>
          )}
        </div>

        {form.closesAt && (
          <span className={styles.deadline}>
            Fins al{' '}
            {new Intl.DateTimeFormat(locale === 'ca' ? 'ca-ES' : 'es-ES', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
            }).format(new Date(form.closesAt))}
          </span>
        )}
      </div>
    </article>
  )
}
