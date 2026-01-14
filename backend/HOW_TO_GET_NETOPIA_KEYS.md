# Cum să obții cheile Netopia

## Pasul 1: Accesează contul Netopia Sandbox

1. Mergi la: https://sandbox.netopia-payments.com
2. Loghează-te cu contul tău Netopia Sandbox

## Pasul 2: Descarcă cheia publică

1. Navighează la **"Securitate"** sau **"API"** sau **"Chei API"**
2. Caută secțiunea **"Cheia publică"** sau **"Public Key"**
3. Descarcă cheia publică (format `.cer` sau `.pem`)
4. Salvează fișierul ca: `netopia-public.cer`

## Pasul 3: Plasează cheia în proiect

1. Copiază fișierul `netopia-public.cer` în:
   ```
   /Users/PDS/Desktop/Beneficiar-App/backend/src/keys/netopia-public.cer
   ```

2. Sau setează calea în `.env`:
   ```env
   NETOPIA_PUBLIC_KEY_PATH=/calea/completa/catre/netopia-public.cer
   ```

## Pasul 4: Repornește backend-ul

```bash
cd backend
npm run dev
```

## Pasul 5: Testează plata

1. Creează o comandă nouă în aplicație
2. Apasă "Plătește"
3. Ar trebui să fii redirecționat către Netopia (nu la pagina de success direct)
4. Introdu datele cardului pe pagina Netopia
5. După plată, vei fi redirecționat înapoi
6. Plata va apărea în contul tău Netopia

## Important

- **În modul test** (fără cheie publică): Plata este simulată local, nu apare în Netopia
- **Cu cheie publică**: Plata este trimisă către Netopia real, clientul introduce cardul, plata apare în Netopia

## Unde găsesc cheia în Netopia?

Cheia publică se găsește de obicei în:
- **Dashboard Netopia** → **Securitate** → **Chei API**
- Sau **Setări** → **API** → **Cheia publică**
- Sau **Integrare** → **Chei de criptare**

Dacă nu o găsești, contactează suportul Netopia: support@netopia-payments.com

