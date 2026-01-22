import { NextRequest, NextResponse } from 'next/server';
import { jsPDF } from 'jspdf';
import { PDFDocument } from 'pdf-lib';
import fs from 'fs';
import path from 'path';

// Configure route to accept larger payloads (10MB)
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};

// Next.js 15 App Router config
export const maxDuration = 60; // 60 seconds timeout
export const dynamic = 'force-dynamic';

interface Student {
  id: string;
  name: string;
  surname: string;
  catsalut: string;
  grade: string;
}

interface RegistrationData {
  guardian1Name: string;
  guardian1Dni: string;
  guardian1Email: string;
  guardian1Phone: string;
  guardian2Name: string;
  guardian2Dni: string;
  guardian2Email: string;
  guardian2Phone: string;
  address: string;
  number: string;
  floor: string;
  postalCode: string;
  city: string;
  province: string;
  students: Student[];
  acceptData: boolean;
  locale: string;
}

async function sendToTelegram(data: RegistrationData): Promise<boolean> {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!botToken || !chatId) {
    console.error('Telegram credentials not configured');
    return false;
  }

  // Format message for Telegram
  let message = `🆕 NOVA INSCRIPCIÓ AFA BERNAT DESCLOT\n\n`;
  message += `👤 TUTOR/A LEGAL 1:\n`;
  message += `   Nom: ${data.guardian1Name}\n`;
  message += `   DNI/NIE: ${data.guardian1Dni}\n`;
  message += `   Email: ${data.guardian1Email}\n`;
  message += `   Telèfon: ${data.guardian1Phone}\n\n`;

  if (data.guardian2Name) {
    message += `👤 TUTOR/A LEGAL 2:\n`;
    message += `   Nom: ${data.guardian2Name}\n`;
    message += `   DNI/NIE: ${data.guardian2Dni || 'N/A'}\n`;
    message += `   Email: ${data.guardian2Email || 'N/A'}\n`;
    message += `   Telèfon: ${data.guardian2Phone || 'N/A'}\n\n`;
  }

  message += `🏠 ADREÇA:\n`;
  message += `   ${data.address}, ${data.number}, ${data.floor}\n`;
  message += `   ${data.postalCode} ${data.city}\n`;
  message += `   Província: ${data.province}\n\n`;

  message += `👶 ALUMNES:\n`;
  data.students.forEach((student, index) => {
    message += `   ${index + 1}. ${student.name} ${student.surname}\n`;
    message += `      CATSALUT: ${student.catsalut}\n`;
    message += `      Curs: ${student.grade}\n`;
    if (index < data.students.length - 1) message += `\n`;
  });

  message += `\n✅ Dades acceptades: Sí`;

  try {
    const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'HTML',
      }),
    });

    if (!response.ok) {
      console.error('Failed to send Telegram message:', await response.text());
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error sending to Telegram:', error);
    return false;
  }
}

