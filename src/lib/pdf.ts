import { jsPDF } from 'jspdf'

export interface PdfAnswer {
  label: string
  value: string
}

export interface PdfSubmissionData {
  submissionId: string
  formTitle: string
  schoolYearName: string
  status: string
  contactName: string
  contactEmail: string
  contactPhone?: string | null
  priceTierLabel: string
  price: number
  total: number
  submittedAt: Date
  reviewedAt?: Date | null
  denialReason?: string | null
  answers: PdfAnswer[]
}

/** Los tipos de letra estándar de jsPDF usan WinAnsi: limpiamos caracteres no soportados. */
function sanitize(text: string): string {
  return text
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u2013\u2014]/g, '-')
    .replace(/[\u00AB\u00BB]/g, '"')
    .replace(/\u2022/g, '-')
    .replace(/\u2026/g, '...')
    .replace(/\u00A0/g, ' ')
}

function formatPrice(cents: number): string {
  return `${(cents / 100).toFixed(2)} EUR`
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

/** Genera el PDF de una respuesta de formulario. */
export function generateSubmissionPdf(data: PdfSubmissionData): Buffer {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  const pageWidth = doc.internal.pageSize.getWidth()
  const margin = 15
  const contentWidth = pageWidth - margin * 2
  let y = 18

  // Encabezado
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(16)
  doc.text(sanitize('AFA Escola Bernat Desclot'), margin, y)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.setTextColor(90)
  doc.text(sanitize(`Formulari: ${data.formTitle}`), margin, y + 6)
  doc.text(sanitize(`Curs: ${data.schoolYearName}`), margin, y + 11)
  doc.text(sanitize(`Referència: ${data.submissionId}`), margin, y + 16)
  doc.text(sanitize(`Enviat el ${formatDate(data.submittedAt)}`), margin, y + 21)
  doc.setTextColor(0)

  y += 30
  doc.setDrawColor(200)
  doc.line(margin, y - 6, pageWidth - margin, y - 6)

  // Estado
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.text(sanitize(`Estat: ${data.status}`), margin, y)
  y += 8

  // Contacto
  doc.setFontSize(11)
  doc.text(sanitize('Dades de contacte'), margin, y)
  y += 6
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.text(sanitize(`Nom: ${data.contactName}`), margin, y)
  y += 5
  doc.text(sanitize(`Correu: ${data.contactEmail}`), margin, y)
  y += 5
  if (data.contactPhone) {
    doc.text(sanitize(`Telèfon: ${data.contactPhone}`), margin, y)
    y += 5
  }
  y += 4

  // Precios
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.text(sanitize('Preu'), margin, y)
  y += 6
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.text(sanitize(`Tipus de preu: ${data.priceTierLabel}`), margin, y)
  y += 5
  doc.text(sanitize(`Preu aplicable: ${formatPrice(data.price)}`), margin, y)
  y += 5
  doc.setFont('helvetica', 'bold')
  doc.text(sanitize(`Total a pagar: ${formatPrice(data.total)}`), margin, y)
  y += 5
  doc.setFont('helvetica', 'normal')
  y += 5

  if (data.denialReason) {
    doc.setFont('helvetica', 'bold')
    doc.text(sanitize('Motiu de la denegació'), margin, y)
    y += 6
    doc.setFont('helvetica', 'normal')
    const lines = doc.splitTextToSize(sanitize(data.denialReason), contentWidth) as string[]
    for (const line of lines) {
      doc.text(line, margin, y)
      y += 5
    }
    y += 4
  }

  // Respuestas
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.text(sanitize('Respostes del formulari'), margin, y)
  y += 7
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)

  for (const answer of data.answers) {
    if (y > 265) {
      doc.addPage()
      y = 18
    }

    doc.setFont('helvetica', 'bold')
    doc.text(sanitize(answer.label), margin, y)
    y += 5
    doc.setFont('helvetica', 'normal')

    const lines = doc.splitTextToSize(sanitize(answer.value || '-'), contentWidth) as string[]
    for (const line of lines) {
      doc.text(line, margin, y)
      y += 5
    }
    y += 2
  }

  // Pie
  const pageCount = doc.getNumberOfPages()
  for (let page = 1; page <= pageCount; page += 1) {
    doc.setPage(page)
    doc.setFontSize(8)
    doc.setTextColor(140)
    doc.text(
      sanitize(`AFA Escola Bernat Desclot · ${data.submissionId} · Pàgina ${page} de ${pageCount}`),
      margin,
      287,
    )
  }

  return Buffer.from(doc.output('arraybuffer'))
}
