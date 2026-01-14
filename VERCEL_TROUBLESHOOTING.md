# 🔧 Troubleshooting Vercel Deploy

## Problema: 404 Error după deploy

### ✅ Soluții aplicate:

1. **Actualizat `vercel.json`** - Adăugat rewrite rule pentru SPA routing
2. **Creat `public/_redirects`** - Fallback pentru routing

### 📋 Verificări în Vercel Dashboard:

1. **Settings → General:**
   - ✅ **Root Directory**: Trebuie să fie `frontend` (NU root!)
   - ✅ **Framework Preset**: Vite
   - ✅ **Build Command**: `npm run build`
   - ✅ **Output Directory**: `dist`
   - ✅ **Install Command**: `npm install`

2. **Deployments → Latest Deployment:**
   - Click pe "Build Logs" - verifică dacă build-ul a reușit
   - Verifică dacă există erori de TypeScript sau build

3. **Settings → Environment Variables:**
   - Verifică dacă sunt setate corect (dacă ai nevoie)

### 🔄 Pași pentru fix:

1. **Commit și push modificările:**
   ```bash
   git add .
   git commit -m "Fix Vercel routing configuration"
   git push origin main
   ```

2. **În Vercel Dashboard:**
   - Vercel va detecta automat noul commit
   - Va face redeploy automat
   - SAU click manual "Redeploy" pe ultimul deployment

3. **Verifică build logs:**
   - Dacă vezi erori, le rezolvăm pas cu pas

### 🐛 Probleme comune:

#### Build fails:
- Verifică că toate dependențele sunt în `package.json`
- Verifică că nu există erori TypeScript
- Verifică logs-urile din Vercel

#### 404 pe toate rutele:
- Verifică că `vercel.json` este în folderul `frontend/`
- Verifică că rewrite rule este corect: `"source": "/(.*)", "destination": "/index.html"`

#### Assets nu se încarcă:
- Verifică că toate asset-urile sunt în `frontend/public/`
- Verifică că path-urile în cod folosesc `/` (nu `./`)

### 📞 Dacă problema persistă:

1. Verifică **Build Logs** în Vercel
2. Verifică **Runtime Logs** (dacă există)
3. Testează local: `npm run build && npm run preview`
4. Verifică că `dist/index.html` există după build

