import { Router, Request, Response } from 'express';
import crypto from 'crypto';
import pool from '../db/connection.js';
import dotenv from 'dotenv';
import axios from 'axios';
import { Builder, Parser } from 'xml2js';
import forge from 'node-forge';
import fs from 'fs';
import path from 'path';

dotenv.config();

const router = Router();

// Funcție helper pentru calcularea prețului în funcție de tipul documentului și extractType
function getDocumentPrice(docType: string, extractType?: string | null): number {
  if (docType === 'certificat_beneficiar') {
    return 88;
  }
  if (docType === 'furnizare_info') {
    // Dacă este selectat "Raport istoric", prețul este 247 lei, altfel 165 lei
    if (extractType === 'raport_istoric') {
      return 247;
    }
    return 165;
  }
  if (docType === 'certificat_istoric') {
    return 399;
  }
  return 0;
}

// Netopia Payments Configuration
const NETOPIA_SIGNATURE = process.env.NETOPIA_SIGNATURE || '';
const NETOPIA_SANDBOX = process.env.NETOPIA_SANDBOX === 'true';
const NETOPIA_RETURN_URL = process.env.NETOPIA_RETURN_URL || 'http://localhost:4000/plata/success';
const NETOPIA_CONFIRM_URL = process.env.NETOPIA_CONFIRM_URL || 'http://localhost:6000/api/payment/netopia/confirm';

// Netopia API URLs (conform documentației oficiale)
// Live: https://secure.mobilpay.ro
// Sandbox: https://sandboxsecure.mobilpay.ro (doar HTTP POST)
const NETOPIA_PAYMENT_URL = NETOPIA_SANDBOX
  ? 'https://sandboxsecure.mobilpay.ro'
  : 'https://secure.mobilpay.ro';

// IMPORTANT: Trebuie să descarci cheia publică Netopia din contul tău Netopia
// și să o plasezi în backend/src/keys/netopia-public.cer
// Sau setează NETOPIA_PUBLIC_KEY_PATH în .env
const NETOPIA_PUBLIC_KEY_PATH = process.env.NETOPIA_PUBLIC_KEY_PATH || 
  path.join(process.cwd(), 'src', 'keys', 'netopia-public.cer');

// XML Builder pentru crearea XML-ului Netopia
// IMPORTANT: Nu setăm rootName aici, pentru că obiectul XML deja are 'order' ca rădăcină
const xmlBuilder = new Builder({
  cdata: true,
  headless: true,
  // rootName: 'order', // REMOVED - obiectul XML deja are 'order' ca rădăcină
});

/**
 * Criptează datele folosind RSA + AES-256-CBC (conform documentației Netopia)
 */
function encryptNetopiaData(publicKeyPem: string, xmlData: string, algorithm: string = 'aes-256-cbc'): {
  iv: string;
  env_key: string;
  data: string;
  cipher: string;
} {
  // Generăm cheia simetrică AES (32 bytes pentru AES-256)
  const key = crypto.randomBytes(32);
  // Generăm IV (16 bytes pentru AES)
  const iv = crypto.randomBytes(16);

  // Criptăm XML-ul folosind AES-256-CBC
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  let encrypted = cipher.update(xmlData, 'utf8', 'base64');
  encrypted += cipher.final('base64');

  // Criptăm cheia AES folosind RSA cu cheia publică Netopia
  const envKey = crypto.publicEncrypt(
    {
      key: publicKeyPem,
      padding: crypto.constants.RSA_PKCS1_PADDING,
    },
    key
  );

  return {
    iv: iv.toString('base64'),
    env_key: envKey.toString('base64'),
    data: encrypted,
    cipher: algorithm,
  };
}

/**
 * Decriptează datele primite de la Netopia folosind RSA + AES-256-CBC
 */
