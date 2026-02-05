import '../[locale]/globals.css'

export const metadata = {
  title: 'Partes de Reunió - AMPA Bernat Desclot',
  description: 'Sistema de gestió de partes de reunió',
}

export default function PartesLayout({
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
