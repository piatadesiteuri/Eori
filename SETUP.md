# Ghid de Setup - Beneficiar App

## Pași de instalare

### 1. Instalare dependențe

```bash
# Instalează toate dependențele
npm run install:all
```

### 2. Configurare MySQL

1. Asigură-te că ai MySQL instalat și pornit
2. Conectează-te la MySQL:
```bash
mysql -u root -p
```

3. Rulează schema bazei de date:
```bash
mysql -u root -p < backend/src/db/schema.sql
```

Sau copiază conținutul din `backend/src/db/schema.sql` și rulează-l în MySQL.

### 3. Configurare variabile de mediu

Creează fișierul `backend/.env`:

```bash
cd backend
cp .env.example .env
```

Editează `backend/.env` cu datele tale:

```env
# Database
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=eori_cod

# Server
PORT=6000

# Stripe (Test Mode)
# Obține chei de test de la: https://dashboard.stripe.com/test/apikeys
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...

# Email (opțional pentru testare)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
```

### 4. Configurare Stripe (Test Mode)

1. Creează cont pe https://stripe.com
2. Accesează Dashboard → Developers → API keys
3. Copiază cheile de test (Test mode keys)
4. Adaugă-le în `backend/.env`

**Notă**: În modul test, plățile sunt simulate și nu debitează bani reali.

### 5. Configurare Email (Opțional)

Pentru trimiterea email-urilor cu certificatul:

1. Pentru Gmail:
   - Activează "App Passwords" în contul Google
   - Generează o parolă de aplicație
   - Folosește-o în `SMTP_PASS`

2. Alternativ, poți folosi un serviciu SMTP gratuit (SendGrid, Mailgun, etc.)

**Notă**: Dacă nu configurezi email-ul, certificatul va fi generat dar nu va fi trimis automat.

### 6. Pornire aplicație

```bash
# Pornește frontend și backend simultan
npm run dev
```

Aplicația va fi disponibilă pe:
- **Frontend**: http://localhost:4000
- **Backend API**: http://localhost:6000

### 7. Testare

1. Deschide http://localhost:4000
2. Navighează la "Comandă"
3. Introdu un CUI valid (ex: 12345678)
4. Completează formularul
5. Finalizează plata (simulată în test mode)
6. Certificatul MOCK va fi generat și salvat în `backend/certificates/`

## Structura Fluxului

1. **Căutare CUI**: Folosește API-ul gratuit ANAF
2. **Selectare document**: Alege tipul de certificat
3. **Date facturare**: Completează informațiile
4. **Plată**: Stripe în modul test (simulat)
5. **Generare certificat**: PDF MOCK generat automat
6. **Email**: Trimis automat (dacă SMTP este configurat)

## Notă Importantă

Această aplicație este configurată pentru **TESTARE**:
- Plățile sunt simulate (nu se debitează bani reali)
- Certificatul generat este un **MOCK** (nu are valoare legală)
- Pentru producție, va trebui să integrezi API-ul real de la ONRC

## Troubleshooting

### Eroare la conectarea la MySQL
- Verifică că MySQL este pornit
- Verifică credențialele în `.env`
- Asigură-te că baza de date `eori_cod` există

### Eroare la căutare CUI
- Verifică conexiunea la internet
- API-ul ANAF poate fi temporar indisponibil
- Verifică că CUI-ul introdus este valid

### Certificatul nu se generează
- Verifică că comanda este în status "paid"
- Verifică permisiunile pentru folderul `backend/certificates/`
- Verifică logurile din consolă pentru erori

