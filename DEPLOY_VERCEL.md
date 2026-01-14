# 🚀 Deploy pe Vercel - Ghid Complet

## 📋 Pași pentru Deploy

### 1. Pregătire Git și GitHub

```bash
# 1. Adaugă toate fișierele
git add .

# 2. Fă primul commit
git commit -m "Initial commit - Eori Cod app"

# 3. Creează un repo nou pe GitHub:
#    - Mergi pe https://github.com/new
#    - Nume repo: eori-cod (sau alt nume)
#    - Public sau Private (la alegere)
#    - NU adăuga README, .gitignore sau licență (le avem deja)

# 4. Adaugă remote și push
git remote add origin https://github.com/TU_USERNAME/eori-cod.git
git branch -M main
git push -u origin main
```

### 2. Deploy Frontend pe Vercel

1. **Mergi pe https://vercel.com**
   - Conectează-te cu contul GitHub
   - Click pe **"Add New Project"**

2. **Selectează repo-ul**
   - Alege repo-ul `eori-cod` din listă

3. **Configurează proiectul:**
   ```
   Framework Preset: Vite
   Root Directory: frontend
   Build Command: npm run build
   Output Directory: dist
   Install Command: npm install
   ```

4. **Environment Variables** (opțional pentru frontend):
   - `VITE_API_URL` - URL-ul backend-ului (dacă e separat)
   - Lasă gol dacă backend-ul va fi pe același domeniu cu rewrites

5. **Click "Deploy"** 🎉

6. **După deploy:**
   - Vercel va genera un URL: `https://eori-cod.vercel.app`
   - Poți seta un domeniu custom din Settings → Domains

### 3. Deploy Backend

#### Opțiunea A: Railway (Recomandat pentru MySQL) 🚂

1. Mergi pe https://railway.app
2. Conectează-te cu GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Selectează repo-ul `eori-cod`
5. Configurează:
   - **Root Directory**: `backend`
   - **Build Command**: `npm run build`
   - **Start Command**: `npm start`
6. Adaugă MySQL database din Railway
7. **Environment Variables**:
   ```
   PORT=6000
   DB_HOST=<din Railway MySQL>
   DB_USER=<din Railway MySQL>
   DB_PASSWORD=<din Railway MySQL>
   DB_NAME=eori_cod
   NETOPIA_SIGNATURE=<din Netopia>
   NETOPIA_PUBLIC_KEY=<din Netopia>
   NETOPIA_PRIVATE_KEY=<din Netopia>
   NETOPIA_SANDBOX=true (sau false pentru producție)
   NETOPIA_RETURN_URL=https://eori-cod.vercel.app/plata/success
   NETOPIA_CONFIRM_URL=https://backend-url.railway.app/api/payment/netopia/confirm
   ```
8. Deploy și copiază URL-ul backend-ului

#### Opțiunea B: Render 🎨

1. Mergi pe https://render.com
2. Conectează-te cu GitHub
3. Click "New" → "Web Service"
4. Selectează repo-ul
5. Configurează similar cu Railway

### 4. Conectare Frontend ↔ Backend

După ce ai URL-ul backend-ului:

1. **În Vercel Dashboard:**
   - Mergi la proiectul frontend
   - Settings → Environment Variables
   - Adaugă: `VITE_API_URL=https://backend-url.railway.app`

2. **Sau configurează rewrites în `vercel.json`:**
   - Rewrites-urile sunt deja configurate în `frontend/vercel.json`
   - Dacă backend-ul e pe același domeniu, funcționează automat

### 5. Configurare Database

1. **Creează baza de date:**
   ```sql
   CREATE DATABASE IF NOT EXISTS eori_cod;
   USE eori_cod;
   ```

2. **Rulează schema:**
   - Copiază conținutul din `backend/src/db/schema.sql`
   - Rulează-l în MySQL (din Railway sau alt serviciu)

### 6. Testare după Deploy

1. ✅ Verifică că frontend-ul se încarcă
2. ✅ Testează căutarea CUI
3. ✅ Testează formularul complet
4. ✅ Testează flow-ul de plată (în sandbox mode mai întâi)

## 🔧 Troubleshooting

### Frontend nu se conectează la backend
- Verifică `VITE_API_URL` în Environment Variables
- Verifică CORS în backend (trebuie să permită domeniul Vercel)
- Verifică că backend-ul rulează și e accesibil

### Erori de build
- Verifică că toate dependențele sunt în `package.json`
- Verifică că nu există erori de TypeScript
- Verifică logs-urile din Vercel Dashboard

### Database connection errors
- Verifică că variabilele de mediu sunt setate corect
- Verifică că baza de date e accesibilă din Railway/Render
- Verifică firewall-ul MySQL

## 📝 Note Importante

- **Netopia**: Folosește sandbox mode pentru testare
- **CORS**: Backend-ul trebuie să permită domeniul Vercel
- **Environment Variables**: Nu commit-ui `.env` files (sunt în `.gitignore`)
- **Assets**: Toate asset-urile (PDF-uri, imagini) trebuie să fie în `frontend/public/`

## 🎯 Next Steps

1. Deploy frontend pe Vercel ✅
2. Deploy backend pe Railway/Render ✅
3. Configurează domeniu custom (opțional)
4. Testează flow-ul complet
5. Activează Netopia în producție (când ești gata)

## 📞 Support

Dacă întâmpini probleme:
- Verifică logs-urile din Vercel Dashboard
- Verifică logs-urile din Railway/Render
- Verifică Network tab în browser pentru erori de API

