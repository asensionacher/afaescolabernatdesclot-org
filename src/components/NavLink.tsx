'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function NavLink({
  href,
  children,
  className,
  exact = false,
}: {
  href: string
  children: React.ReactNode
  className?: string
  exact?: boolean
}) {
  const pathname = usePathname()
  const active = pathname === href ||
    (!exact && href !== '/' && pathname.startsWith(`${href}/`))

  return (
    <Link href={href} className={className} aria-current={active ? 'page' : undefined}>
      {children}
    </Link>
  )
}
