# ⚡ Quick Start - Deploy pe Vercel

## Pași rapizi:

### 1️⃣ Push pe GitHub

```bash
# Adaugă toate fișierele
git add .

# Commit
git commit -m "Ready for Vercel deploy"

# Creează repo pe GitHub (https://github.com/new)
# Apoi:
git remote add origin https://github.com/TU_USERNAME/eori-cod.git
git branch -M main
git push -u origin main
```

### 2️⃣ Deploy Frontend pe Vercel

1. Mergi pe **https://vercel.com** → Login cu GitHub
2. **Add New Project** → Selectează repo-ul
3. Configurare:
   - **Root Directory**: `frontend` ⚠️ IMPORTANT
   - **Framework**: Vite (auto-detectat)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. **Deploy** 🚀

### 3️⃣ Deploy Backend pe Railway

1. Mergi pe **https://railway.app** → Login cu GitHub
2. **New Project** → **Deploy from GitHub repo**
3. Selectează repo-ul → **Root Directory**: `backend`
4. Adaugă **MySQL** din Railway
5. **Environment Variables**:
   ```
   PORT=6000
   DB_HOST=<din Railway MySQL>
   DB_USER=<din Railway MySQL>
   DB_PASSWORD=<din Railway MySQL>
   DB_NAME=eori_cod
   FRONTEND_URL=https://eori-cod.vercel.app
   NETOPIA_SIGNATURE=<cheia ta>
   NETOPIA_PUBLIC_KEY=<cheia ta>
   NETOPIA_PRIVATE_KEY=<cheia ta>
   NETOPIA_SANDBOX=true
   NETOPIA_RETURN_URL=https://eori-cod.vercel.app/plata/success
   NETOPIA_CONFIRM_URL=https://backend-url.railway.app/api/payment/netopia/confirm
   ```
6. Copiază URL-ul backend-ului

### 4️⃣ Conectează Frontend ↔ Backend

În **Vercel Dashboard** → **Settings** → **Environment Variables**:
- Adaugă: `VITE_API_URL=https://backend-url.railway.app`
- **Redeploy** proiectul

### 5️⃣ Database Setup

În Railway MySQL, rulează:
```sql
-- Copiază conținutul din backend/src/db/schema.sql
CREATE DATABASE IF NOT EXISTS eori_cod;
USE eori_cod;
-- ... restul comenzilor SQL
```

## ✅ Gata!

Aplicația ta ar trebui să fie live pe:
- **Frontend**: `https://eori-cod.vercel.app`
- **Backend**: `https://backend-url.railway.app`

## 🔍 Testare

1. Deschide frontend-ul în browser
2. Testează căutarea CUI
3. Completează formularul
4. Testează flow-ul de plată (sandbox mode)

## 📚 Documentație completă

Vezi `DEPLOY_VERCEL.md` pentru detalii complete și troubleshooting.