function decryptNetopiaData(privateKeyPem: string, iv: string, envKey: string, data: string, cipher: string): string {
  try {
    // Decriptăm cheia AES folosind cheia privată RSA
    const privateKey = forge.pki.privateKeyFromPem(privateKeyPem);
    const envKeyBuffer = Buffer.from(envKey, 'base64');
    const symmetricKey = privateKey.decrypt(envKeyBuffer.toString('binary'), 'RSAES-PKCS1-V1_5');
    const keyBuffer = Buffer.from(symmetricKey, 'binary');

    // Decriptăm datele folosind AES-256-CBC
    const ivBuffer = Buffer.from(iv, 'base64');
    const decipher = crypto.createDecipheriv(cipher, keyBuffer, ivBuffer);
    let decrypted = decipher.update(data, 'base64', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error: any) {
    console.error('Error decrypting Netopia data:', error);
    throw new Error(`Failed to decrypt Netopia data: ${error.message}`);
  }
}

/**
 * Creează structura XML pentru Netopia (conform documentației)
 */
function createNetopiaPaymentXML(
  orderId: string,
  amount: number,
  currency: string,
  description: string,
  customerData: {
    email: string;
    firstName: string;
    lastName: string;
    phone: string;
  }
): string {
  const date = new Date();
  
  const xmlData = {
    order: {
      $: {
        id: orderId,
        timestamp: date.getTime().toString(),
        type: 'card',
      },
      signature: NETOPIA_SIGNATURE,
      url: {
        return: NETOPIA_RETURN_URL,
        confirm: NETOPIA_CONFIRM_URL,
      },
      invoice: {
        $: {
          currency: currency,
          amount: amount.toString(),
        },
        details: description,
        contact_info: {
          billing: {
            $: {
              type: 'person',
            },
            first_name: customerData.firstName || 'Customer',
            last_name: customerData.lastName || 'Customer',
            address: 'Romania', // Poți adăuga adresa completă dacă este disponibilă
            email: customerData.email,
            mobile_phone: customerData.phone || '',
          },
        },
      },
      ipn_cipher: 'aes-256-cbc',
    },
  };

  return xmlBuilder.buildObject(xmlData);
}

/**
 * Endpoint intermediar pentru a returna HTML-ul Netopia
 * GET /api/payment/netopia/redirect/:orderId
 * 
 * Acest endpoint primește orderId, creează plata Netopia și returnează HTML-ul direct
 */
router.get('/redirect/:orderId', async (req: Request, res: Response) => {
  console.log('🔵 Netopia redirect endpoint called:', {
    orderId: req.params.orderId,
    amount: req.query.amount,
    method: req.method,
    url: req.url,
  });

  try {
    const { orderId } = req.params;
    const { amount } = req.query;

    if (!orderId || !amount) {
      console.error('❌ Missing orderId or amount:', { orderId, amount });
      return res.status(400).send('<html><body><h1>Eroare: Date incomplete</h1><p>orderId: ' + orderId + ', amount: ' + amount + '</p></body></html>');
    }

    // Verificăm dacă comanda există
    const [orderRows] = await pool.execute(
      'SELECT * FROM orders WHERE id = ?',
      [orderId]
    );
    const orders = orderRows as any[];
    
    if (orders.length === 0) {
      return res.status(404).send('<html><body><h1>Comandă negăsită</h1></body></html>');
    }

    const order = orders[0];

    // Generăm netopiaOrderId
    const date = new Date();
    const dateStr = date.toISOString().split('T')[0].replace(/-/g, '');
    const randomStr = Math.random().toString(36).substring(2, 10).toUpperCase();
    const netopiaOrderId = `ORD-${dateStr}-${randomStr}`;
    
    const documentTypeNames: Record<string, string> = {
      certificat_beneficiar: 'Certificat Beneficiar',
      furnizare_info: 'Beneficiari Reali',
      certificat_istoric: 'Certificat Beneficiar cu Istoric',
    };
    const documentName = documentTypeNames[order.document_type] || 'Certificat ONRC';
    const orderDescription = `${documentName} - ${netopiaOrderId}`;

    // Încărcăm cheia publică
    let publicKeyPem: string | null = null;
    try {
      if (fs.existsSync(NETOPIA_PUBLIC_KEY_PATH)) {
        publicKeyPem = fs.readFileSync(NETOPIA_PUBLIC_KEY_PATH, 'utf8');
      } else {
        return res.status(500).send('<html><body><h1>Eroare: Cheia publică Netopia nu a fost găsită</h1></body></html>');
      }
    } catch (keyError: any) {
      return res.status(500).send('<html><body><h1>Eroare la încărcarea cheii publice Netopia</h1></body></html>');
    }

    // Extragem numele și prenumele din contactData
    // IMPORTANT: Pentru Netopia, folosim numele din Step 4 (Date de contact), nu din billing
    // Dacă nu avem first_name/last_name în comandă, încercăm să le extragem din email sau folosim valorile default
    let firstName = order.first_name;
    let lastName = order.last_name;
    
    // Dacă nu avem nume în comandă, încercăm să le extragem din email (partea înainte de @)
    if (!firstName || !lastName) {
      const emailParts = order.email?.split('@')[0] || '';
      const nameParts = emailParts.split('.');
      if (nameParts.length >= 2) {
        firstName = firstName || nameParts[0].charAt(0).toUpperCase() + nameParts[0].slice(1);
        lastName = lastName || nameParts[1].charAt(0).toUpperCase() + nameParts[1].slice(1);
      } else {
        // Dacă nu putem extrage, folosim primele două cuvinte din email
        const words = emailParts.split(/[._-]/);
        firstName = firstName || (words[0] ? words[0].charAt(0).toUpperCase() + words[0].slice(1) : 'Customer');
        lastName = lastName || (words[1] ? words[1].charAt(0).toUpperCase() + words[1].slice(1) : 'Customer');
      }
    }

    // Creează și criptează XML-ul
    const xmlData = createNetopiaPaymentXML(
      netopiaOrderId,
      parseFloat(amount.toString()),
      'RON',
      orderDescription,
      {
        email: order.email,
        firstName: firstName || 'Customer',
        lastName: lastName || 'Customer',
        phone: order.phone || '',
      }
    );

    console.log('Generated XML for Netopia:', xmlData);
    console.log('XML length:', xmlData.length);
    console.log('XML starts with:', xmlData.substring(0, 200));

    const encryptedData = encryptNetopiaData(publicKeyPem, xmlData, 'aes-256-cbc');
    
    console.log('Encrypted data prepared:', {
      ivLength: encryptedData.iv.length,
      envKeyLength: encryptedData.env_key.length,
      dataLength: encryptedData.data.length,
      cipher: encryptedData.cipher,
    });

    // Trimitem POST către Netopia
    const formData = new URLSearchParams();
    formData.append('env_key', encryptedData.env_key);
    formData.append('data', encryptedData.data);
    formData.append('iv', encryptedData.iv);
    formData.append('cipher', encryptedData.cipher);

    console.log('Sending POST to Netopia:', NETOPIA_PAYMENT_URL);
    console.log('Form data keys:', Array.from(formData.keys()));

    const response = await axios.post(
      NETOPIA_PAYMENT_URL,
      formData.toString(),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        maxRedirects: 0,
        validateStatus: (status) => status >= 200 && status < 400,
        responseType: 'text', // IMPORTANT: Așteptăm text/html, nu JSON
      }
    );

    console.log('Netopia response status:', response.status);
    console.log('Netopia response headers:', response.headers);
    console.log('Netopia response data length:', response.data?.length || 0);
    console.log('Netopia response data preview:', response.data?.substring(0, 500) || 'No data');

    // Actualizăm comanda
    await pool.execute(
      'UPDATE orders SET payment_intent_id = ? WHERE id = ?',
      [netopiaOrderId, orderId]
    );

    // Netopia returnează redirect 302 cu Location header către pagina de plată
    if (response.status === 302 || response.status === 301) {
      const redirectUrl = response.headers.location;
      if (redirectUrl) {
        console.log('✅ Netopia redirect URL:', redirectUrl);
        // Facem redirect către URL-ul Netopia
        res.redirect(redirectUrl);
        return;
      }
    }

    // Dacă nu este redirect, returnăm HTML-ul direct
    if (response.data && response.data.length > 0) {
      res.setHeader('Content-Type', 'text/html; charset=UTF-8');
      res.send(response.data);
    } else {
      // Dacă nu avem date, returnăm eroare
      res.status(500).send('<html><body><h1>Eroare: Netopia nu a returnat date</h1></body></html>');
    }
  } catch (error: any) {
    console.error('Error in redirect endpoint:', error);
    res.status(500).send(`<html><body><h1>Eroare: ${error.message}</h1></body></html>`);
  }
});

