# 📍 Cum să setezi Root Directory în Vercel

## 🎯 Pași exacti:

### 1. **Mergi la Settings**
   - În Vercel Dashboard, click pe **"Settings"** (în meniul de sus)
   - Sau direct: `https://vercel.com/[team-name]/[project-name]/settings`

### 2. **Build and Deployment Settings**
   - În sidebar-ul din stânga, click pe **"Build and Deployment Settings"**
   - Sau scroll în jos în pagina de Settings

### 3. **Găsește "Root Directory"**
   - Caută secțiunea **"Root Directory"**
   - Ar trebui să vezi un câmp cu text sau gol
   - Lângă el ar trebui să fie un buton **"Edit"** sau **"Override"**

### 4. **Setează Root Directory**
   - Click pe **"Edit"** sau **"Override"**
   - În câmpul care apare, scrie: `frontend`
   - **NU** pune `/frontend` sau `./frontend`, doar `frontend`
   - Click **"Save"** sau **"Update"**

### 5. **Așteaptă redeploy**
   - După ce salvezi, Vercel va face automat un nou deployment
   - Mergi la **"Deployments"** pentru a vedea progresul
   - Build-ul ar trebui să dureze mai mult acum (1-2 minute, nu 79ms)

## ⚠️ Dacă nu vezi opțiunea "Root Directory":

1. Verifică că ești pe pagina corectă: **Settings → Build and Deployment Settings**
2. Scroll în jos - poate fi mai jos pe pagină
3. Dacă tot nu o vezi, poate fi sub "Build Command" sau "Output Directory"

## ✅ Cum să verifici că e setat corect:

După ce setezi Root Directory:
1. Mergi la **Deployments**
2. Click pe ultimul deployment
3. Click pe **"Build Logs"**
4. Ar trebui să vezi:
   ```
   Installing dependencies...
   Running "npm run build"...
   Building...
   ✓ Build completed
   ```
   - Build time ar trebui să fie 1-2 minute, nu 79ms

## 📸 Unde exact în interfață:

```
Vercel Dashboard
├── Settings (meniu de sus)
    ├── General
    ├── Build and Deployment Settings ← AICI!
    │   ├── Build Command
    │   ├── Output Directory
    │   ├── Root Directory ← AICI setezi "frontend"
    │   └── Install Command
    └── ...
```

## 🔍 Screenshot location:

Dacă ai nevoie de ajutor, poți să faci un screenshot al paginii "Build and Deployment Settings" și îl trimite-mi.

