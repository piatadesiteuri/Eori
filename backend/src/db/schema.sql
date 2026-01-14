-- Database schema for Eori Cod App
-- Script pentru crearea bazei de date și tabelelor

-- Creează baza de date (dacă nu există deja)
CREATE DATABASE IF NOT EXISTS eori_cod;
USE eori_cod;

-- Tabel pentru comenzi
CREATE TABLE IF NOT EXISTS orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  cui VARCHAR(20) NOT NULL COMMENT 'CUI-ul firmei pentru care se solicită certificatul',
  company_name VARCHAR(255) NOT NULL COMMENT 'Numele firmei',
  document_type VARCHAR(50) NOT NULL COMMENT 'Tipul documentului: certificat_beneficiar, furnizare_info, certificat_istoric',
  document_purpose VARCHAR(100) NULL COMMENT 'Scopul certificatului (pentru certificat_beneficiar)',
  extract_type VARCHAR(50) NULL COMMENT 'Tipul de extras (pentru furnizare_info)',
  billing_type VARCHAR(50) NOT NULL COMMENT 'Tipul de facturare: company, other_company, individual',
  billing_cui VARCHAR(20) NULL COMMENT 'CUI-ul firmei de facturare (dacă este altă firmă)',
  billing_name VARCHAR(255) NOT NULL COMMENT 'Numele pentru facturare',
  billing_address TEXT NULL COMMENT 'Adresa de facturare',
  billing_company_registration VARCHAR(50) NULL COMMENT 'Număr de înregistrare la Registrul Comerțului pentru facturare',
  first_name VARCHAR(100) NULL COMMENT 'Prenume (pentru persoană fizică)',
  last_name VARCHAR(100) NULL COMMENT 'Nume (pentru persoană fizică)',
  email VARCHAR(255) NOT NULL COMMENT 'Email pentru contact și livrare certificat',
  phone VARCHAR(20) NULL COMMENT 'Telefon de contact',
  status ENUM('pending', 'paid', 'processing', 'completed', 'failed') DEFAULT 'pending' COMMENT 'Statusul comenzii',
  payment_intent_id VARCHAR(255) NULL COMMENT 'ID-ul payment intent de la Stripe',
  certificate_path VARCHAR(500) NULL COMMENT 'Calea către certificatul generat',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Data și ora creării comenzii',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Data și ora ultimei actualizări',
  INDEX idx_cui (cui),
  INDEX idx_status (status),
  INDEX idx_email (email),
  INDEX idx_billing_cui (billing_cui),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabel pentru tranzacții de plată
CREATE TABLE IF NOT EXISTS payments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL COMMENT 'ID-ul comenzii asociate',
  amount DECIMAL(10, 2) NOT NULL COMMENT 'Suma plătită',
  currency VARCHAR(3) DEFAULT 'RON' COMMENT 'Moneda (RON)',
  payment_method VARCHAR(50) NULL COMMENT 'Metoda de plată: card, google_pay, etc.',
  transaction_id VARCHAR(255) NULL COMMENT 'ID-ul tranzacției de la procesatorul de plăți',
  status ENUM('pending', 'completed', 'failed', 'refunded') DEFAULT 'pending' COMMENT 'Statusul plății',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Data și ora creării plății',
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  INDEX idx_order_id (order_id),
  INDEX idx_status (status),
  INDEX idx_transaction_id (transaction_id),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Verificare că tabelele au fost create
SHOW TABLES;