/**
 * Creează o plată Netopia folosind metoda oficială (XML criptat)
 * POST /api/payment/netopia/create
 */
router.post('/create', async (req: Request, res: Response) => {
  try {
    const { orderId, amount, customerData } = req.body;

    if (!orderId || !amount) {
      return res.status(400).json({ error: 'Date incomplete: orderId și amount sunt obligatorii' });
    }

    // Verificăm dacă comanda există
    const [orderRows] = await pool.execute(
      'SELECT * FROM orders WHERE id = ?',
      [orderId]
    );
    const orders = orderRows as any[];
    
    if (orders.length === 0) {
      return res.status(404).json({ error: 'Comandă negăsită' });
    }

    const order = orders[0];

    // Generăm un orderId unic pentru Netopia (format: ORD-YYYYMMDD-XXXXXX)
    const date = new Date();
    const dateStr = date.toISOString().split('T')[0].replace(/-/g, '');
    const randomStr = Math.random().toString(36).substring(2, 10).toUpperCase();
    const netopiaOrderId = `ORD-${dateStr}-${randomStr}`;
    
    // Pregătim descrierea comenzii
    const documentTypeNames: Record<string, string> = {
      certificat_beneficiar: 'Certificat Beneficiar',
      furnizare_info: 'Beneficiari Reali',
      certificat_istoric: 'Certificat Beneficiar cu Istoric',
    };
    const documentName = documentTypeNames[order.document_type] || 'Certificat ONRC';
    const orderDescription = `${documentName} - ${netopiaOrderId}`;

    // Verificăm dacă avem configurarea Netopia
    if (!NETOPIA_SIGNATURE) {
      console.error('Netopia configuration missing: NETOPIA_SIGNATURE');
      throw new Error('Netopia configuration incomplete. Please check NETOPIA_SIGNATURE in .env file.');
    }

    // În modul sandbox/test fără cheie publică, simulăm
    let publicKeyPem: string | null = null;
    try {
      if (fs.existsSync(NETOPIA_PUBLIC_KEY_PATH)) {
        publicKeyPem = fs.readFileSync(NETOPIA_PUBLIC_KEY_PATH, 'utf8');
        console.log('✅ Netopia public key loaded from:', NETOPIA_PUBLIC_KEY_PATH);
      } else {
        console.warn('⚠️  Netopia public key not found at:', NETOPIA_PUBLIC_KEY_PATH);
        console.warn('⚠️  Please download the public key from your Netopia account and place it at:', NETOPIA_PUBLIC_KEY_PATH);
        
        // În modul test, simulăm
        if (NETOPIA_SANDBOX) {
          console.log('Using test mode - no Netopia public key configured');
          const mockPaymentUrl = `${NETOPIA_RETURN_URL}?orderId=${netopiaOrderId}&status=success&test=true`;
          
          await pool.execute(
            'UPDATE orders SET payment_intent_id = ? WHERE id = ?',
            [netopiaOrderId, orderId]
          );

          res.json({
            success: true,
            paymentUrl: mockPaymentUrl,
            testMode: true,
            netopiaOrderId,
            message: 'Modul test - descarcă cheia publică Netopia pentru integrare reală',
          });
          return;
        } else {
          throw new Error('Netopia public key is required for production. Please download it from your Netopia account.');
        }
      }
    } catch (keyError: any) {
      console.error('Error loading Netopia public key:', keyError.message);
      if (!NETOPIA_SANDBOX) {
        throw new Error('Netopia public key is required. Please download it from your Netopia account.');
      }
    }

    // Creează XML-ul pentru Netopia
    const xmlData = createNetopiaPaymentXML(
      netopiaOrderId,
      parseFloat(amount.toString()),
      'RON',
      orderDescription,
      {
        email: customerData?.email || order.email,
        firstName: customerData?.firstName || order.first_name || 'Customer',
        lastName: customerData?.lastName || order.last_name || 'Customer',
        phone: customerData?.phone || order.phone || '',
      }
    );

    console.log('Netopia Payment XML:', xmlData);

    // Criptăm XML-ul folosind RSA + AES-256-CBC
    if (!publicKeyPem) {
      throw new Error('Netopia public key is required');
    }

    const encryptedData = encryptNetopiaData(publicKeyPem, xmlData, 'aes-256-cbc');

    console.log('Netopia Encrypted Data:', {
      iv: encryptedData.iv.substring(0, 20) + '...',
      env_key: encryptedData.env_key.substring(0, 20) + '...',
      data: encryptedData.data.substring(0, 50) + '...',
      cipher: encryptedData.cipher,
    });

    // Trimitem POST către Netopia cu datele criptate
    const formData = new URLSearchParams();
    formData.append('env_key', encryptedData.env_key);
    formData.append('data', encryptedData.data);
    formData.append('iv', encryptedData.iv);
    formData.append('cipher', encryptedData.cipher);

    console.log('Sending POST to Netopia:', NETOPIA_PAYMENT_URL);

    try {
      const response = await axios.post(
        NETOPIA_PAYMENT_URL,
        formData.toString(),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          maxRedirects: 0, // Netopia poate returna redirect, nu vrem să urmărim automat
          validateStatus: (status) => status >= 200 && status < 400, // Acceptăm și redirect-uri
        }
      );

      console.log('✅ Netopia Response:', {
        status: response.status,
        headers: response.headers,
        data: typeof response.data === 'string' ? response.data.substring(0, 200) : response.data,
      });
      
      // Logăm HTML-ul complet pentru debugging
      if (typeof response.data === 'string') {
        console.log('Netopia HTML full length:', response.data.length);
        console.log('Netopia HTML contains form:', response.data.includes('<form'));
        console.log('Netopia HTML contains input:', response.data.includes('<input'));
        // Logăm o porțiune mai mare pentru a vedea structura
        console.log('Netopia HTML (first 1000 chars):', response.data.substring(0, 1000));
      }

      // Netopia poate returna:
      // 1. Un URL de redirect (în Location header sau în body)
      // 2. HTML cu form pentru redirect (cel mai comun)
      // 3. JSON cu paymentUrl

      let paymentUrl: string | null = null;

      // Verificăm Location header pentru redirect
      if (response.headers.location) {
        paymentUrl = response.headers.location;
      } else if (typeof response.data === 'string') {
        // Netopia returnează HTML-ul complet al paginii de plată
        // IMPORTANT: Trebuie să returnăm HTML-ul DIRECT către browser, nu JSON
        const htmlData = response.data;
        
        // Actualizăm comanda cu payment intent ID
        await pool.execute(
          'UPDATE orders SET payment_intent_id = ? WHERE id = ?',
          [netopiaOrderId, orderId]
        );

        console.log('✅ Netopia returned HTML checkout page - sending directly to browser');
        
        // Returnăm HTML-ul DIRECT către browser
        // Browser-ul va afișa pagina Netopia unde userul introduce cardul
        res.setHeader('Content-Type', 'text/html; charset=UTF-8');
        res.send(htmlData);
        return;
      } else if (response.data?.paymentUrl || response.data?.url) {
        paymentUrl = response.data.paymentUrl || response.data.url;
      }

      if (paymentUrl) {
        // Actualizăm comanda cu payment intent ID
        await pool.execute(
          'UPDATE orders SET payment_intent_id = ? WHERE id = ?',
          [netopiaOrderId, orderId]
        );

        console.log('✅ Netopia paymentUrl received:', paymentUrl);
        res.json({
          success: true,
          paymentUrl,
          netopiaOrderId,
          requiresRedirect: true,
        });
        return;
      } else {
        console.warn('Netopia response does not contain paymentUrl or HTML');
        res.status(500).json({
          error: 'Netopia nu a returnat un răspuns valid',
          message: 'Verifică configurarea Netopia și încercă din nou',
        });
      }
    } catch (apiError: any) {
      console.error('❌ Netopia API error:', {
        message: apiError.message,
        status: apiError.response?.status,
        statusText: apiError.response?.statusText,
        data: apiError.response?.data,
        url: NETOPIA_PAYMENT_URL,
      });

      // Dacă este o eroare de redirect (301, 302), încercăm să extragem URL-ul
      if (apiError.response?.status >= 300 && apiError.response?.status < 400) {
        const redirectUrl = apiError.response.headers.location;
        if (redirectUrl) {
          await pool.execute(
            'UPDATE orders SET payment_intent_id = ? WHERE id = ?',
            [netopiaOrderId, orderId]
          );

          res.json({
            success: true,
            paymentUrl: redirectUrl,
            netopiaOrderId,
            requiresRedirect: true,
          });
          return;
        }
      }

      throw apiError;
    }
  } catch (error: any) {
    console.error('Error creating Netopia payment:', error);
    res.status(500).json({
      error: 'Eroare la crearea plății Netopia',
      message: error.message,
    });
  }
});

