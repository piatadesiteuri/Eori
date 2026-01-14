# Beneficiar App

Aplicație web pentru eliberarea certificatelor de beneficiar real, similară cu constatator-online.ro.

## Tehnologii

- **Frontend**: React 18 + TypeScript + Tailwind CSS + Vite
- **Backend**: Node.js + Express + TypeScript
- **Database**: MySQL
- **Payment**: Stripe (modul test/sandbox)
- **PDF Generation**: PDFKit (generare mock pentru testare)

## Structura Proiectului

```
beneficiar-app/
├── frontend/          # Aplicația React
├── backend/           # API Node.js/Express
├── package.json       # Scripturi pentru rulare
└── README.md
```

## Instalare

1. **Instalează dependențele:**
```bash
npm run install:all
```

2. **Configurează baza de date MySQL:**
```bash
# Conectează-te la MySQL și rulează schema
mysql -u root -p < backend/src/db/schema.sql
```

3. **Configurează variabilele de mediu:**
```bash
# Backend
cp backend/.env.example backend/.env
# Editează backend/.env cu datele tale
```

4. **Pornește aplicația:**
```bash
npm run dev
```

Aplicația va rula pe:
- Frontend: http://localhost:4000
- Backend: http://localhost:6000

## Funcționalități

### Modul Sandbox (Test)

1. **Căutare CUI**: Folosește API-ul gratuit ANAF pentru căutare firme
2. **Plată**: Stripe în modul test (nu debitează bani reali)
3. **Generare certificat**: Generează PDF MOCK (document de testare)

### Fluxul Comenzii

1. Căutare firmă după CUI
2. Selectare tip document
3. Completare date facturare
4. Plată (simulată în test)
5. Generare și trimitere certificat pe email

## Configurare Stripe Test

Pentru a testa plățile, folosește cheile de test de la Stripe:
- Obține chei de test de pe: https://dashboard.stripe.com/test/apikeys
- Adaugă-le în `backend/.env`:
  ```
  STRIPE_SECRET_KEY=sk_test_...
  STRIPE_PUBLISHABLE_KEY=pk_test_...
  ```

## Configurare Email

Pentru trimiterea email-urilor, configurează SMTP în `backend/.env`:
```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
```

## Notă Importantă

Această aplicație este configurată pentru **testare**. Certificatul generat este un **MOCK** și nu are valoare legală. Pentru producție, va trebui să integrezi API-ul real de la ONRC.

## Dezvoltare

- Frontend: `npm run dev:frontend`
- Backend: `npm run dev:backend`
- Ambele: `npm run dev`

