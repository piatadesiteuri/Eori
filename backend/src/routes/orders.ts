import { Router, Request, Response } from 'express';
import pool from '../db/connection.js';

const router = Router();

router.post('/', async (req: Request, res: Response) => {
  try {
    const {
      cui,
      companyName,
      documentType,
      billingType,
      billingCui,
      billingCompanyName,
      billingCompanyAddress,
      billingCompanyRegistration,
      firstName,
      lastName,
      email,
      phone,
      billingName,
      billingAddress,
    } = req.body;

    // Log pentru debugging
    console.log('Received order data:', JSON.stringify(req.body, null, 2));

    // Validare de bază
    if (!cui || !documentType || !billingType) {
      return res.status(400).json({ error: 'Date incomplete: CUI, tip document sau tip facturare lipsesc.' });
    }

    // Validare în funcție de tipul de facturare
    let finalBillingName = '';
    let finalBillingAddress = '';
    let finalBillingCui = '';

    if (billingType === 'company') {
      // Folosim datele din certificat
      finalBillingName = companyName || '';
      finalBillingCui = cui || '';
    } else if (billingType === 'other_company') {
      // Validare pentru altă firmă
      if (!billingCui || !billingCompanyName) {
        return res.status(400).json({ error: 'Date incomplete - firma pentru facturare nu este validată' });
      }
      finalBillingName = billingCompanyName;
      finalBillingAddress = billingCompanyAddress || '';
      finalBillingCui = billingCui;
    } else if (billingType === 'individual') {
      // Validare pentru persoană fizică
      if (!firstName || !lastName) {
        return res.status(400).json({ error: 'Date incomplete - nume și prenume sunt obligatorii' });
      }
      finalBillingName = `${lastName} ${firstName}`.trim();
    }

    // Validare email
    if (!email) {
      return res.status(400).json({ error: 'Email-ul este obligatoriu' });
    }

    // Creăm comanda
    const [result] = await pool.execute(
      `INSERT INTO orders 
       (cui, company_name, document_type, document_purpose, extract_type, billing_type, billing_cui, billing_name, billing_address, billing_company_registration, first_name, last_name, email, phone, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
      [
        cui,
        companyName,
        documentType,
        req.body.documentPurpose || null,
        req.body.extractType || null,
        billingType,
        finalBillingCui || null,
        finalBillingName,
        finalBillingAddress || null,
        billingCompanyRegistration || null,
        firstName || null,
        lastName || null,
        email || '',
        phone || null,
      ]
    );

    const insertResult = result as any;
    const orderId = insertResult.insertId;

    res.json({
      success: true,
      orderId,
      message: 'Comandă creată cu succes',
    });
  } catch (error: any) {
    console.error('Error creating order:', error);
    res.status(500).json({
      error: 'Eroare la crearea comenzii',
      message: error.message,
    });
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const [rows] = await pool.execute(
      'SELECT * FROM orders WHERE id = ?',
      [id]
    );

    const orders = rows as any[];

    if (orders.length === 0) {
      return res.status(404).json({ error: 'Comandă negăsită' });
    }

    res.json({ success: true, data: orders[0] });
  } catch (error: any) {
    console.error('Error fetching order:', error);
    res.status(500).json({
      error: 'Eroare la preluarea comenzii',
      message: error.message,
    });
  }
});

export { router as createOrder };