/**
 * Confirmă o plată Netopia (webhook/IPN)
 * POST /api/payment/netopia/confirm
 * 
 * Netopia trimite datele criptate în body, trebuie să le decriptăm
 */
router.post('/confirm', async (req: Request, res: Response) => {
  try {
    console.log('🔵 Netopia confirm webhook called');
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    console.log('Request query:', JSON.stringify(req.query, null, 2));
    console.log('Request headers:', JSON.stringify(req.headers, null, 2));

    // Netopia trimite datele criptate prin POST
    // Trebuie să decriptăm folosind cheia privată
    const { env_key, data, iv, cipher } = req.body;

    console.log('Netopia confirm webhook received:', {
      hasEnvKey: !!env_key,
      hasData: !!data,
      hasIv: !!iv,
      cipher,
    });

    // IMPORTANT: Pentru a decripta, ai nevoie de cheia privată Netopia
    // Aceasta trebuie să fie descărcată din contul tău Netopia
    // și plasată în backend/src/keys/netopia-private.key
    const NETOPIA_PRIVATE_KEY_PATH = process.env.NETOPIA_PRIVATE_KEY_PATH || 
      path.join(__dirname, '..', 'keys', 'netopia-private.key');

    let orderId: string | null = null;
    let status: string | null = null;
    let transactionId: string | null = null;

    // Dacă avem date criptate, le decriptăm
    if (env_key && data && iv && cipher) {
      try {
        // Verificăm dacă cheia privată există
        if (!fs.existsSync(NETOPIA_PRIVATE_KEY_PATH)) {
          console.error('⚠️ Netopia private key not found at:', NETOPIA_PRIVATE_KEY_PATH);
          console.error('⚠️ Please download the private key from your Netopia account and place it at:', NETOPIA_PRIVATE_KEY_PATH);
          return res.status(500).json({ error: 'Eroare: Cheia privată Netopia nu a fost găsită' });
        }

        const privateKeyPem = fs.readFileSync(NETOPIA_PRIVATE_KEY_PATH, 'utf8');
        console.log('✅ Netopia private key loaded from:', NETOPIA_PRIVATE_KEY_PATH);

        // Decriptăm datele
        const decryptedXml = decryptNetopiaData(privateKeyPem, iv, env_key, data, cipher);
        console.log('✅ Decrypted XML from Netopia:', decryptedXml);

        // Parsezăm XML-ul decriptat
        const parser = new Parser({ explicitArray: false, mergeAttrs: true });
        const parsedXml = await parser.parseStringPromise(decryptedXml);
        console.log('✅ Parsed XML:', JSON.stringify(parsedXml, null, 2));

        // Extragem informațiile din XML
        // Netopia trimite structura: { order: { $: { id, ... }, action: 'confirmed', ... } }
        if (parsedXml.order) {
          orderId = parsedXml.order.$?.id || parsedXml.order.id;
          status = parsedXml.order.action || parsedXml.order.status;
          transactionId = parsedXml.order.crc || parsedXml.order.transaction_id || orderId;
        }
      } catch (decryptError: any) {
        console.error('❌ Error decrypting Netopia data:', decryptError);
        return res.status(500).json({ 
          error: 'Eroare la decriptarea datelor Netopia', 
          message: decryptError.message 
        });
      }
    } else {
      // Dacă nu avem date criptate, încercăm să citim direct (pentru testare)
      orderId = req.body.orderId || req.query.orderId || null;
      status = req.body.status || req.query.status || null;
      transactionId = req.body.transactionId || req.query.transactionId || null;
      console.log('⚠️ No encrypted data found, using direct values:', { orderId, status, transactionId });
    }

    console.log('Extracted payment info:', { orderId, status, transactionId });

    if (!orderId || !status) {
      console.error('Netopia confirm: Date incomplete', { orderId, status });
      return res.status(400).json({ error: 'Date incomplete: orderId și status sunt obligatorii' });
    }

    // IMPORTANT: Netopia poate trimite orderId în două formate:
    // 1. ID-ul comenzii din baza noastră de date (număr, ex: 22) - în modul test
    // 2. netopiaOrderId (string, ex: ORD-20260112-XXXXXX) - în modul real
    // Trebuie să căutăm în ambele moduri

    let orders: any[] = [];
    let order: any = null;

    // Verificăm dacă orderId este un număr (ID-ul comenzii) sau un string (netopiaOrderId)
    const numericOrderId = typeof orderId === 'string' ? parseInt(orderId, 10) : orderId;
    const isNumeric = !isNaN(numericOrderId) && numericOrderId.toString() === orderId.toString();

    console.log(`Netopia confirm: Searching for orderId=${orderId}, isNumeric=${isNumeric}`);

    // Dacă orderId este un număr, căutăm direct după ID-ul comenzii
    if (isNumeric) {
      const [orderRows] = await pool.execute(
        'SELECT * FROM orders WHERE id = ?',
        [numericOrderId]
      );
      orders = orderRows as any[];
      console.log(`✅ Searching by order ID: ${numericOrderId}, found: ${orders.length}`);
    }

    // Dacă nu găsim sau dacă orderId este un string (netopiaOrderId), căutăm după payment_intent_id
    if (orders.length === 0) {
      const [orderRows] = await pool.execute(
        'SELECT * FROM orders WHERE payment_intent_id = ?',
        [orderId.toString()]
      );
      orders = orderRows as any[];
      console.log(`✅ Searching by payment_intent_id: ${orderId}, found: ${orders.length}`);
    }

    if (orders.length === 0) {
      // Logăm toate comenzile recente pentru debugging
      const [allOrders] = await pool.execute(
        'SELECT id, payment_intent_id, status, created_at FROM orders ORDER BY id DESC LIMIT 10'
      );
      console.error(`❌ Netopia confirm: Order not found for orderId ${orderId}`);
      console.error('Recent orders:', allOrders);
      return res.status(404).json({ 
        error: 'Comandă negăsită',
        orderId,
        message: `Nu s-a găsit comanda cu ID=${orderId} sau payment_intent_id=${orderId}`
      });
    }

    order = orders[0];
    console.log(`✅ Found order: ID=${order.id}, payment_intent_id=${order.payment_intent_id}, status=${order.status}`);

    if (status === 'confirmed' || status === 'paid' || status === 'success' || status === '1') {
      // Marchează comanda ca plătită
      await pool.execute(
        "UPDATE orders SET status = 'paid', payment_intent_id = ? WHERE id = ?",
        [transactionId || orderId, order.id]
      );

      // Verificăm dacă plata există deja pentru a evita duplicarea
      const [existingPaymentRows] = await pool.execute(
        'SELECT id FROM payments WHERE transaction_id = ?',
        [transactionId || orderId]
      );
      const existingPayments = existingPaymentRows as any[];

      if (existingPayments.length === 0) {
        // Obținem suma din comandă pentru a o salva în payments
        // Funcție pentru calcularea prețului în funcție de tipul documentului și extractType
        const getDocumentPrice = (docType: string, extractType?: string | null): number => {
          if (docType === 'certificat_beneficiar') {
            return 88;
          }
          if (docType === 'furnizare_info') {
            // Dacă este selectat "Raport istoric", prețul este 247 lei, altfel 165 lei
            if (extractType === 'raport_istoric') {
              return 247;
            }
            return 165;
          }
          if (docType === 'certificat_istoric') {
            return 399;
          }
          return 0;
        };
        const orderAmount = getDocumentPrice(order.document_type, order.extract_type);
        const amountWithVAT = Math.round(orderAmount * 1.19 * 100) / 100;

        await pool.execute(
          `INSERT INTO payments (order_id, amount, currency, payment_method, transaction_id, status)
           VALUES (?, ?, 'RON', 'netopia_card', ?, 'completed')`,
          [order.id, amountWithVAT, transactionId || orderId]
        );
      }

      console.log(`✅ Netopia confirm: Order ${order.id} marked as paid`);

      // Aici ar trebui să generăm certificatul
      // await axios.post(`/api/certificate/generate/${order.id}`);

      res.json({ success: true, message: 'Plată confirmată și înregistrată' });
    } else {
      await pool.execute(
        "UPDATE orders SET status = 'failed' WHERE id = ?",
        [order.id]
      );
      res.status(400).json({ success: false, message: `Plată eșuată: ${status}` });
    }
  } catch (error: any) {
    console.error('Error confirming Netopia payment:', error);
    res.status(500).json({ error: 'Eroare la confirmarea plății Netopia', message: error.message });
  }
});