function generatePDF(data: RegistrationData, signatureDataUrl: string): string {
  const doc = new jsPDF();
  
  // Load logo as base64 (small PNG for PDF)
  let logoBase64 = '';
  try {
    const logoPath = path.join(process.cwd(), 'public', 'logo-small.png');
    const logoBuffer = fs.readFileSync(logoPath);
    logoBase64 = `data:image/png;base64,${logoBuffer.toString('base64')}`;
  } catch (error) {
    console.error('Error loading logo:', error);
  }

  // Load sello as base64 (small PNG for PDF)
  let selloBase64 = '';
  try {
    const selloPath = path.join(process.cwd(), 'public', 'sello-small.png');
    const selloBuffer = fs.readFileSync(selloPath);
    selloBase64 = `data:image/png;base64,${selloBuffer.toString('base64')}`;
  } catch (error) {
    console.error('Error loading sello:', error);
  }

  // Function to draw header on each page
  const drawHeader = () => {
    // Logo on the right
    if (logoBase64) {
      doc.addImage(logoBase64, 'PNG', 160, 10, 30, 30);
    }

    // Association info on the left
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('ASSOCIACIÓ DE FAMÍLIES D\'ALUMNES', 20, 15);
    doc.text('DE CEIP BERNAT DESCLOT', 20, 20);
    
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text('Carrer Aprestadora, 35-37, 08902 L\'Hospitalet del Llobregat (Barcelona)', 20, 28);
    doc.text('Tel: 934428448', 20, 32);
    doc.text('e-mail: afaescolabernatdesclot@gmail.com', 20, 36);

    // Line separator
    doc.setLineWidth(0.5);
    doc.line(20, 40, 190, 40);
  };

  // Draw header on first page
  drawHeader();

  // Title
  let yPosition = 50;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('FULL D\'INSCRIPCIÓ A L\'AFA CURS: 2025 - 2026', 105, yPosition, { align: 'center' });
  yPosition += 8;
  doc.text('DADES DEL SOCI Nº: _____________', 105, yPosition, { align: 'center' });
  yPosition += 12;

  // Guardian 1
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('PARE/MARE/TUTOR LEGAL 1:', 20, yPosition);
  yPosition += 6;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Nom i cognoms: ${data.guardian1Name}`, 20, yPosition);
  yPosition += 5;
  doc.text(`DNI/NIE: ${data.guardian1Dni}`, 20, yPosition);
  yPosition += 5;
  doc.text(`Email: ${data.guardian1Email}`, 20, yPosition);
  yPosition += 5;
  doc.text(`Telèfon: ${data.guardian1Phone}`, 20, yPosition);
  yPosition += 10;

  // Guardian 2 (if provided)
  if (data.guardian2Name) {
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('PARE/MARE/TUTOR LEGAL 2:', 20, yPosition);
    yPosition += 6;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Nom i cognoms: ${data.guardian2Name}`, 20, yPosition);
    yPosition += 5;
    if (data.guardian2Dni) {
      doc.text(`DNI/NIE: ${data.guardian2Dni}`, 20, yPosition);
      yPosition += 5;
    }
    if (data.guardian2Email) {
      doc.text(`Email: ${data.guardian2Email}`, 20, yPosition);
      yPosition += 5;
    }
    if (data.guardian2Phone) {
      doc.text(`Telèfon: ${data.guardian2Phone}`, 20, yPosition);
      yPosition += 5;
    }
    yPosition += 5;
  }

  // Address
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('ADREÇA DE CASA DELS ALUMNES:', 20, yPosition);
  yPosition += 6;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Carrer: ${data.address}, Nº ${data.number}, Pis ${data.floor}`, 20, yPosition);
  yPosition += 5;
  doc.text(`Codi postal: ${data.postalCode}`, 20, yPosition);
  yPosition += 5;
  doc.text(`Municipi: ${data.city}`, 20, yPosition);
  yPosition += 5;
  doc.text(`Província: ${data.province}`, 20, yPosition);
  yPosition += 10;

  // Students
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('ALUMNES:', 20, yPosition);
  yPosition += 6;

  data.students.forEach((student, index) => {
    // Check if we need a new page
    if (yPosition > 250) {
      doc.addPage();
      drawHeader(); // Draw header on new page
      yPosition = 50;
    }

    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(`Alumne ${index + 1}:`, 20, yPosition);
    yPosition += 5;

    doc.setFont('helvetica', 'normal');
    doc.text(`Nom: ${student.name}`, 25, yPosition);
    yPosition += 5;
    doc.text(`Cognoms: ${student.surname}`, 25, yPosition);
    yPosition += 5;
    doc.text(`Número CATSALUT: ${student.catsalut}`, 25, yPosition);
    yPosition += 5;
    doc.text(`Curs: ${student.grade}`, 25, yPosition);
    yPosition += 8;
  });

  // NEW PAGE 2: Data protection policy with signature
  doc.addPage();
  drawHeader();
  yPosition = 50;

  // Title
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('PROTECCIÓ DE DADES I ÚS D\'IMATGE', 105, yPosition, { align: 'center' });
  yPosition += 10;

  // Full data protection text
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  const dataProtectionText = [
    'PROTECCIÓ DE DADES',
    '',
    'En compliment de les lleis vigents i el Reglament (UE) 2016/679 del Parlament Europeu i del Consell',
    'del 27 d\'abril de 2016, relatiu a la protecció de les persones físiques en relació amb el tractament',
    'de dades de caràcter personal i a la lliure circulació d\'aquestes dades, es notifica que:',
    '',
    'Les dades facilitades en aquest document s\'incorporaran a un fitxer automatitzat de dades de',
    'caràcter personal denominat "Associats AFA" del qual és responsable l\'Associació de Famílies',
    'd\'Alumnes de l\'Escola Bernat Desclot, amb domicili al carrer Aprestadora, 35-37, de L\'Hospitalet',
    'de Llobregat (Barcelona), amb l\'objecte de:',
    '',
    '- Gestió del registre d\'associats de l\'AFA',
    '- Gestió d\'activitats de l\'associació',
    '- Remissió d\'informació, circulars i avisos relacionats amb l\'activitat associativa',
    '- Facturació i cobrament de quotes i serveis',
    '',
    'Les dades no seran cedides a tercers llevat d\'obligació legal. Podeu exercir els drets d\'accés,',
    'rectificació, cancel·lació i oposició mitjançant escrit dirigit a l\'adreça indicada o a l\'adreça',
    'electrònica afaescolabernatdesclot@gmail.com',
    '',
    'ÚS D\'IMATGE',
    '',
    'L\'Associació de Famílies d\'Alumnes de l\'Escola Bernat Desclot demana el consentiment per editar,',
    'publicar i difondre els noms, cognoms i fotografies on puguin aparèixer els alumnes associats durant',
    'la realització de qualsevol activitat promoguda per l\'associació, sigui amb finalitats informatives,',
    'culturals o educatives, amb la intenció de divulgar l\'activitat associativa.',
    '',
    'Les imatges podran ser publicades en suports informatius o mitjans de comunicació de l\'associació',
    'com ara: pàgina web, xarxes socials, cartells, tríptics o altres materials informatius.',
    '',
    'Aquest consentiment es podrà revocar en qualsevol moment mitjançant notificació escrita a l\'adreça',
    'de l\'associació o mitjançant correu electrònic a afaescolabernatdesclot@gmail.com',
  ];

  // Draw text with automatic line wrapping
  dataProtectionText.forEach(line => {
    if (line === '') {
      yPosition += 3; // Small space for empty lines
    } else {
      const splitText = doc.splitTextToSize(line, 170);
      splitText.forEach((textLine: string) => {
        if (yPosition > 260) {
          doc.addPage();
          drawHeader();
          yPosition = 50;
        }
        doc.text(textLine, 20, yPosition);
        yPosition += 4;
      });
    }
  });

  yPosition += 10;

  // Signature section at the bottom of the same page
  if (yPosition > 200) {
    // Not enough space, continue on same page but adjust
    yPosition = 210;
  }

  // Separator line
  doc.setLineWidth(0.3);
  doc.line(20, yPosition, 190, yPosition);
  yPosition += 8;

  // Two-column layout for signature
  // Left column: Seal and association name
  const leftX = 20;
  const rightX = 110;
  
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('Associació de famílies d\'alumnes', leftX, yPosition);
  doc.text('CEIP Bernat Desclot', leftX, yPosition + 4);
  
  // Add seal image
  if (selloBase64) {
    doc.addImage(selloBase64, 'PNG', leftX, yPosition + 8, 35, 35);
  }

  // Right column: Guardian signature
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  
  // Name and DNI in one line
  doc.text(`${data.guardian1Name}, ${data.guardian1Dni}`, rightX, yPosition);
  yPosition += 5;
  
  // Location and date
  const today = new Date();
  const todayFormatted = today.toLocaleDateString('ca-ES', { 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric' 
  });
  doc.text(`En Hospitalet de Llobregat a ${todayFormatted}`, rightX, yPosition);
  yPosition += 8;
  
  // Add signature image
  if (signatureDataUrl) {
    doc.addImage(signatureDataUrl, 'PNG', rightX, yPosition, 60, 20);
  }
  
  yPosition += 22;
  doc.setFontSize(7);
  doc.setFont('helvetica', 'italic');
  doc.text('Accepto els termes de protecció de dades i ús d\'imatge', rightX, yPosition);

  // Return PDF as base64 string
  return doc.output('dataurlstring').split(',')[1];
}

// Combine registration PDF with payment receipt
async function combinePDFs(registrationPdfBase64: string, receiptFile: File): Promise<string> {
  try {
    // Load the registration PDF
    const registrationPdfBytes = Buffer.from(registrationPdfBase64, 'base64');
    const registrationPdf = await PDFDocument.load(registrationPdfBytes);

    // Load the receipt PDF/Image
    const receiptArrayBuffer = await receiptFile.arrayBuffer();
    const receiptBuffer = Buffer.from(receiptArrayBuffer);

    let combinedPdf = registrationPdf;

    // Check file type
    const fileType = receiptFile.type;
    
    if (fileType === 'application/pdf') {
      // If receipt is a PDF, merge it
      const receiptPdf = await PDFDocument.load(receiptBuffer);
      const copiedPages = await combinedPdf.copyPages(receiptPdf, receiptPdf.getPageIndices());
      copiedPages.forEach((page) => {
        combinedPdf.addPage(page);
      });
    } else if (fileType.startsWith('image/')) {
      // If receipt is an image, add it as a new page
      const page = combinedPdf.addPage();
      const { width, height } = page.getSize();
      
      let image;
      if (fileType === 'image/png') {
        image = await combinedPdf.embedPng(receiptBuffer);
      } else if (fileType === 'image/jpeg' || fileType === 'image/jpg') {
        image = await combinedPdf.embedJpg(receiptBuffer);
      } else {
        // Unsupported image type, skip
        console.warn('Unsupported image type:', fileType);
        return registrationPdfBase64;
      }

      // Calculate dimensions to fit the page
      const imageAspectRatio = image.width / image.height;
      const pageAspectRatio = width / height;

      let drawWidth, drawHeight, x, y;

      if (imageAspectRatio > pageAspectRatio) {
        // Image is wider than page
        drawWidth = width - 40; // 20px margin on each side
        drawHeight = drawWidth / imageAspectRatio;
        x = 20;
        y = (height - drawHeight) / 2;
      } else {
        // Image is taller than page
        drawHeight = height - 40; // 20px margin on top and bottom
        drawWidth = drawHeight * imageAspectRatio;
        x = (width - drawWidth) / 2;
        y = 20;
      }

      page.drawImage(image, {
        x,
        y,
        width: drawWidth,
        height: drawHeight,
      });
    }

    // Save the combined PDF
    const combinedPdfBytes = await combinedPdf.save();
    return Buffer.from(combinedPdfBytes).toString('base64');
  } catch (error) {
    console.error('Error combining PDFs:', error);
    // Return original registration PDF if combining fails
    return registrationPdfBase64;
  }
}

// Generate filename based on student info
function generateFilename(data: RegistrationData, type: 'inscripcion' | 'recibo'): string {
  const firstStudent = data.students[0];
  
  // Get surname parts (split by space and take first two)
  const surnameParts = firstStudent.surname.trim().split(/\s+/);
  const surname1 = surnameParts[0] || '';
  const surname2 = surnameParts[1] || '';
  
  // Normalize surnames (remove accents, lowercase, replace spaces with underscores)
  const normalizeName = (name: string) => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove accents
      .replace(/\s+/g, '_');
  };
  
  const normalizedSurname1 = normalizeName(surname1);
  const normalizedSurname2 = normalizeName(surname2);
  
  // Get grades for all students
  const grades = data.students.map(s => s.grade).join('_');
  
  // Construct filename
  const typePrefix = type === 'inscripcion' ? 'inscripcion' : 'recibo';
  return `${typePrefix}_${normalizedSurname1}_${normalizedSurname2}_${grades}_25_26.pdf`;
}

export async function POST(request: NextRequest) {
  try {
    console.log('=== Starting registration process ===');
    
    // Parse multipart form data
    const formData = await request.formData();
    console.log('FormData received');
    
    const dataString = formData.get('data') as string;
    const paymentReceiptFile = formData.get('paymentReceipt') as File | null;
    const signatureDataUrl = formData.get('signature') as string;
    
    console.log('Payment receipt file:', paymentReceiptFile?.name, paymentReceiptFile?.type, paymentReceiptFile?.size);
    console.log('Signature present:', !!signatureDataUrl);
    
    if (!dataString) {
      console.error('Missing form data');
      return NextResponse.json(
        { error: 'Missing form data' },
        { status: 400 }
      );
    }

    if (!signatureDataUrl) {
      console.error('Missing signature');
      return NextResponse.json(
        { error: 'Missing signature' },
        { status: 400 }
      );
    }
    
    const data: RegistrationData = JSON.parse(dataString);
    console.log('Data parsed successfully');

    // Validate required fields
    if (!data.guardian1Name || !data.guardian1Email || !data.guardian1Phone) {
      return NextResponse.json(
        { error: 'Missing required guardian 1 information' },
        { status: 400 }
      );
    }

    if (!data.address || !data.number || !data.floor || !data.postalCode || !data.city || !data.province) {
      return NextResponse.json(
        { error: 'Missing required address information' },
        { status: 400 }
      );
    }

    if (!data.students || data.students.length === 0) {
      return NextResponse.json(
        { error: 'At least one student is required' },
        { status: 400 }
      );
    }

    if (!data.acceptData) {
      return NextResponse.json(
        { error: 'Data protection must be accepted' },
        { status: 400 }
      );
    }

    if (!paymentReceiptFile) {
      return NextResponse.json(
        { error: 'Payment receipt is required' },
        { status: 400 }
      );
    }

    console.log('All validations passed');

    // Send to Telegram
    console.log('Sending to Telegram...');
    const telegramSent = await sendToTelegram(data);

    if (!telegramSent) {
      console.warn('Failed to send to Telegram, but continuing...');
    } else {
      console.log('Telegram message sent successfully');
    }

    // Generate PDF with signature
    console.log('Generating PDF...');
    const registrationPdfBase64 = generatePDF(data, signatureDataUrl);
    console.log('PDF generated, size:', registrationPdfBase64.length);
    
    // Combine registration PDF with payment receipt
    console.log('Combining PDFs...');
    const finalPdfBase64 = await combinePDFs(registrationPdfBase64, paymentReceiptFile);
    console.log('PDFs combined, final size:', finalPdfBase64.length);
    
    // Generate filename for registration PDF
    const registrationFilename = generateFilename(data, 'inscripcion');
    console.log('Filename:', registrationFilename);

    // Send PDF to Telegram
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (botToken && chatId) {
      try {
        console.log('Sending combined PDF to Telegram...');
        // Convert base64 to blob - send the COMBINED PDF (with receipt included)
        const pdfBuffer = Buffer.from(finalPdfBase64, 'base64');
        
        const formData = new FormData();
        formData.append('chat_id', chatId);
        const pdfBlob = new Blob([pdfBuffer], { type: 'application/pdf' });
        formData.append('document', pdfBlob, registrationFilename);
        formData.append('caption', '📄 Formulari d\'inscripció amb justificant (PDF)');

        const telegramResponse = await fetch(`https://api.telegram.org/bot${botToken}/sendDocument`, {
          method: 'POST',
          body: formData,
        });
        
        if (telegramResponse.ok) {
          console.log('PDF sent to Telegram successfully');
        } else {
          console.error('Failed to send PDF to Telegram:', await telegramResponse.text());
        }
      } catch (error) {
        console.error('Error sending files to Telegram:', error);
      }
    } else {
      console.warn('Telegram credentials not configured');
    }

    console.log('=== Registration completed successfully ===');
    return NextResponse.json(
      { 
        success: true, 
        message: 'Registration submitted successfully',
        pdfBase64: finalPdfBase64,
        filename: registrationFilename
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('=== ERROR in registration process ===');
    console.error('Error details:', error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    return NextResponse.json(
      { error: 'Failed to process registration', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
