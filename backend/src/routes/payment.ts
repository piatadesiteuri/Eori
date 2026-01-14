import { Router, Request, Response } from 'express';
import Stripe from 'stripe';
import pool from '../db/connection.js';
import dotenv from 'dotenv';

dotenv.config();

const router = Router();

// Stripe în modul test (sandbox)
// În modul test, simulăm plata fără Stripe real
const stripe = process.env.STRIPE_SECRET_KEY && process.env.STRIPE_SECRET_KEY !== 'sk_test_...' 
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2023-10-16',
    })
  : null;

router.post('/create-intent', async (req: Request, res: Response) => {
  try {
    const { orderId, amount } = req.body;

    if (!orderId || !amount) {
      return res.status(400).json({ error: 'Date incomplete' });
    }

    // În modul test, simulăm payment intent fără Stripe real
    if (!stripe) {
      // Simulăm un payment intent ID
      const mockPaymentIntentId = `pi_test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Actualizăm comanda cu payment intent ID
      await pool.execute(
        'UPDATE orders SET payment_intent_id = ? WHERE id = ?',
        [mockPaymentIntentId, orderId]
      );

      res.json({
        success: true,
        clientSecret: `pi_test_${mockPaymentIntentId}_secret`,
        paymentIntentId: mockPaymentIntentId,
      });
      return;
    }

    // Creăm Payment Intent în Stripe (modul producție)
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Stripe folosește cenți
      currency: 'ron',
      metadata: {
        orderId: orderId.toString(),
      },
    });

    // Actualizăm comanda cu payment intent ID
    await pool.execute(
      'UPDATE orders SET payment_intent_id = ? WHERE id = ?',
      [paymentIntent.id, orderId]
    );

    res.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error: any) {
    console.error('Error creating payment intent:', error);
    res.status(500).json({
      error: 'Eroare la crearea plății',
      message: error.message,
    });
  }
});

router.post('/confirm', async (req: Request, res: Response) => {
  try {
    const { paymentIntentId, orderId } = req.body;

    if (!paymentIntentId || !orderId) {
      return res.status(400).json({ error: 'Date incomplete' });
    }

    // În modul test, simulăm confirmarea plății fără Stripe real
    if (!stripe) {
      // Obținem suma din comandă
      const [orderRows] = await pool.execute(
        'SELECT * FROM orders WHERE id = ?',
        [orderId]
      );
      const orders = orderRows as any[];
      
      if (orders.length === 0) {
        return res.status(404).json({ error: 'Comandă negăsită' });
      }

      const order = orders[0];
      
      // Funcție helper pentru calcularea prețului
      const getDocumentPrice = (docType: string, extractType?: string | null): number => {
        if (docType === 'certificat_beneficiar') {
          return 88;
        }
        if (docType === 'furnizare_info') {
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
      
      // Calculăm suma
      const amount = getDocumentPrice(order.document_type, order.extract_type);
      const amountWithVAT = Math.round(amount * 1.19 * 100) / 100;

      // Actualizăm comanda ca fiind plătită
      await pool.execute(
        "UPDATE orders SET status = 'paid' WHERE id = ?",
        [orderId]
      );

      // Creăm înregistrare în tabelul payments
      await pool.execute(
        `INSERT INTO payments (order_id, amount, currency, payment_method, transaction_id, status)
         VALUES (?, ?, 'RON', 'card', ?, 'completed')`,
        [
          orderId,
          amountWithVAT,
          paymentIntentId,
        ]
      );

      res.json({
        success: true,
        message: 'Plată confirmată',
      });
      return;
    }

    // Verificăm statusul plății în Stripe (modul producție)
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status === 'succeeded') {
      // Actualizăm comanda ca fiind plătită
      await pool.execute(
        "UPDATE orders SET status = 'paid' WHERE id = ?",
        [orderId]
      );

      // Creăm înregistrare în tabelul payments
      await pool.execute(
        `INSERT INTO payments (order_id, amount, currency, payment_method, transaction_id, status)
         VALUES (?, ?, 'RON', 'card', ?, 'completed')`,
        [
          orderId,
          paymentIntent.amount / 100,
          paymentIntentId,
        ]
      );

      res.json({
        success: true,
        message: 'Plată confirmată',
      });
    } else {
      res.status(400).json({
        error: 'Plata nu a fost finalizată',
        status: paymentIntent.status,
      });
    }
  } catch (error: any) {
    console.error('Error confirming payment:', error);
    res.status(500).json({
      error: 'Eroare la confirmarea plății',
      message: error.message,
    });
  }
});

export { router as payment };