/**
 * Verifică statusul unei plăți
 * GET /api/payment/netopia/status/:orderId
 * 
 * orderId poate fi:
 * - ID-ul numeric al comenzii (ex: 31)
 * - netopiaOrderId (ex: ORD-20260112-YOKMOQOZ) salvat în payment_intent_id
 */
router.get('/status/:orderId', async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;

    console.log('🔵 Checking payment status for orderId:', orderId);

    // Verificăm dacă orderId este un număr (ID-ul comenzii) sau un string (netopiaOrderId)
    const numericOrderId = typeof orderId === 'string' ? parseInt(orderId, 10) : orderId;
    const isNumeric = !isNaN(numericOrderId) && numericOrderId.toString() === orderId.toString();

    let orders: any[] = [];
    let order: any = null;

    // Dacă orderId este un număr, căutăm direct după ID-ul comenzii
    if (isNumeric) {
      const [orderRows] = await pool.execute(
        'SELECT * FROM orders WHERE id = ?',
        [numericOrderId]
      );
      orders = orderRows as any[];
      console.log(`✅ Searching by order ID: ${numericOrderId}, found: ${orders.length}`);
    }

    // Dacă nu găsim sau dacă orderId este un string (netopiaOrderId), căutăm după payment_intent_id
    if (orders.length === 0) {
      const [orderRows] = await pool.execute(
        'SELECT * FROM orders WHERE payment_intent_id = ?',
        [orderId.toString()]
      );
      orders = orderRows as any[];
      console.log(`✅ Searching by payment_intent_id: ${orderId}, found: ${orders.length}`);
    }

    if (orders.length === 0) {
      // Logăm toate comenzile recente pentru debugging
      const [allOrders] = await pool.execute(
        'SELECT id, payment_intent_id, status, created_at FROM orders ORDER BY id DESC LIMIT 10'
      );
      console.error(`❌ Order not found for orderId ${orderId}`);
      console.error('Recent orders:', allOrders);
      return res.status(404).json({ 
        error: 'Comandă negăsită',
        orderId,
        message: `Nu s-a găsit comanda cu ID=${orderId} sau payment_intent_id=${orderId}`
      });
    }

    order = orders[0];
    console.log(`✅ Found order: ID=${order.id}, payment_intent_id=${order.payment_intent_id}, status=${order.status}`);

    // Obținem detaliile plății dacă există
    const [paymentRows] = await pool.execute(
      'SELECT * FROM payments WHERE order_id = ? ORDER BY id DESC LIMIT 1',
      [order.id]
    );
    const payments = paymentRows as any[];
    const payment = payments.length > 0 ? payments[0] : null;

    // Calculăm suma pentru afișare
    const orderAmount = getDocumentPrice(order.document_type, order.extract_type);
    const amountWithVAT = Math.round(orderAmount * 1.19 * 100) / 100;

    // Pregătim răspunsul cu toate detaliile
    res.json({
      success: true,
      orderId: order.id,
      netopiaOrderId: order.payment_intent_id,
      status: order.status,
      paymentIntentId: order.payment_intent_id,
      // Detalii comandă
      order: {
        id: order.id,
        companyName: order.company_name,
        documentType: order.document_type,
        email: order.email,
        firstName: order.first_name,
        lastName: order.last_name,
        phone: order.phone,
        createdAt: order.created_at,
      },
      // Detalii plată
      payment: payment ? {
        id: payment.id,
        amount: parseFloat(payment.amount),
        currency: payment.currency,
        paymentMethod: payment.payment_method,
        transactionId: payment.transaction_id,
        status: payment.status,
        createdAt: payment.created_at,
      } : null,
      // Sumă calculată
      amount: amountWithVAT,
      currency: 'RON',
    });
  } catch (error: any) {
    console.error('Error checking payment status:', error);
    res.status(500).json({
      error: 'Eroare la verificarea statusului plății',
      message: error.message,
    });
  }
});

