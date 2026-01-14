# Deploy pe Vercel

## Pași pentru deploy:

### 1. Inițializare Git și push pe GitHub

```bash
# Inițializează Git repo
git init

# Adaugă toate fișierele
git add .

# Commit
git commit -m "Initial commit - Eori Cod app"

# Creează un repo nou pe GitHub (https://github.com/new)
# Apoi adaugă remote și push:
git remote add origin https://github.com/TU_USERNAME/eori-cod.git
git branch -M main
git push -u origin main
```

### 2. Deploy Frontend pe Vercel

1. Mergi pe https://vercel.com și conectează-te cu GitHub
2. Click pe "Add New Project"
3. Selectează repo-ul `eori-cod`
4. Configurează:
   - **Root Directory**: `frontend`
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

5. Adaugă Environment Variables (dacă sunt necesare):
   - `VITE_API_URL` - URL-ul backend-ului (dacă e separat)

6. Click "Deploy"

### 3. Deploy Backend (opțiuni)

#### Opțiunea A: Backend separat pe Railway/Render
- Backend-ul poate rula pe Railway sau Render
- Setează variabilele de mediu acolo
- Actualizează `VITE_API_URL` în frontend cu URL-ul backend-ului

#### Opțiunea B: Backend ca Vercel Serverless Functions
- Backend-ul poate fi convertit în serverless functions
- Necesită refactorizare

### 4. Configurare după deploy

1. Actualizează URL-urile în cod:
   - Frontend: actualizează proxy-ul în `vite.config.ts` pentru producție
   - Backend: actualizează CORS pentru a permite domeniul Vercel

2. Variabile de mediu necesare:
   - `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`
   - `NETOPIA_*` keys
   - `PORT` (pentru backend)

### Note importante:
- Frontend-ul va fi disponibil pe un URL de tipul: `https://eori-cod.vercel.app`
- Backend-ul trebuie să fie accesibil public (dacă e separat)
- Verifică că toate asset-urile (PDF-uri, imagini) sunt în `public/`

