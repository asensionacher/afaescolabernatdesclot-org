import type { Metadata, Viewport } from 'next'

export const metadata: Metadata = {
  title: 'AMPA Bernat Desclot Studio',
  description: 'Sanity Studio for AMPA Bernat Desclot',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function StudioLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0 }}>{children}</body>
    </html>
  )
}