/**
 * Endpoint manual pentru a marca o comandă ca plătită (PENTRU TESTARE)
 * POST /api/payment/netopia/manual-confirm/:orderId
 * 
 * Acest endpoint este util când webhook-ul Netopia nu poate fi apelat (ex: localhost)
 * Poți apela manual acest endpoint după ce verifici în Netopia Dashboard că plata a reușit
 */
router.post('/manual-confirm/:orderId', async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;
    const { transactionId } = req.body; // Opțional: ID-ul tranzacției de la Netopia

    console.log('🔵 Manual confirm endpoint called for orderId:', orderId);

    // Căutăm comanda după ID numeric sau payment_intent_id
    const numericOrderId = typeof orderId === 'string' ? parseInt(orderId, 10) : orderId;
    const isNumeric = !isNaN(numericOrderId) && numericOrderId.toString() === orderId.toString();

    let orders: any[] = [];
    
    if (isNumeric) {
      const [orderRows] = await pool.execute(
        'SELECT * FROM orders WHERE id = ?',
        [numericOrderId]
      );
      orders = orderRows as any[];
    }

    if (orders.length === 0) {
      const [orderRows] = await pool.execute(
        'SELECT * FROM orders WHERE payment_intent_id = ?',
        [orderId.toString()]
      );
      orders = orderRows as any[];
    }

    if (orders.length === 0) {
      return res.status(404).json({ 
        error: 'Comandă negăsită',
        orderId,
      });
    }

    const order = orders[0];

    // Verificăm dacă comanda este deja plătită
    if (order.status === 'paid') {
      return res.json({
        success: true,
        message: 'Comanda este deja marcată ca plătită',
        orderId: order.id,
        status: order.status,
      });
    }

    // Marchează comanda ca plătită
    const finalTransactionId = transactionId || order.payment_intent_id || orderId.toString();
    
    await pool.execute(
      "UPDATE orders SET status = 'paid', payment_intent_id = ? WHERE id = ?",
      [finalTransactionId, order.id]
    );

    // Verificăm dacă plata există deja
    const [existingPaymentRows] = await pool.execute(
      'SELECT id FROM payments WHERE transaction_id = ?',
      [finalTransactionId]
    );
    const existingPayments = existingPaymentRows as any[];

    if (existingPayments.length === 0) {
      // Calculăm suma
      const orderAmount = getDocumentPrice(order.document_type, order.extract_type);
      const amountWithVAT = Math.round(orderAmount * 1.19 * 100) / 100;

      // Creăm înregistrarea în payments
      await pool.execute(
        `INSERT INTO payments (order_id, amount, currency, payment_method, transaction_id, status)
         VALUES (?, ?, 'RON', 'netopia_card', ?, 'completed')`,
        [order.id, amountWithVAT, finalTransactionId]
      );
    }

    console.log(`✅ Manual confirm: Order ${order.id} marked as paid`);

    res.json({
      success: true,
      message: 'Comandă marcată ca plătită cu succes',
      orderId: order.id,
      netopiaOrderId: order.payment_intent_id,
      transactionId: finalTransactionId,
      status: 'paid',
    });
  } catch (error: any) {
    console.error('Error in manual confirm:', error);
    res.status(500).json({
      error: 'Eroare la marcarea comenzii ca plătită',
      message: error.message,
    });
  }
});

export { router as netopiaPayment };
