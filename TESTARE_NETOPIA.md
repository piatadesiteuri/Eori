# 🧪 Ghid de Testare Netopia Payments

## ⚠️ Probleme Identificate

### 1. **Webhook-ul nu este accesibil public**
Netopia nu poate trimite webhook-uri către `localhost:6000`. Trebuie să folosești un serviciu de tunneling (ngrok, localtunnel, etc.).

### 2. **Cheia privată lipsește**
Pentru a decripta datele primite de la Netopia, ai nevoie de cheia privată (`netopia-private.key`).

---

## 📋 Pași pentru Testare

### Pasul 1: Instalează ngrok (pentru webhook public)

```bash
# macOS
brew install ngrok

# Sau descarcă de la: https://ngrok.com/download
```

### Pasul 2: Pornește ngrok

```bash
# Într-un terminal separat, rulează:
ngrok http 6000
```

Vei primi un URL de genul: `https://abc123.ngrok.io`

### Pasul 3: Actualizează CONFIRM_URL în `.env`

```env
NETOPIA_CONFIRM_URL=https://abc123.ngrok.io/api/payment/netopia/confirm
```

**IMPORTANT:** Actualizează și în contul Netopia Sandbox:
- Mergi la **Setări → Puncte de vânzare → Confirm URL**
- Setează: `https://abc123.ngrok.io/api/payment/netopia/confirm`

### Pasul 4: Descarcă cheia privată Netopia

1. Accesează [Netopia Sandbox Dashboard](https://admin.sandbox.netopia-payments.com/)
2. Mergi la **Setări → Chei de criptare**
3. Descarcă **Cheia privată** (`.key` sau `.pem`)
4. Plasează-o în: `backend/src/keys/netopia-private.key`

### Pasul 5: Repornește backend-ul

```bash
cd backend
npm run dev
```

---

## 💳 Carduri de Test Netopia Sandbox

Netopia Sandbox acceptă orice card pentru testare, dar pentru a simula diferite scenarii:

### ✅ Carduri care funcționează (plata reușește):
- **Orice număr de card** (ex: `4242 4242 4242 4242`)
- **Orice CVV** (ex: `123`)
- **Orice dată de expirare** viitoare (ex: `12/25`)

### ❌ Pentru a simula erori:
- **Card expirat**: Data de expirare în trecut
- **Fonduri insuficiente**: Netopia va returna eroare automat în sandbox

---

## 🔍 Verificare Webhook

### Verifică dacă webhook-ul este apelat:

1. **În terminalul backend**, vei vedea:
```
🔵 Netopia confirm webhook called
Request body: { ... }
✅ Decrypted XML from Netopia: ...
✅ Parsed XML: { ... }
✅ Found order: ID=31, payment_intent_id=ORD-20260112-XXXXX, status=pending
✅ Netopia confirm: Order 31 marked as paid
```

2. **În Netopia Sandbox Dashboard**:
   - Mergi la **Tranzacții**
   - Vei vedea statusul: **PLĂTITĂ** (verde) sau **RESPINSĂ** (roșu)

### Dacă webhook-ul nu este apelat:

1. **Verifică ngrok**:
   ```bash
   # Verifică dacă ngrok rulează
   curl http://localhost:4040/api/tunnels
   ```

2. **Verifică CONFIRM_URL în Netopia**:
   - Asigură-te că URL-ul este setat corect în dashboard
   - URL-ul trebuie să fie **HTTPS** (ngrok oferă HTTPS automat)

3. **Verifică firewall-ul**:
   - Asigură-te că portul 6000 este deschis

---

## 🐛 Debugging

### Verifică logurile backend:

```bash
# Urmărește logurile în timp real
cd backend
npm run dev
```

### Verifică dacă cheia privată este corectă:

```bash
# Verifică dacă fișierul există
ls -la backend/src/keys/netopia-private.key

# Verifică formatul (ar trebui să înceapă cu "-----BEGIN RSA PRIVATE KEY-----")
head -1 backend/src/keys/netopia-private.key
```

### Testează webhook-ul manual:

```bash
# Simulează un webhook de la Netopia
curl -X POST http://localhost:6000/api/payment/netopia/confirm \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": "ORD-20260112-TEST",
    "status": "confirmed",
    "transactionId": "TEST-123"
  }'
```

---

## ✅ Checklist Testare

- [ ] ngrok rulează și oferă URL HTTPS
- [ ] CONFIRM_URL este setat corect în `.env` și în Netopia Dashboard
- [ ] Cheia privată (`netopia-private.key`) este în `backend/src/keys/`
- [ ] Backend-ul rulează și loghează webhook-urile
- [ ] Testezi cu un card în Netopia Sandbox
- [ ] Webhook-ul este apelat (vezi loguri backend)
- [ ] Comanda este marcată ca "paid" în baza de date
- [ ] Tranzacția apare ca "PLĂTITĂ" în Netopia Dashboard

---

## 📞 Suport

Dacă întâmpini probleme:

1. **Verifică logurile backend** pentru erori
2. **Verifică Netopia Dashboard** pentru statusul tranzacției
3. **Verifică ngrok** pentru a vedea request-urile primite
4. **Contactează Netopia Support**: `implementare@netopia.ro`

---

## 🔗 Link-uri Utile

- [Netopia Sandbox Dashboard](https://admin.sandbox.netopia-payments.com/)
- [Netopia Documentation](https://doc.netopia-payments.com/)
- [ngrok Documentation](https://ngrok.com/docs)

