# 🚀 Ghid Complet de Setup - Eori Cod App

## ✅ Verificare Prealabilă

### 1. Dependențe Node.js
Verifică dacă ai Node.js instalat:
```bash
node --version  # Ar trebui să fie v16 sau mai nou
npm --version
```

### 2. MySQL
Verifică dacă MySQL este instalat și pornit:
```bash
mysql --version
# Sau verifică dacă serviciul rulează
```

## 📦 Instalare Dependențe

Dacă nu ai instalat dependențele sau vrei să le reinstalezi:

```bash
# Din folderul root al proiectului
npm run install:all
```

Această comandă va instala:
- ✅ Dependențele root (concurrently)
- ✅ Dependențele frontend (React, Vite, etc.)
- ✅ Dependențele backend (Express, MySQL, etc.)

**Notă:** Dacă `node_modules` există deja, dependențele sunt probabil instalate. Poți sări peste acest pas dacă aplicația a funcționat anterior.

## 🗄️ Creare Bază de Date MySQL

### Pasul 1: Conectează-te la MySQL
```bash
mysql -u root -p
```

### Pasul 2: Creează baza de date și tabelele
```bash
# Din folderul root al proiectului
mysql -u root -p < backend/src/db/schema.sql
```

**Sau manual:**
```sql
-- Conectează-te la MySQL
mysql -u root -p

-- Rulează comanda:
source /Users/PDS/Desktop/Eori\ Cod/backend/src/db/schema.sql
```

### Verificare
După rularea scriptului, verifică că baza de date a fost creată:
```sql
SHOW DATABASES;
-- Ar trebui să vezi: eori_cod

USE eori_cod;
SHOW TABLES;
-- Ar trebui să vezi: orders, payments
```

## ⚙️ Configurare Variabile de Mediu

### Backend (.env)

Fișierul `backend/.env` este deja configurat cu:
- ✅ **DB_NAME=eori_cod** (baza de date corectă)
- ✅ **PORT=6000** (portul backend corect)
- ✅ **NETOPIA_RETURN_URL=http://localhost:4000/plata/success** (portul frontend corect)
- ✅ **NETOPIA_CONFIRM_URL=http://localhost:6000/api/payment/netopia/confirm** (portul backend corect)

**IMPORTANT:** Dacă ai parolă pentru MySQL, actualizează:
```env
DB_PASSWORD=parola_ta_mysql
```

## 🚀 Pornire Aplicație

### Opțiunea 1: Pornește ambele simultan (recomandat)
```bash
# Din folderul root
npm run dev
```

Aceasta va porni:
- Frontend pe **http://localhost:4000**
- Backend pe **http://localhost:6000**

### Opțiunea 2: Pornește separat

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```
Ar trebui să vezi: `🚀 Server running on port 6000`

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```
Ar trebui să vezi: `Local: http://localhost:4000/`

## ✅ Verificare Funcționare

### 1. Verifică Backend
```bash
curl http://localhost:6000/api/health
```
Ar trebui să returneze: `{"status":"ok","message":"Server is running"}`

### 2. Verifică Frontend
Deschide în browser: **http://localhost:4000**

### 3. Verifică Baza de Date
```bash
mysql -u root -p -e "USE eori_cod; SELECT COUNT(*) as orders_count FROM orders;"
```

## 🔍 Troubleshooting

### Problema: "Cannot find module"
**Soluție:** Rulează `npm run install:all`

### Problema: "Access denied for user 'root'@'localhost'"
**Soluție:** 
- Verifică parola în `backend/.env` (DB_PASSWORD)
- Sau creează un utilizator MySQL nou

### Problema: "Database 'eori_cod' doesn't exist"
**Soluție:** Rulează din nou:
```bash
mysql -u root -p < backend/src/db/schema.sql
```

### Problema: Portul este deja folosit
**Soluție:** 
- Fie oprește procesul care folosește portul
- Fie schimbă portul în `.env` și `vite.config.ts`

### Problema: Frontend nu se conectează la backend
**Soluție:** 
- Verifică că backend-ul rulează pe portul 6000
- Verifică că `frontend/vite.config.ts` are `target: 'http://localhost:6000'`

## 📝 Checklist Final

Înainte de a rula aplicația, verifică:

- [ ] Node.js este instalat (v16+)
- [ ] MySQL este instalat și pornit
- [ ] Dependențele sunt instalate (`npm run install:all`)
- [ ] Baza de date `eori_cod` este creată
- [ ] Tabelele `orders` și `payments` există
- [ ] Fișierul `backend/.env` este configurat corect
- [ ] Porturile 4000 și 6000 sunt libere
- [ ] Backend pornește fără erori
- [ ] Frontend pornește fără erori
- [ ] Poți accesa http://localhost:4000 în browser

## 🎯 Următorii Pași

După ce aplicația rulează:

1. **Testează o comandă** - Completează formularul și verifică fluxul
2. **Configurează Netopia** - Dacă vrei să testezi plățile reale
3. **Configurează Email** - Pentru trimiterea certificatelor

---

**Succes! 🎉**

