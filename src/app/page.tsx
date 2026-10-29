import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import { getCurrentSchoolYear } from '@/lib/school-year'
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

  return (
    <div className="container">
      <section id="formularis" className={styles.formsSection}>
        <h1 className={styles.title}>
          {schoolYear ? t('home.formsForYear', { year: schoolYear.name }) : t('nav.forms')}
        </h1>

        {sorted.length === 0 ? (
          <div className={styles.empty}>
            <p>{schoolYear ? t('home.noForms', { year: schoolYear.name }) : t('common.nothingHere')}</p>
          </div>
        ) : (
          <ul className={styles.list}>
            {sorted.map((form, index) => (
              <li key={form.id}>
                <FormCard
                  form={form}
                  locale={locale}
                  isLoggedIn={Boolean(user)}
                  isMember={prices[index].isMember}
                  price={prices[index].price}
                  memberPrice={prices[index].memberPrice}
                />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
