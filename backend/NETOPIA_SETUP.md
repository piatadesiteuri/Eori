# Netopia Payments - Setup Instructions

## Configurare Netopia

### 1. Variabile de mediu (.env)

Adaugă în `backend/.env`:

```env
NETOPIA_SIGNATURE=2YJA-IRJF-R24S-MMKJ-OVLF
NETOPIA_SANDBOX=true
NETOPIA_RETURN_URL=http://localhost:4000/plata/success
NETOPIA_CONFIRM_URL=http://localhost:6000/api/payment/netopia/confirm
```

### 2. Cheia publică Netopia

**IMPORTANT:** Pentru integrarea reală, trebuie să descarci cheia publică Netopia din contul tău Netopia.

#### Cum să obții cheia publică:

1. Loghează-te în contul tău Netopia (sandbox sau live)
2. Navighează la secțiunea **"Securitate"** sau **"API Keys"**
3. Descarcă cheia publică Netopia (format `.cer` sau `.pem`)
4. Plasează fișierul în: `backend/src/keys/netopia-public.cer`

Sau setează calea în `.env`:
```env
NETOPIA_PUBLIC_KEY_PATH=/path/to/netopia-public.cer
```

### 3. Cheia privată Netopia (pentru decriptare IPN)

Pentru a decripta notificările IPN de la Netopia, ai nevoie și de cheia privată:

1. Descarcă cheia privată din contul tău Netopia
2. Plasează fișierul în: `backend/src/keys/netopia-private.key`

Sau setează calea în `.env`:
```env
NETOPIA_PRIVATE_KEY_PATH=/path/to/netopia-private.key
```

### 4. Structura directoarelor

```
backend/
├── src/
│   ├── keys/
│   │   ├── netopia-public.cer  ← Cheia publică Netopia
│   │   └── netopia-private.key ← Cheia privată Netopia (pentru IPN)
│   └── routes/
│       └── netopia.ts
└── .env
```

## Testare

### Modul Test (fără cheie publică)

Dacă nu ai încă cheia publică, aplicația va funcționa în modul test și va simula plățile.

### Modul Real

1. Descarcă cheia publică Netopia
2. Plasează-o în `backend/src/keys/netopia-public.cer`
3. Repornește backend-ul
4. Testează o plată

## URL-uri Netopia

- **Sandbox:** `https://sandboxsecure.mobilpay.ro`
- **Live:** `https://secure.mobilpay.ro`

## Fluxul de plată

1. **Clientul** completează formularul și apasă "Plătește"
2. **Backend-ul** creează XML-ul de plată și îl criptează (RSA + AES-256-CBC)
3. **Backend-ul** trimite POST către Netopia cu datele criptate
4. **Netopia** returnează un URL de redirect
5. **Clientul** este redirecționat către Netopia pentru a introduce cardul
6. **Netopia** procesează plata și redirecționează înapoi la `RETURN_URL`
7. **Netopia** trimite notificare IPN la `CONFIRM_URL` (webhook)

## Debugging

Verifică log-urile backend-ului pentru:
- XML-ul generat
- Datele criptate
- Răspunsul de la Netopia
- Erori de criptare/decriptare

## Suport

Pentru probleme cu Netopia, consultă:
- Documentația oficială: https://doc.netopia-payments.com
- Suport Netopia: support@netopia-payments.com

