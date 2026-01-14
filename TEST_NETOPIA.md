# 🧪 Testare Integrare Netopia

## ✅ Verificare Configurare

### 1. Verifică că fișierul .env există
```bash
cd backend
ls -la | grep .env
```

Ar trebui să vezi: `.env`

### 2. Verifică conținutul .env
Asigură-te că ai:
- ✅ `NETOPIA_SIGNATURE=2YJA-IRJF-R24S-MMKJ-OVLF`
- ✅ `NETOPIA_API_KEY=bb0cyXogcUfBeTldkASF00Kjay7cMAJD9KAF0NP0M8cxfGGuqVJpoR9sgefm`
- ✅ `NETOPIA_SANDBOX=true`

## 🚀 Pași pentru Testare

### Pasul 1: Pornește Backend-ul

```bash
cd backend
npm run dev
```

Ar trebui să vezi:
```
🚀 Server running on port 6000
```

### Pasul 2: Pornește Frontend-ul

În alt terminal:
```bash
cd frontend
npm run dev
```

Ar trebui să vezi:
```
VITE v... ready in ... ms
➜  Local:   http://localhost:4000/
```

### Pasul 3: Testează o Comandă

1. Deschide browserul la `http://localhost:4000`
2. Completează formularul de comandă:
   - Pasul 1: Introdu un CUI valid (ex: 12345678)
   - Pasul 2: Alege un document
   - Pasul 3: Completează datele de facturare
   - Pasul 4: Completează datele de contact
   - Pasul 5: Click pe "Plătește"

### Pasul 4: Verifică Redirect-ul către Netopia

După click pe "Plătește", ar trebui să:
- ✅ Vezi un mesaj de loading
- ✅ Fii redirecționat către Netopia Sandbox
- ✅ Vezi pagina Netopia pentru completare plată

### Pasul 5: Completează Plata cu Card de Test

Pe pagina Netopia:
- **Card Number**: `4111111111111111`
- **CVV**: `123`
- **Expirare**: `12/25` (sau orice dată viitoare)
- **Nume titular**: Orice nume

### Pasul 6: Verifică Return URL

După plată, ar trebui să:
- ✅ Fii redirecționat înapoi la `http://localhost:4000/plata/success`
- ✅ Vezi mesajul "Plată finalizată cu succes!"
- ✅ Comanda să fie marcată ca "paid" în baza de date

## 🔍 Debugging

### Verifică Logs Backend

În terminalul backend, ar trebui să vezi:
```
Error initializing Netopia payment: ...  ← Dacă apare eroare
```

### Verifică Status Comandă

```bash
curl http://localhost:6000/api/payment/netopia/status/ORDER_ID
```

### Testează Manual Inițierea Plății

```bash
curl -X POST http://localhost:6000/api/payment/netopia/init \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": 1,
    "amount": 104.72,
    "customerData": {
      "email": "test@example.com",
      "firstName": "Test",
      "lastName": "User"
    }
  }'
```

Ar trebui să returneze:
```json
{
  "success": true,
  "paymentUrl": "https://sandbox.netopia-payments.com/...",
  "testMode": true,
  "orderId": 1
}
```

## ⚠️ Probleme Comune

### 1. "Hash invalid"
- **Cauză**: Signature incorect
- **Soluție**: Verifică că `NETOPIA_SIGNATURE` este corect în `.env`

### 2. "Redirect nu funcționează"
- **Cauză**: Backend nu pornește sau URL-uri incorecte
- **Soluție**: Verifică că backend-ul rulează pe port 6000

### 3. "Notificarea nu ajunge"
- **Cauză**: Webhook Netopia nu poate ajunge la localhost
- **Soluție**: Pentru testare locală, folosește ngrok sau testează manual confirmarea

## 📝 Notă Importantă

Pentru ca webhook-ul Netopia să funcționeze în testare locală, serverul trebuie să fie accesibil public. Folosește [ngrok](https://ngrok.com/):

```bash
# Instalează ngrok
brew install ngrok  # Mac
# sau descarcă de pe https://ngrok.com/

# Expune serverul
ngrok http 6000

# Copiază URL-ul HTTPS generat (ex: https://abc123.ngrok.io)
# Actualizează în .env:
# NETOPIA_CONFIRM_URL=https://abc123.ngrok.io/api/payment/netopia/confirm
```

## ✅ Checklist Final

- [ ] Backend pornit și funcționează
- [ ] Frontend pornit și funcționează
- [ ] .env configurat corect cu Signature și API Key
- [ ] Testat inițierea plății
- [ ] Redirect către Netopia funcționează
- [ ] Plata cu card de test funcționează
- [ ] Return URL funcționează
- [ ] Comanda este marcată ca "paid" în baza de date

