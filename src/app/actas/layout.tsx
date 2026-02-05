import '../[locale]/globals.css'

export const metadata = {
  title: 'Actes de Reunió - AMPA Bernat Desclot',
  description: 'Sistema de gestió d\'actes de reunió de l\'AMPA Escola Bernat Desclot',
  robots: {
    index: false,
    follow: false,
  },
}

export default function ActasLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ca">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Baloo+2:wght@400;600;700;800&family=Nunito:wght@400;600;700&display=swap" rel="stylesheet" />
      </head>
      <body>{children}</body>
    </html>
  )
}
