import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import { getCurrentSchoolYear, getMembershipStatus, isPaidMember } from '@/lib/school-year'
import { sortFormsForListing } from '@/lib/forms'
import { resolvePrice } from '@/lib/pricing'
import { getLocale } from '@/lib/i18n'
import { getT } from '@/lib/translator'
import FormCard from '@/components/FormCard'
import styles from './page.module.css'

export default async function HomePage() {
  const t = await getT()
  const locale = await getLocale()
  const user = await getCurrentUser()
  const schoolYear = await getCurrentSchoolYear()

  const forms = schoolYear
    ? await prisma.form.findMany({
        where: { schoolYearId: schoolYear.id, status: 'PUBLISHED' },
      })
    : []

  const sorted = sortFormsForListing(forms)
  const prices = await Promise.all(sorted.map((form) => resolvePrice(form, user?.id)))
  const membershipStatus = schoolYear ? await getMembershipStatus(user?.id, schoolYear.id) : null
  const hasPaidQuota = isPaidMember(membershipStatus)

  return (
    <div className="container">
      <section className={styles.hero}>
        <h1 className={styles.title}>{t('home.welcome')}</h1>
        <p className={styles.intro}>{t('home.intro')}</p>
        {schoolYear ? (
          <p className={styles.yearBadge}>
            {t('home.currentYear')}: <strong>{schoolYear.name}</strong>
          </p>
        ) : null}
      </section>

      {user && schoolYear && !hasPaidQuota ? (
        <div className="alert alertWarning">{t('home.quotaPending', { year: schoolYear.name })}</div>
      ) : null}

      {user && schoolYear && hasPaidQuota ? (
        <div className="alert alertSuccess">{t('home.quotaPaid', { year: schoolYear.name })}</div>
      ) : null}

      <section id="formularis" className={styles.formsSection}>
        <h2 className="sectionTitle">
          {schoolYear ? t('home.formsForYear', { year: schoolYear.name }) : t('nav.forms')}
        </h2>

        {sorted.length === 0 ? (
          <div className={styles.empty}>
            <p>{schoolYear ? t('home.noForms', { year: schoolYear.name }) : t('common.nothingHere')}</p>
          </div>
        ) : (
          <div className={styles.grid}>
            {sorted.map((form, index) => (
              <FormCard
                key={form.id}
                form={form}
                locale={locale}
                isLoggedIn={Boolean(user)}
                isMember={prices[index].isMember}
                price={prices[index].price}
                memberPrice={prices[index].memberPrice}
                nonMemberPrice={prices[index].nonMemberPrice}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
