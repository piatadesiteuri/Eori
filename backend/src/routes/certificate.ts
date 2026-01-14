import { Router, Request, Response } from 'express';
import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pool from '../db/connection.js';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const router = Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configurare email (pentru test, folosim un serviciu mock sau Gmail)
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
  },
});

// Funcție pentru generare PDF MOCK
function generateMockPDF(orderData: any): string {
  const outputDir = path.join(__dirname, '../../certificates');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const fileName = `certificat_${orderData.id}_${Date.now()}.pdf`;
  const filePath = path.join(outputDir, fileName);

  const doc = new PDFDocument({ margin: 50 });

  doc.pipe(fs.createWriteStream(filePath));

  // Header
  doc.fontSize(20).text('CERTIFICAT BENEFICIAR REAL', { align: 'center' });
  doc.moveDown();
  doc.fontSize(12).text('DOCUMENT MOCK - PENTRU TESTARE', { align: 'center' });
  doc.moveDown(2);

  // Informații despre firmă
  doc.fontSize(14).text('Date firma:', { underline: true });
  doc.moveDown(0.5);
  doc.fontSize(12);
  doc.text(`CUI: ${orderData.cui}`);
  doc.text(`Denumire: ${orderData.company_name || 'N/A'}`);
  doc.moveDown();

  // Informații despre document
  doc.fontSize(14).text('Tip document:', { underline: true });
  doc.moveDown(0.5);
  doc.fontSize(12);
  doc.text(`Tip: ${orderData.document_type}`);
  doc.moveDown();

  // Data emiterii
  doc.fontSize(14).text('Data emiterii:', { underline: true });
  doc.moveDown(0.5);
  doc.fontSize(12);
  doc.text(new Date().toLocaleDateString('ro-RO'));
  doc.moveDown(2);

  // Avertisment
  doc.fontSize(10)
    .fillColor('red')
    .text('⚠️ ATENȚIE: Acest este un document MOCK generat pentru testare.', {
      align: 'center',
    });
  doc.text('Nu este un document oficial și nu are valoare legală.', {
    align: 'center',
  });

  doc.end();

  return filePath;
}

router.post('/generate/:orderId', async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;

    // Preluăm comanda
    const [rows] = await pool.execute(
      'SELECT * FROM orders WHERE id = ?',
      [orderId]
    );

    const orders = rows as any[];

    if (orders.length === 0) {
      return res.status(404).json({ error: 'Comandă negăsită' });
    }

    const order = orders[0];

    if (order.status !== 'paid') {
      return res.status(400).json({ error: 'Comanda nu este plătită' });
    }

    // Generăm PDF-ul MOCK
    const pdfPath = generateMockPDF(order);

    // Actualizăm comanda cu calea către certificat
    await pool.execute(
      'UPDATE orders SET certificate_path = ?, status = ? WHERE id = ?',
      [pdfPath, 'completed', orderId]
    );

    // Trimitere email cu certificatul
    try {
      await transporter.sendMail({
        from: process.env.SMTP_USER || 'noreply@beneficiar-app.ro',
        to: order.email,
        subject: 'Certificat Beneficiar Real - Document MOCK',
        text: `Bună ziua,\n\nVă trimitem certificatul solicitat (MOCK pentru testare).\n\nComandă ID: ${orderId}\nCUI: ${order.cui}\n\nAcest document este generat pentru testare și nu are valoare legală.`,
        attachments: [
          {
            filename: `certificat_${orderId}.pdf`,
            path: pdfPath,
          },
        ],
      });
    } catch (emailError) {
      console.error('Error sending email:', emailError);
      // Nu returnăm eroare, certificatul a fost generat
    }

    res.json({
      success: true,
      message: 'Certificat generat și trimis pe email',
      certificatePath: pdfPath,
    });
  } catch (error: any) {
    console.error('Error generating certificate:', error);
    res.status(500).json({
      error: 'Eroare la generarea certificatului',
      message: error.message,
    });
  }
});

router.get('/download/:orderId', async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;

    const [rows] = await pool.execute(
      'SELECT certificate_path FROM orders WHERE id = ?',
      [orderId]
    );

    const orders = rows as any[];

    if (orders.length === 0 || !orders[0].certificate_path) {
      return res.status(404).json({ error: 'Certificat negăsit' });
    }

    const filePath = orders[0].certificate_path;

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Fișier negăsit' });
    }

    res.download(filePath, `certificat_${orderId}.pdf`);
  } catch (error: any) {
    console.error('Error downloading certificate:', error);
    res.status(500).json({
      error: 'Eroare la descărcarea certificatului',
      message: error.message,
    });
  }
});

export { router as generateCertificate };

