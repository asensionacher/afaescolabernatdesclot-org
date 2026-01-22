import { NextRequest, NextResponse } from 'next/server';
import { jsPDF } from 'jspdf';
import fs from 'fs';
import path from 'path';

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

function generatePDF(data: RegistrationData): string {
  const doc = new jsPDF();
  
  // Load logo as base64
  let logoBase64 = '';
  try {
    const logoPath = path.join(process.cwd(), 'public', 'logo.png');
    const logoBuffer = fs.readFileSync(logoPath);
    logoBase64 = `data:image/png;base64,${logoBuffer.toString('base64')}`;
  } catch (error) {
    console.error('Error loading logo:', error);
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
  doc.text('FULL D\'INSCRIPCIÓ A L\'AFA CURS: 20___ - 20___', 105, yPosition, { align: 'center' });
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

  // Data protection acceptance
  if (yPosition > 240) {
    doc.addPage();
    drawHeader();
    yPosition = 50;
  }

  yPosition += 5;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('✓ He llegit i accepto la política de protecció de dades i ús d\'imatge', 20, yPosition);
  yPosition += 8;
  doc.setFont('helvetica', 'normal');
  doc.text(`Data de sol·licitud: ${new Date().toLocaleDateString('ca-ES')}`, 20, yPosition);

  // Return PDF as base64 string
  return doc.output('dataurlstring').split(',')[1];
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
    // Parse multipart form data
    const formData = await request.formData();
    const dataString = formData.get('data') as string;
    const paymentReceiptFile = formData.get('paymentReceipt') as File | null;
    
    if (!dataString) {
      return NextResponse.json(
        { error: 'Missing form data' },
        { status: 400 }
      );
    }
    
    const data: RegistrationData = JSON.parse(dataString);

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

    // Send to Telegram
    const telegramSent = await sendToTelegram(data);

    if (!telegramSent) {
      console.warn('Failed to send to Telegram, but continuing...');
    }

    // Generate PDF
    const pdfBase64 = generatePDF(data);
    
    // Generate filename for registration PDF
    const registrationFilename = generateFilename(data, 'inscripcion');

    // Send PDF to Telegram
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (botToken && chatId) {
      try {
        // Convert base64 to blob
        const pdfBuffer = Buffer.from(pdfBase64, 'base64');
        
        const formData = new FormData();
        formData.append('chat_id', chatId);
        const pdfBlob = new Blob([pdfBuffer], { type: 'application/pdf' });
        formData.append('document', pdfBlob, registrationFilename);
        formData.append('caption', '📄 Formulari d\'inscripció (PDF)');

        await fetch(`https://api.telegram.org/bot${botToken}/sendDocument`, {
          method: 'POST',
          body: formData,
        });
        
        // Send payment receipt if provided
        if (paymentReceiptFile && paymentReceiptFile.size > 0) {
          const receiptFilename = generateFilename(data, 'recibo');
          const receiptFormData = new FormData();
          receiptFormData.append('chat_id', chatId);
          
          // Convert File to Buffer
          const receiptArrayBuffer = await paymentReceiptFile.arrayBuffer();
          const receiptBuffer = Buffer.from(receiptArrayBuffer);
          const receiptBlob = new Blob([receiptBuffer], { type: paymentReceiptFile.type });
          
          receiptFormData.append('document', receiptBlob, receiptFilename);
          receiptFormData.append('caption', '💳 Justificant de pagament');

          await fetch(`https://api.telegram.org/bot${botToken}/sendDocument`, {
            method: 'POST',
            body: receiptFormData,
          });
        }
      } catch (error) {
        console.error('Error sending files to Telegram:', error);
      }
    }

    return NextResponse.json(
      { success: true, message: 'Registration submitted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error processing registration:', error);
    return NextResponse.json(
      { error: 'Failed to process registration' },
      { status: 500 }
    );
  }
}
